import axios from "axios";

export default async function ({ cmd, q, reply, sock, jid, msg, prefix }: any) {
    if (cmd === "google") {
        if (!q) return reply(`Gunakan ${prefix}google <kata kunci>`);
        try {
            reply("Sedang mencari di Google...");
            const res = await axios.get(`https://api.siputzx.my.id/api/s/google?query=${encodeURIComponent(q)}`);
            if (res.data.status && res.data.data) {
                let txt = `*GOOGLE SEARCH*\n\n`;
                for (let i of res.data.data.slice(0, 5)) {
                    txt += `*Judul:* ${i.title}\n`;
                    txt += `*Link:* ${i.link}\n`;
                    txt += `*Deskripsi:* ${i.snippet}\n\n`;
                }
                reply(txt.trim());
            } else {
                reply("Gagal mendapatkan hasil pencarian.");
            }
        } catch (e: any) {
            reply("Error saat mencari di Google.");
        }
        return true;
    }

    if (cmd === "pinterest" || cmd === "pin") {
        if (!q) return reply(`Gunakan ${prefix}pinterest <query>`);
        try {
            reply("Sedang mencari di Pinterest...");
            const res = await axios.get(`https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(q)}`);
            if (res.data.status && res.data.data && res.data.data.length > 0) {
                const img = res.data.data[Math.floor(Math.random() * res.data.data.length)];
                await sock.sendMessage(jid, { image: { url: img }, caption: `Hasil pencarian Pinterest untuk: ${q}` }, { quoted: msg });
            } else {
                reply("Gagal mendapatkan gambar dari Pinterest.");
            }
        } catch (e: any) {
            reply("Error saat mencari di Pinterest.");
        }
        return true;
    }

    return false;
}
