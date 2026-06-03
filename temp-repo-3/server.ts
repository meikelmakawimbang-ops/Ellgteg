import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import * as BaileysNamespace from "@whiskeysockets/baileys";
import { fileURLToPath } from "url";
import { Boom } from "@hapi/boom";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pino from "pino";
import QRCode from "qrcode";
import fs from "fs";
import axios from "axios";
import { Sticker, createSticker, StickerTypes } from "wa-sticker-formatter";
import mongoose from "mongoose";
import { smsg } from "./lib/simple.js";
import "./lib/db.js";
import "./config.js";
import { handler, participantsUpdate, groupsUpdate, callUpdate, deleteUpdate } from "./handler.js";

// Robust detection of makeWASocket function
const getMakeWASocket = () => {
    const b = BaileysNamespace as any;
    if (typeof b.makeWASocket === 'function') return b.makeWASocket;
    if (typeof b.default === 'function') return b.default;
    if (b.default && typeof b.default.makeWASocket === 'function') return b.default.makeWASocket;
    if (b.default && typeof b.default.default === 'function') return b.default.default;
    return b.default || b;
};

const makeWASocket = getMakeWASocket();

const BaileysUtils = (BaileysNamespace as any).default || BaileysNamespace;
const { 
    DisconnectReason, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers,
    downloadMediaMessage,
    proto,
    jidNormalizedUser,
    generateWAMessageFromContent,
    getContentType
} = BaileysNamespace as any;

// Global Variables
global.plugins = {};
global.opts = {
    prefix: [".", "!", "/"]
};
(global as any).__filename = function (path: string, resolve = false) {
    return resolve ? fileURLToPath(path) : path;
};

// Plugin Loader for ellBot-MK compatibility
const loadPlugins = async () => {
    const isProduction = process.env.NODE_ENV === "production";
    const pluginsDir = path.join(process.cwd(), isProduction ? "dist/plugins" : "plugins");
    const extension = isProduction ? ".js" : ".ts";
    
    console.log(`Loading plugins from: ${pluginsDir} (Ext: ${extension})`);

    if (fs.existsSync(pluginsDir)) {
        const files = fs.readdirSync(pluginsDir);
        for (const file of files) {
            if (file.endsWith(extension) && !file.startsWith("_")) {
                try {
                    const pluginModule = await import(path.join(pluginsDir, file));
                    const pluginFunc = pluginModule.default || pluginModule;
                    
                    if (typeof pluginFunc === "function") {
                        // Wrapper for legacy plugins
                        const wrappedPlugin = async function(m: any, extra: any) {
                            const { command, text, args, conn, usedPrefix } = extra;
                            const isGroup = m.isGroup;
                            const sender = m.sender;
                            const pushname = m.name;
                            const jid = m.chat;
                            
                            // Call legacy function with its expected arguments
                            return await pluginFunc({
                                cmd: command,
                                q: text,
                                args,
                                sock: conn,
                                msg: m,
                                jid,
                                pushname,
                                prefix: usedPrefix,
                                isGroup,
                                sender,
                                model, // Gemini model from server.ts
                                botSettings, // from server.ts
                                saveSettings,
                                saveCV,
                                reply: (content: string) => conn.sendMessage(jid, { text: content }, { quoted: m }),
                                downloadMediaMessage,
                                UserModel
                            });
                        };
                        
                        // Copy metadata if it exists, otherwise set defaults
                        wrappedPlugin.command = pluginFunc.command || /.*/; // Match anything if not specified
                        wrappedPlugin.rowner = pluginFunc.rowner;
                        wrappedPlugin.owner = pluginFunc.owner;
                        wrappedPlugin.mods = pluginFunc.mods;
                        wrappedPlugin.premium = pluginFunc.premium;
                        wrappedPlugin.group = pluginFunc.group;
                        wrappedPlugin.private = pluginFunc.private;
                        wrappedPlugin.admin = pluginFunc.admin;
                        wrappedPlugin.botAdmin = pluginFunc.botAdmin;
                        wrappedPlugin.before = pluginFunc.before;
                        wrappedPlugin.all = pluginFunc.all;
                        
                        global.plugins[file] = wrappedPlugin;
                    } else {
                        global.plugins[file] = pluginFunc;
                    }
                } catch (e) {
                    console.error(`Error loading plugin ${file}:`, e);
                }
            }
        }
    }
};

