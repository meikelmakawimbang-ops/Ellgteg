import axios from "axios";

export default async function ({ cmd, q, reply, sock, jid, msg, prefix }: any) {
    if (cmd === "nulis") {
        if (!q) return reply(`Gunakan ${prefix}nulis <teks kamu>`);
        try {
            reply("Sedang menulis, mohon tunggu...");
            // API 1: Siputzx
            try {
                const nulisUrl = `https://api.siputzx.my.id/api/utils/nulis?text=${encodeURIComponent(q)}`;
                await sock.sendMessage(jid, { image: { url: nulisUrl }, caption: "Ini hasilnya kak! (API 1)" }, { quoted: msg });
                return true;
            } catch (e) {}

            // API 2: Lolhuman (Fallback)
            const nulisUrl2 = `https://api.lolhuman.xyz/api/nulis?apikey=8504f6a115386084a7d41464&text=${encodeURIComponent(q)}`;
            await sock.sendMessage(jid, { image: { url: nulisUrl2 }, caption: "Ini hasilnya kak! (API 2)" }, { quoted: msg });
        } catch (e: any) {
            console.error("Nulis Plugin Error:", e.message);
            reply("Gagal memproses fitur nulis. Coba lagi nanti.");
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
