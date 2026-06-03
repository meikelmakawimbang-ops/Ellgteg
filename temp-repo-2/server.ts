import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import * as BaileysNamespace from "@whiskeysockets/baileys";

// Robust detection of makeWASocket function
const getMakeWASocket = () => {
    const b = BaileysNamespace as any;
    // Try named export first
    if (typeof b.makeWASocket === 'function') return b.makeWASocket;
    // Try default export as function
    if (typeof b.default === 'function') return b.default;
    // Try nested default (ESM/CJS interop)
    if (b.default && typeof b.default.makeWASocket === 'function') return b.default.makeWASocket;
    if (b.default && typeof b.default.default === 'function') return b.default.default;
    // Extreme fallback
    return b.default || b;
};

const makeWASocket = getMakeWASocket();

// Extract other utilities safely
const BaileysUtils = (BaileysNamespace as any).default || BaileysNamespace;
const { 
    DisconnectReason, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers,
    downloadMediaMessage,
    proto
} = BaileysNamespace as any; // Usually these are named exports or on the main object
import { Boom } from "@hapi/boom";
import pino from "pino";
import QRCode from "qrcode";
import fs from "fs";
import axios from "axios";
import { Sticker, createSticker, StickerTypes } from "wa-sticker-formatter";
import mongoose from "mongoose";

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY || "";
let model: any = null;

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

