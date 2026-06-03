import { Sticker, StickerTypes } from "wa-sticker-formatter";

export default async function ({ cmd, q, botSettings, saveSettings, reply, sock, jid, msg, downloadMediaMessage, pushname, prefix }: any) {
    if (cmd === "setsticker") {
        if (!q) return reply(`Gunakan ${prefix}setsticker on atau off`);
        botSettings.stickerEnabled = q.toLowerCase() === "on";
        await saveSettings();
        reply(`Fitur Sticker berhasil di${botSettings.stickerEnabled ? "aktifkan" : "matikan"}.`);
        return true;
    }

    if (cmd === "setautosticker") {
        if (!q) return reply(`Gunakan ${prefix}setautosticker on atau off`);
        botSettings.autoSticker = q.toLowerCase() === "on";
        await saveSettings();
        reply(`Fitur Auto-Sticker berhasil di${botSettings.autoSticker ? "aktifkan" : "matikan"}. Jika aktif, kirim gambar/video otomatis jadi stiker.`);
        return true;
    }

    if (cmd === "ttp") {
        if (!q) return reply(`Masukkan teks! Contoh: ${prefix}ttp ellbot`);
        try {
            await reply("Sedang membuat stiker teks... ⏳");
            const ttpUrl = `https://api.lolhuman.xyz/api/ttp?apikey=free&text=${encodeURIComponent(q)}`;
            const sticker = new Sticker(ttpUrl, {
                pack: "Text Sticker",
                author: pushname,
                type: StickerTypes.FULL,
                quality: 50,
            });
            const stickerBuffer = await sticker.toBuffer();
            await sock.sendMessage(jid, { sticker: stickerBuffer }, { quoted: msg });
        } catch (e) {
            console.error(e);
            reply("Gagal membuat stiker teks.");
        }
        return true;
    }

    if (cmd === "s" || cmd === "sticker" || cmd === "stiker") {
        if (!botSettings.stickerEnabled) return reply("Fitur Stiker sedang dimatikan oleh admin.");
        
        let mediaObj = msg;
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (quoted) {
            mediaObj = { message: quoted };
        }

        const isImage = mediaObj.message?.imageMessage;
        const isVideo = mediaObj.message?.videoMessage;

        if (!isImage && !isVideo) return reply(`Kirim/Balas gambar atau video pendek dengan caption ${prefix}sticker`);
        
        try {
            const media = await downloadMediaMessage(
                mediaObj,
                'buffer',
                {}
            );
            
            const sticker = new Sticker(media as Buffer, {
                pack: "WhatsApp AI Pro",
                author: pushname,
                type: StickerTypes.FULL,
                quality: 50,
            });
            
            const stickerBuffer = await sticker.toBuffer();
            await sock.sendMessage(jid, { sticker: stickerBuffer }, { quoted: msg });
        } catch (e) {
            console.error(e);
            reply("Gagal mengonversi ke stiker. Pastikan video tidak terlalu panjang.");
        }
        return true;
    }
    
    return false;
}
