import QRCode from "qrcode";
import axios from "axios";
import FormData from "form-data";

export default async function ({ cmd, q, reply, sock, jid, msg, downloadMediaMessage }: any) {
    if (cmd === "tourl" || cmd === "tolink") {
        let targetMsg = msg;
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quoted) {
            targetMsg = { message: quoted };
        }

        const isImage = targetMsg.message?.imageMessage;
        const isVideo = targetMsg.message?.videoMessage;

        if (!isImage && !isVideo) return reply("Balas atau kirim gambar/video untuk dijadikan link.");
        
        try {
            await reply("Sedang mengupload... ⏳");
            const media = await downloadMediaMessage(targetMsg, 'buffer', {});
            const form = new FormData();
            form.append("file", media, { filename: "media" });
            
            const { data } = await axios.post("https://telegra.ph/upload", form, {
                headers: form.getHeaders()
            });
            
            if (data && data[0] && data[0].src) {
                const url = "https://telegra.ph" + data[0].src;
                reply(`*Upload Success!* 🚀\n\nLink: ${url}`);
            } else {
                reply("Gagal mengupload media. Mungkin ukuran terlalu besar.");
            }
        } catch (e) {
            console.error(e);
            reply("Terjadi kesalahan saat mengupload.");
        }
        return true;
    }

    if (cmd === "toqr") {
        let textToQR = q;
        
        // Check if there's a quoted or sent image
        let targetMsg = msg;
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quoted) {
            targetMsg = { message: quoted };
        }
        
        const isImage = targetMsg.message?.imageMessage || targetMsg.message?.videoMessage;
        
        if (isImage) {
            try {
                await reply("Mengupload media untuk dijadikan QR... ⏳");
                const media = await downloadMediaMessage(targetMsg, 'buffer', {});
                const form = new FormData();
                form.append("file", media, { filename: "media" });
                const { data } = await axios.post("https://telegra.ph/upload", form, { headers: form.getHeaders() });
                if (data && data[0] && data[0].src) {
                    textToQR = "https://telegra.ph" + data[0].src;
                } else {
                    return reply("Gagal mengupload media untuk QR.");
                }
            } catch (e) {
                console.error(e);
                return reply("Terjadi kesalahan saat memproses media ke QR.");
            }
        }

        if (!textToQR) return reply("Masukkan teks/link atau balas gambar/video untuk dijadikan QR Code.");
        
        try {
            const qrBuffer = await QRCode.toBuffer(textToQR);
            await sock.sendMessage(jid, { image: qrBuffer, caption: `QR Code for: ${textToQR}` }, { quoted: msg });
        } catch (e) {
            console.error(e);
            reply("Gagal membuat QR Code.");
        }
        return true;
    }

    if (cmd === "toimg" || cmd === "toimage") {
        let targetMsg = msg;
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quoted) {
            targetMsg = { message: quoted };
        }

        const isSticker = targetMsg.message?.stickerMessage;
        if (!isSticker) return reply("Balas stiker untuk dijadikan gambar.");

        try {
            await reply("Sedang mengkonversi stiker... ⏳");
            const media = await downloadMediaMessage(targetMsg, 'buffer', {});
            // Send as image directly, most clients convert on the fly or display webp image
            await sock.sendMessage(jid, { image: media, caption: "Ini hasilnya kak!" }, { quoted: msg });
        } catch (e: any) {
            console.error("ToImg Error:", e.message);
            reply("Gagal mengkonversi stiker menjadi gambar.");
        }
        return true;
    }

    return false;
}