// Removed redundant global load calls
// loadSettings();
// loadCVs();

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
    
    await loadSettings();
    await loadCVs();
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
        });

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
            try {
                const msg = m.messages[0];
                if (!msg.message || (msg.key && msg.key.fromMe)) return;

                const jid = msg.key.remoteJid;

                // Auto Read & Auto Reaction
                if (botSettings.autoRead) {
                    await sock.readMessages([msg.key]);
                }
                if (botSettings.autoReaction && msg.key.id) {
                    const emojis = ['✨', '🔥', '❤️', '😂', '👍', '🙏', '💯', '🚀', '⭐', '⚡', '🤖', '👑'];
                    const reaction = botSettings.reactionEmoji === 'random' 
                        ? emojis[Math.floor(Math.random() * emojis.length)] 
                        : botSettings.reactionEmoji;
                        
                    await sock.sendMessage(jid, {
                        react: {
                            text: reaction,
                            key: msg.key
                        }
                    });
                }

                const text = msg.message.conversation || 
                             msg.message.extendedTextMessage?.text || 
                             msg.message.imageMessage?.caption || 
                             msg.message.videoMessage?.caption;

                if (!text) return;

                const isGroup = jid.endsWith("@g.us");
                const sender = isGroup ? msg.key.participant : jid;
                const pushname = msg.pushName || "User";

                console.log(`[MSG] from ${pushname} (${jid}): ${text}`);

                // Leveling Logic
                if (mongoURI && mongoose.connection.readyState === 1) {
                    try {
                        let userData = await UserModel.findOne({ jid: sender });
                        if (!userData) {
                            userData = new UserModel({ jid: sender });
                        }
                        
                        const xpGain = Math.floor(Math.random() * 11) + 5; // 5-15 XP
                        userData.xp += xpGain;
                        userData.messages += 1;
                        userData.lastChat = new Date();
                        
                        const requiredXp = userData.level * 100;
                        if (userData.xp >= requiredXp) {
                            userData.level += 1;
                            userData.xp = 0;
                            await sock.sendMessage(jid, { 
                                text: `🎉 Selamat *${pushname}*! Anda naik ke level *${userData.level}*!\n\nKetik .profile untuk cek status terbaru.`,
                                mentions: [sender]
                            }, { quoted: msg });
                        }
                        await userData.save();
                    } catch (e) {
                        console.error("Leveling Error:", e);
                    }
                }

                const prefixes = [process.env.VITE_BOT_PREFIX || "!", "."];
                const usedPrefix = prefixes.find(p => text.startsWith(p));
                const reply = async (content: string) => {
                    await sock.sendMessage(jid, { text: content }, { quoted: msg });
                };

                // 👑 OWNER COMMAND (Auto Share Contact)
                if (text.toLowerCase() === (usedPrefix || "!") + "owner" || text.toLowerCase() === "owner") {
                    const ownerNumber = "6281245695410"; 
                    const vcard = 'BEGIN:VCARD\n'
                        + 'VERSION:3.0\n' 
                        + 'FN:Official Owner (ellBot-MK)\n' 
                        + 'ORG:ellBot-MK;\n'
                        + `TEL;type=CELL;type=VOICE;waid=${ownerNumber}:+${ownerNumber}\n` 
                        + 'END:VCARD';
                    
                    await sock.sendMessage(jid, { 
                        contacts: { 
                            displayName: 'Official Owner', 
                            contacts: [{ vcard }] 
                        }
                    }, { quoted: msg });
                    return;
                }

                // 📂 PLUGIN LOADER LOGIC
                if (usedPrefix) {
                    const [command, ...args] = text.slice(usedPrefix.length).trim().split(/\s+/);
                    const cmd = command.toLowerCase();
                    const q = args.join(" ");

                    const pluginsDir = path.join(process.cwd(), "plugins");
                    if (fs.existsSync(pluginsDir)) {
                        const files = fs.readdirSync(pluginsDir);
                        for (const file of files) {
                            if (file.endsWith(".ts") || file.endsWith(".js")) {
                                try {
                                    const plugin = await import(path.join(pluginsDir, file));
                                    if (plugin.default && typeof plugin.default === "function") {
                                        const result = await plugin.default({
                                            cmd, q, args, sock, msg, jid, pushname, prefix: usedPrefix, isGroup, sender, model, botSettings, saveSettings, saveCV, reply, downloadMediaMessage, UserModel
                                        });
                                        if (result) return; 
                                    }
                                } catch (e) {
                                    console.error(`Error loading plugin ${file}:`, e);
                                }
                            }
                        }
                    }
                }

                // AUTO-REPLY LOGIC (Greeting & VN)
                if (!usedPrefix) {
                    // AUTO-STICKER LOGIC
                    if (botSettings.autoSticker && (msg.message?.imageMessage || msg.message?.videoMessage)) {
                        try {
                            const media = await downloadMediaMessage(msg, 'buffer', {});
                            const sticker = new Sticker(media as Buffer, {
                                pack: "Auto Sticker",
                                author: pushname,
                                type: StickerTypes.FULL,
                                quality: 50,
                            });
                            const stickerBuffer = await sticker.toBuffer();
                            await sock.sendMessage(jid, { sticker: stickerBuffer }, { quoted: msg });
                            return; // Don't send auto-reply if auto-sticker was processed
                        } catch (e) {
                            console.error("Auto Sticker Error:", e);
                        }
                    }

                    const vnPath = path.join(mediaPath, "welcome.mp3");
                    const groupVnPath = path.join(mediaPath, "group_welcome.mp3");
                    
                    // Logic: If group, check group_welcome. If private, check welcome.
                    const targetVn = isGroup ? groupVnPath : vnPath;
                    const canReply = !isGroup || fs.existsSync(groupVnPath); // Only auto-reply in groups if VN exists (to prevent spam)

                    if (canReply) {
                        const prefixHelp = prefixes[0];
                        console.log(`[AUTO-REPLY] to ${jid} (isGroup: ${isGroup})`);
                        
                        // Send Greeting Text
                        await reply(`Halo kak *${pushname}*! 👋\n\nSaya adalah *ellBot-MK*, asisten WhatsApp AI Anda. Ketik *${prefixHelp}menu* untuk melihat daftar fitur yang tersedia.\n\nContoh: *${prefixHelp}ai Apa itu AI?*`);

                        if (fs.existsSync(targetVn)) {
                            await sock.sendMessage(jid, { 
                                audio: { url: targetVn }, 
                                mimetype: 'audio/mpeg', 
                                ptt: true 
                            }, { quoted: msg });
                        }
                    }
                }
            } catch (err) {
                console.error("Handler Error:", err);
            }
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
