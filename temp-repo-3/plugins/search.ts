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
            // API 1: Siputzx
            try {
                const res = await axios.get(`https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(q)}`);
                if (res.data.status && res.data.data && res.data.data.length > 0) {
                    const img = res.data.data[Math.floor(Math.random() * res.data.data.length)];
                    await sock.sendMessage(jid, { image: { url: img }, caption: `Hasil Pinterest: ${q}` }, { quoted: msg });
                    return true;
                }
            } catch (e) {}

            // API 2: Lolhuman
            const lolApiKey = "8504f6a115386084a7d41464";
            const res2 = await axios.get(`https://api.lolhuman.xyz/api/pinterest?apikey=${lolApiKey}&query=${encodeURIComponent(q)}`);
            if (res2.data.status === 200 && res2.data.result) {
                const img = res2.data.result[Math.floor(Math.random() * res2.data.result.length)];
                await sock.sendMessage(jid, { image: { url: img }, caption: `Hasil Pinterest (API 2): ${q}` }, { quoted: msg });
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
