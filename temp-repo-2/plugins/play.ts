import yts from "yt-search";
import axios from "axios";

export default async function ({ cmd, q, reply, sock, jid, msg, prefix }: any) {
    if (cmd === "play" || cmd === "play2") {
        if (!q) return reply(`Gunakan ${prefix}play <judul lagu/video>`);
        try {
            reply("Sedang mencari di YouTube...");
            const search = await yts(q);
            const vid = search.videos[0];
            if (!vid) return reply("Video tidak ditemukan!");

            let caption = `*YOUTUBE PLAY*\n\n`;
            caption += `*Judul:* ${vid.title}\n`;
            caption += `*Durasi:* ${vid.timestamp}\n`;
            caption += `*Views:* ${vid.views}\n`;
            caption += `*Upload:* ${vid.ago}\n`;
            caption += `*URL:* ${vid.url}\n\n`;
            caption += `Ketik *${prefix}ytmp3 ${vid.url}* untuk Audio\n`;
            caption += `Ketik *${prefix}ytmp4 ${vid.url}* untuk Video`;

            await sock.sendMessage(jid, { 
                image: { url: vid.thumbnail }, 
                caption: caption 
            }, { quoted: msg });
            
        } catch (e: any) {
            console.error("Play Error:", e.message);
            reply("Gagal mencari di YouTube.");
        }
        return true;
    }
    return false;
}
