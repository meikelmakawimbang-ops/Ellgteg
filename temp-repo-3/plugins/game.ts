import axios from "axios";

let tebakGambarSession: any = {};

export default async function ({ cmd, q, reply, sock, jid, msg, prefix }: any) {
    if (cmd === "tebakgambar") {
        if (tebakGambarSession[jid]) return reply("Selesaikan tebakan gambar sebelumnya dulu!");
        try {
            const res = await axios.get("https://api.siputzx.my.id/api/games/tebakgambar");
            if (res.data.status) {
                const { img, jawaban, deskripsi } = res.data.data;
                tebakGambarSession[jid] = { jawaban: jawaban.toLowerCase(), deskripsi };
                
                await sock.sendMessage(jid, { 
                    image: { url: img }, 
                    caption: `Ayo tebak gambar ini!\n\nPetunjuk: ${deskripsi}\n\nWaktu: 60 detik. Ketik jawaban langsung.` 
                }, { quoted: msg });

                setTimeout(() => {
                    if (tebakGambarSession[jid]) {
                        reply(`Waktu habis! Jawabannya adalah: *${tebakGambarSession[jid].jawaban}*`);
                        delete tebakGambarSession[jid];
                    }
                }, 60000);
            }
        } catch (e) {
            reply("Gagal memulai game tebak gambar.");
        }
        return true;
    }

    // Check for answer if session exists
    if (tebakGambarSession[jid]) {
        const userAction = cmd || q; // Handle if they just type the word
        // In this architecture, we might not get 'cmd' if it's just raw text without prefix
        // However, the plugin loader is only called if usedPrefix is true.
        // We might need to handle raw text in server.ts or here.
        // Let's assume for now they might type it with prefix or we can check 'q'
    }

    return false;
}
