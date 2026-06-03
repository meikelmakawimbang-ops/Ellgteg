import axios from "axios";
import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";
import fs from "fs";

export default async function ({ cmd, q, reply, sock, jid, msg, prefix }: any) {
    if (cmd === "nulis") {
        if (!q) return reply(`Contoh:\n${prefix}nulis Halo dunia`);
        
        try {
            const inputPath = path.join(process.cwd(), "media/kertas.jpg");
            const fontPath = path.join(process.cwd(), "media/font.ttf");

            // Ensure media folder exists
            if (!fs.existsSync(path.join(process.cwd(), "media"))) {
                 fs.mkdirSync(path.join(process.cwd(), "media"));
            }

            // Fallback download if assets missing
            if (!fs.existsSync(inputPath) || !fs.existsSync(fontPath)) {
                reply("📥 Menyiapkan aset nulis (pertama kali), mohon tunggu...");
                if (!fs.existsSync(fontPath)) {
                    const fontRes = await axios.get('https://github.com/google/fonts/raw/main/ofl/indieflower/IndieFlower-Regular.ttf', { responseType: 'arraybuffer' });
                    fs.writeFileSync(fontPath, Buffer.from(fontRes.data));
                }
                if (!fs.existsSync(inputPath)) {
                    const imgRes = await axios.get('https://raw.githubusercontent.com/ilmanhdme/bot-whatsapp/master/media/nulis/kertas.jpg', { responseType: 'arraybuffer' });
                    fs.writeFileSync(inputPath, Buffer.from(imgRes.data));
                }
            }

            reply("✍️ Sedang menulis, mohon tunggu...");

            // Register font
            registerFont(fontPath, { family: "Handwriting" });

            const image = await loadImage(inputPath);
            const canvas = createCanvas(image.width, image.height);
            const ctx = canvas.getContext("2d");

            ctx.drawImage(image, 0, 0, image.width, image.height);

            const d = new Date();
            const tgl = d.toLocaleDateString("id-ID");
            const hari = d.toLocaleDateString("id-ID", { weekday: "long" });

            // Set Date
            ctx.font = "20px Handwriting";
            ctx.fillStyle = "blue";
            ctx.fillText(hari, 806, 78);
            ctx.font = "18px Handwriting";
            ctx.fillText(tgl, 806, 102);

            // Set Text
            ctx.font = "20px Handwriting";
            const words = q.split(" ");
            let line = "";
            let x = 344;
            let y = 142;
            const lineHeight = 25; // Adjusted line spacing

            for (let n = 0; n < words.length; n++) {
                let testLine = line + words[n] + " ";
                let metrics = ctx.measureText(testLine);
                let testWidth = metrics.width;
                if (testWidth > 600 && n > 0) { // Wrap if too wide
                    ctx.fillText(line, x, y);
                    line = words[n] + " ";
                    y += lineHeight;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, x, y);

            const buffer = canvas.toBuffer("image/jpeg");
            await sock.sendMessage(jid, {
                image: buffer,
                caption: "✍️ Lainkali nulis sendiri😎"
            }, { quoted: msg });

        } catch (err) {
            console.error(err);
            reply("❌ Error saat menulis: " + (err as Error).message);
        }
        return true;
    }

    if (cmd === "tr" || cmd === "translate") {
        if (!q) return reply(`Contoh: ${prefix}tr en Halo`);
        const trArgs = q.split(" ");
        const toLang = trArgs[0];
        const trText = trArgs.slice(1).join(" ");
        try {
            const trResult = await axios.get(`https://api.popcat.xyz/translate?to=${toLang}&text=${encodeURIComponent(trText)}`);
            reply(trResult.data.translated);
        } catch (e) {
            reply("Gagal menerjemahkan.");
        }
        return true;
    }

    if (cmd === "wiki") {
        if (!q) return reply("Masukkan apa yang ingin dicari di Wikipedia.");
        try {
            const wikiRes = await axios.get(`https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`);
            if (wikiRes.data && wikiRes.data.extract) {
                reply(`*Wikipedia: ${wikiRes.data.title}*\n\n${wikiRes.data.extract}`);
            } else {
                reply("Tidak ditemukan hasil di Wikipedia.");
            }
        } catch (e) {
            reply("Gagal mencari di Wikipedia.");
        }
        return true;
    }

    if (cmd === "ttp") {
        if (!q) return reply(`Gunakan ${prefix}ttp <teks>`);
        try {
            reply("Memproses TTP...");
            const ttpUrl = `https://api.siputzx.my.id/api/canvas/ttp?text=${encodeURIComponent(q)}`;
            // Many APIs return a sticker compatible image
            await sock.sendMessage(jid, { sticker: { url: ttpUrl } }, { quoted: msg });
        } catch (e: any) {
            console.error("TTP Error:", e.message);
            reply("Error saat membuat TTP.");
        }
        return true;
    }
    
    return false;
}