// Initialize Gemini
let model: any = null;

// Persistent Settings
const SETTINGS_FILE = "./bot_settings.json";
const CV_STORAGE_FILE = "./cv_storage.json";

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || "mongodb+srv://Bebas:tiktok13@cluster0.jmthq2c.mongodb.net/?appName=Cluster0";

if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI env var is missing, using fallback URI provided by user.");
}

// MongoDB Schemas
const SettingSchema = new mongoose.Schema({
    id: { type: String, default: 'bot_settings' },
    aiEnabled: { type: Boolean, default: true },
    stickerEnabled: { type: Boolean, default: true },
    autoSticker: { type: Boolean, default: false },
    nulisEnabled: { type: Boolean, default: true },
    downloaderEnabled: { type: Boolean, default: true },
    autoRead: { type: Boolean, default: false },
    autoReaction: { type: Boolean, default: false },
    reactionEmoji: { type: String, default: 'random' }
});

const CVSchema = new mongoose.Schema({
    cvId: String,
    data: Object
});

const SettingModel = mongoose.model('Setting', SettingSchema);
const CVModel = mongoose.model('CV', CVSchema);

const UserSchema = new mongoose.Schema({
    jid: { type: String, unique: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    messages: { type: Number, default: 0 },
    lastChat: { type: Date, default: Date.now }
});

const UserModel = mongoose.model('User', UserSchema);

let botSettings = {
    aiEnabled: true,
    stickerEnabled: true,
    autoSticker: false,
    nulisEnabled: true,
    downloaderEnabled: true,
    autoRead: false,
    autoReaction: false,
    reactionEmoji: 'random'
};

let cvStorage: Record<string, any> = {};

// Load Initial Settings
const loadSettings = async () => {
    if (mongoURI && mongoose.connection.readyState === 1) {
        try {
            const settings = await SettingModel.findOne({ id: 'bot_settings' });
            if (settings) {
                botSettings = {
                    aiEnabled: settings.aiEnabled,
                    stickerEnabled: settings.stickerEnabled,
                    autoSticker: settings.autoSticker,
                    nulisEnabled: settings.nulisEnabled,
                    downloaderEnabled: settings.downloaderEnabled,
                    autoRead: settings.autoRead || false,
                    autoReaction: settings.autoReaction || false,
                    reactionEmoji: settings.reactionEmoji || 'random'
                };
            } else {
                await new SettingModel(botSettings).save();
            }
        } catch (e) {
            console.error("Error loading settings from MongoDB:", e);
        }
    } else if (fs.existsSync(SETTINGS_FILE)) {
        try {
            botSettings = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
        } catch (e) {
            console.error("Error reading settings:", e);
        }
    }
};

const loadCVs = async () => {
    if (mongoURI && mongoose.connection.readyState === 1) {
        try {
            const cvs = await CVModel.find({});
            cvs.forEach(cv => {
                if (cv.cvId) cvStorage[cv.cvId] = cv.data;
            });
        } catch (e) {
            console.error("Error loading CVs from MongoDB:", e);
        }
    } else if (fs.existsSync(CV_STORAGE_FILE)) {
        try {
            cvStorage = JSON.parse(fs.readFileSync(CV_STORAGE_FILE, "utf-8"));
        } catch (e) {
            console.error("Error reading CV storage:", e);
        }
    }
};

const saveSettings = async () => {
    if (mongoURI && mongoose.connection.readyState === 1) {
        try {
            await SettingModel.findOneAndUpdate({ id: 'bot_settings' }, botSettings, { upsert: true });
        } catch (e) {
            console.error("Error saving settings to MongoDB:", e);
        }
    } else {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(botSettings, null, 2));
    }
};

