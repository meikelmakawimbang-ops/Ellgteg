import axios from "axios";

export default async function ({ cmd, q, reply, sock, jid, msg }: any) {
    if (cmd === "tiktok") {
        if (!q) return reply("Masukkan URL TikTok!");
        try {
            reply("Sedang mendownload TikTok, mohon tunggu...");
            // API 1: Tiklydown
            try {
                const tkRes = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(q)}`);
                if (tkRes.data && tkRes.data.video) {
                    const videoUrl = tkRes.data.video.noWatermark || tkRes.data.video.watermark;
                    await sock.sendMessage(jid, { video: { url: videoUrl }, caption: "Download Berhasil! (API 1)" }, { quoted: msg });
                    return true;
                }
            } catch (e) {}

            // API 2: Siputzx
            const tkRes2 = await axios.get(`https://api.siputzx.my.id/api/dwnld/tiktok?url=${encodeURIComponent(q)}`);
            if (tkRes2.data.status) {
                const videoUrl = tkRes2.data.data.video || tkRes2.data.data.no_watermark;
                await sock.sendMessage(jid, { video: { url: videoUrl }, caption: "Download Berhasil! (API 2)" }, { quoted: msg });
            } else {
                reply("Gagal mendownload video tersebut dari semua server.");
            }
        } catch (e: any) {
            console.error("TikTok Downloader Error:", e.message);
            reply("Error saat mendownload TikTok. Pastikan URL valid.");
        }
        return true;
    }

    if (cmd === "ytmp3" || cmd === "ytmp4") {
        if (!q) return reply("Masukkan URL YouTube!");
        try {
            const isAudio = cmd === "ytmp3";
            reply(`Sedang mendownload YouTube ${isAudio ? 'Audio' : 'Video'}...`);
            
            // API 1: Siputzx
            try {
                const ytApi = `https://api.siputzx.my.id/api/dwnld/${isAudio ? 'ytmp3' : 'ytmp4'}?url=${encodeURIComponent(q)}`;
                const ytRes = await axios.get(ytApi);
                if (ytRes.data.status) {
                    const mediaUrl = ytRes.data.data.dl || ytRes.data.data.download;
                    if (isAudio) {
                        await sock.sendMessage(jid, { audio: { url: mediaUrl }, mimetype: 'audio/mpeg' }, { quoted: msg });
                    } else {
                        await sock.sendMessage(jid, { video: { url: mediaUrl } }, { quoted: msg });
                    }
                    return true;
                }
            } catch (e) {}

            // API 2: Betabotz (Public)
            const ytApi2 = `https://api.betabotz.eu.org/api/download/ytmp3?url=${encodeURIComponent(q)}&apikey=free`;
            const ytRes2 = await axios.get(ytApi2);
            if (ytRes2.data.status) {
                const mediaUrl = ytRes2.data.result.mp3 || ytRes2.data.result.url;
                await sock.sendMessage(jid, { audio: { url: mediaUrl }, mimetype: 'audio/mpeg' }, { quoted: msg });
            } else {
                reply("Gagal mendownload YouTube tersebut. Mungkin video terlalu panjang atau server sibuk.");
            }
        } catch (e: any) {
            console.error("YouTube Downloader Error:", e.message);
            reply("Error saat mendownload YouTube.");
        }
        return true;
    }

    if (cmd === "ig" || cmd === "instagram") {
        if (!q) return reply("Masukkan URL Instagram!");
        try {
            reply("Sedang mendownload Instagram, mohon tunggu...");
            const res = await axios.get(`https://api.siputzx.my.id/api/dwnld/ig?url=${encodeURIComponent(q)}`);
            if (res.data.status && res.data.data && res.data.data.length > 0) {
                const media = res.data.data[0];
                const url = media.url || media.download_link;
                if (url.includes(".mp4") || (media.type && media.type === "video")) {
                    await sock.sendMessage(jid, { video: { url: url }, caption: "Download Berhasil!" }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { image: { url: url }, caption: "Download Berhasil!" }, { quoted: msg });
                }
            } else {
                reply("Gagal mendownload Instagram. Pastikan link publik dan benar.");
            }
        } catch (e: any) {
            console.error("Instagram Downloader Error:", e.message);
            reply("Error saat mendownload Instagram.");
        }
        return true;
    }

    if (cmd === "fb" || cmd === "facebook") {
        if (!q) return reply("Masukkan URL Facebook!");
        try {
            reply("Sedang mendownload Facebook, mohon tunggu...");
            const res = await axios.get(`https://api.siputzx.my.id/api/dwnld/fb?url=${encodeURIComponent(q)}`);
            if (res.data.status) {
                const videoUrl = res.data.data.hd || res.data.data.sd || res.data.data.url;
                await sock.sendMessage(jid, { video: { url: videoUrl }, caption: "Download Berhasil!" }, { quoted: msg });
            } else {
                reply("Gagal mendownload Facebook. Pastikan link benar.");
            }
        } catch (e: any) {
            console.error("Facebook Downloader Error:", e.message);
            reply("Error saat mendownload Facebook.");
        }
        return true;
    }
    
    return false;
}