const saveCV = async (id: string, data: any) => {
    cvStorage[id] = data;
    if (mongoURI && mongoose.connection.readyState === 1) {
        try {
            await CVModel.findOneAndUpdate({ cvId: id }, { data }, { upsert: true });
        } catch (e) {
            console.error("Error saving CV to MongoDB:", e);
        }
    } else {
        fs.writeFileSync(CV_STORAGE_FILE, JSON.stringify(cvStorage, null, 2));
    }
};

async function startServer() {
    await loadSettings();
    await loadCVs();
    await loadPlugins();
    
    // Initialize Gemini
    const apiKey = process.env.GEMINI_API_KEY || "";
    if (apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            console.log("Gemini AI initialized.");
        } catch (e) {
            console.error("Gemini Init Error:", e);
        }
    } else {
        console.warn("GEMINI_API_KEY is missing.");
    }

    if (mongoURI) {
        try {
            const maskedURI = mongoURI.replace(/:([^@]+)@/, ":****@");
            console.log("Attempting to connect to MongoDB with URI:", maskedURI);
            await mongoose.connect(mongoURI, {
                serverSelectionTimeoutMS: 5000,
            });
            console.log("Connected to MongoDB.");
        } catch (err: any) {
            console.error("Initial MongoDB Connection Error:", err.message);
            if (err.message.includes("bad auth")) {
                console.error(">>> ERROR: PASSWORD MONGODB SALAH! <<<");
                console.error("Cek kembali apakah password 'Bebas123' sudah benar di MongoDB Atlas.");
            } else if (err.message.includes("timeout")) {
                console.error(">>> ERROR: TIMEOUT KONEKSI MONGODB! <<<");
                console.error("Biasanya ini karena IP Railway belum di-whitelist di MongoDB Atlas.");
            }
        }
    }
    
    await global.loadDatabase();
    const app = express();
    const server = createServer(app);
    const io = new Server(server);
    const PORT = 3000;

    const sessionPath = "./wa_session";
    const mediaPath = "./media";
    if (!fs.existsSync(sessionPath)) {
        fs.mkdirSync(sessionPath);
    }
    if (!fs.existsSync(mediaPath)) {
        fs.mkdirSync(mediaPath);
    }

    const { state, saveCreds } = await useMultiFileAuthState(path.join(sessionPath, 'auth_info'));
    const { version } = await fetchLatestBaileysVersion();

    let sock: any = null;
    let qrCode: string | null = null;
    let connectionStatus = "Disconnected";

    const connectToWhatsApp = async () => {
        console.log("Connecting to WhatsApp...");
        connectionStatus = "Connecting";
        io.emit("status", connectionStatus);

        const { version } = await fetchLatestBaileysVersion();

        sock = makeWASocket({
            version,
            logger: pino({ level: "silent" }),
            printQRInTerminal: true,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
            },
            browser: Browsers.macOS("Desktop"),
            syncFullHistory: false,
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
        });

        // Augment sock for handler.js
        sock.decodeJid = (jid: string) => {
            if (!jid) return jid;
            if (/:\d+@/gi.test(jid)) {
                let decode = jidNormalizedUser(jid);
                return decode;
            }
            return jid;
        };

        sock.getFile = async (PATH: string, returnAsBuffer: boolean) => {
            let res, data;
            if (Buffer.isBuffer(PATH)) return returnAsBuffer ? { data: PATH } : PATH;
            if (fs.existsSync(PATH)) return returnAsBuffer ? { data: fs.readFileSync(PATH) } : PATH;
            res = await axios.get(PATH, { responseType: 'arraybuffer' });
            data = Buffer.from(res.data);
            return returnAsBuffer ? { data } : data;
        };

        sock.pushMessage = async (m: any) => {
            if (!m) return;
            if (!Array.isArray(m)) m = [m];
            for (const msg of m) {
                // simple push message logic
            }
        };

        sock.parseMention = (text = '') => {
            return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net');
        };

        sock.reply = (jid: string, text: string, quoted: any, options: any = {}) => {
            console.log(`[DEBUG] Replying to ${jid} with text: ${text.slice(0, 50)}...`);
            return sock.sendMessage(jid, { text, mentions: sock.parseMention(text), ...options }, { quoted, ...options });
        };

        sock.copyNForward = async (jid: string, message: any, forceForward = false, options: any = {}) => {
            let vtype;
            if (options.readViewOnce) {
                message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined);
                vtype = Object.keys(message.message.viewOnceMessage.message)[0];
                delete message.message.viewOnceMessage.message[vtype].viewOnce;
                message.message = {
                    ...message.message.viewOnceMessage.message
                };
            }
            let mtype = Object.keys(message.message)[0];
            let content = await generateWAMessageFromContent(jid, message.message, { userJid: sock.user.id, ...options });
            let forwarded = await sock.relayMessage(jid, content.message, { messageId: content.key.id, ...options });
            return forwarded;
        };

        global.conn = sock;

        sock.ev.on("connection.update", async (update: any) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                qrCode = await QRCode.toDataURL(qr);
                io.emit("qr", qrCode);
                connectionStatus = "Waiting for Scan";
                io.emit("status", connectionStatus);
            }

            if (connection === "close") {
                const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                
                console.log(`Connection closed (Status: ${statusCode}). Reconnecting: ${shouldReconnect}`);
                
                qrCode = null;
                connectionStatus = "Disconnected";
                io.emit("status", connectionStatus);
                io.emit("qr", null);

                if (statusCode === DisconnectReason.restartRequired) {
                    connectToWhatsApp();
                } else if (shouldReconnect) {
                    // Force logout/clear session if session is invalid or bad
                    if (statusCode === 401 || statusCode === DisconnectReason.badSession) {
                        console.log("Session invalid, clearing session folder...");
                        try {
                            fs.rmSync(sessionPath, { recursive: true, force: true });
                        } catch (e) {}
                    }
                    
                    console.log("Waiting 5s before reconnecting...");
                    setTimeout(() => connectToWhatsApp(), 5000);
                }
            } else if (connection === "open") {
                console.log("Opened connection");
                qrCode = null;
                connectionStatus = "Connected";
                io.emit("status", connectionStatus);
                io.emit("qr", null);
            }
        });

        sock.ev.on("creds.update", saveCreds);

        sock.ev.on("messages.upsert", async (m: any) => {
            if (m.type === 'notify') {
                console.log(`[DEBUG] Message received from ${m.messages[0]?.key.remoteJid}`);
            }
            await handler.call(sock, m);
        });

        sock.ev.on("group-participants.update", async (m: any) => {
            await participantsUpdate.call(sock, m);
        });

        sock.ev.on("groups.update", async (m: any) => {
            await groupsUpdate.call(sock, m);
        });

        sock.ev.on("call", async (m: any) => {
            await callUpdate.call(sock, m);
        });

        sock.ev.on("message.delete", async (m: any) => {
            await deleteUpdate.call(sock, m);
        });
    };

    connectToWhatsApp();

    // API Routes
    app.get("/api/status", (req, res) => {
        res.json({ status: connectionStatus, qr: qrCode });
    });

    app.get("/api/cv/:id", (req, res) => {
        const cv = cvStorage[req.params.id];
        if (cv) {
            res.json(cv);
        } else {
            res.status(404).json({ error: "CV not found" });
        }
    });

    app.post("/api/cv", express.json(), (req, res) => {
        const id = Math.random().toString(36).substring(7);
        saveCV(id, req.body);
        res.json({ id });
    });

    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: "spa",
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), "dist");
        app.use(express.static(distPath));
        app.get("*", (req, res) => {
            res.sendFile(path.join(distPath, "index.html"));
        });
    }

    io.on("connection", (socket) => {
        socket.emit("status", connectionStatus);
        socket.emit("qr", qrCode);
    });

    server.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
}

startServer();
