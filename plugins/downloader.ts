import axios from "axios";
import { Tiktok, ttimg } from "../lib/tiktok.js";

export default async function ({ cmd, q, reply, sock, jid, msg }: any) {
    if (cmd === "tiktok") {
        if (!q) return reply("Masukkan URL TikTok!");
        try {
            reply("Sedang mendownload TikTok, mohon tunggu...");
            
            // Local Scraper (API 1)
            try {
                const result = await Tiktok(q);
                if (result.nowm) {
                    await sock.sendMessage(jid, { 
                        video: { url: result.nowm }, 
                        caption: `*TIKTOK DOWNLOADER*\n\n*Judul:* ${result.title}\n*Author:* ${result.author}\n\nLain kali download sendiri ya 😎` 
                    }, { quoted: msg });
                    return true;
                }
            } catch (e) {
                console.log("Local Tiktok Scraper Error:", e);
            }

            // API 2: Tiklydown
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
        if (!q) return reply("Masukkan URL YouTube atau judul lagu!");
        try {
            const isAudio = cmd === "ytmp3";
            let url = q;
            
            // Check if it is a URL
            if (!url.startsWith("http")) {
                reply(`Mencari *"${q}"* di YouTube...`);
                const yts = await import("yt-search");
                const search = await yts.default(q);
                const vid = search.videos[0];
                if (!vid) return reply("Video tidak ditemukan!");
                url = vid.url;
                reply(`Ditemukan: *${vid.title}*\nSedang memproses download...`);
            }

            reply(`Sedang mendownload YouTube ${isAudio ? 'Audio' : 'Video'}...`);
            
            // API 1: Siputzx
            try {
                const ytApi = `https://api.siputzx.my.id/api/dwnld/${isAudio ? 'ytmp3' : 'ytmp4'}?url=${encodeURIComponent(url)}`;
                const ytRes = await axios.get(ytApi);
                if (ytRes.data.status && ytRes.data.data) {
                    const mediaUrl = ytRes.data.data.dl || ytRes.data.data.download || ytRes.data.content;
                    if (mediaUrl) {
                        if (isAudio) {
                            await sock.sendMessage(jid, { audio: { url: mediaUrl }, mimetype: 'audio/mpeg' }, { quoted: msg });
                        } else {
                            await sock.sendMessage(jid, { video: { url: mediaUrl } }, { quoted: msg });
                        }
                        return true;
                    }
                }
            } catch (e: any) {
                console.log("YT API 1 Error:", e.message);
            }

            // API 2: Lolhuman
            try {
                const lolApiKey = "8504f6a115386084a7d41464";
                const ytApi2 = `https://api.lolhuman.xyz/api/${isAudio ? 'ytmp3' : 'ytmp4'}?apikey=${lolApiKey}&url=${encodeURIComponent(url)}`;
                const ytRes2 = await axios.get(ytApi2);
                if (ytRes2.data.status === 200 && ytRes2.data.result) {
                    const mediaUrl = ytRes2.data.result.link || ytRes2.data.result.url;
                    if (mediaUrl) {
                        if (isAudio) {
                            await sock.sendMessage(jid, { audio: { url: mediaUrl }, mimetype: 'audio/mpeg' }, { quoted: msg });
                        } else {
                            await sock.sendMessage(jid, { video: { url: mediaUrl } }, { quoted: msg });
                        }
                        return true;
                    }
                }
            } catch (e: any) {
                console.log("YT API 2 Error:", e.message);
            }

            // API 3: Betabotz (Public)
            try {
                const ytApi3 = `https://api.betabotz.eu.org/api/download/ytmp3?url=${encodeURIComponent(url)}&apikey=free`;
                const ytRes3 = await axios.get(ytApi3);
                if (ytRes3.data.status && ytRes3.data.result) {
                    const mediaUrl = ytRes3.data.result.mp3 || ytRes3.data.result.url;
                    if (mediaUrl) {
                        await sock.sendMessage(jid, { audio: { url: mediaUrl }, mimetype: 'audio/mpeg' }, { quoted: msg });
                        return true;
                    }
                }
            } catch (e: any) {
                console.log("YT API 3 Error:", e.message);
            }

            // API 4: AgungJK
            try {
                const ytApi4 = `https://api.agungjk.my.id/api/youtube?url=${encodeURIComponent(url)}`;
                const ytRes4 = await axios.get(ytApi4);
                if (ytRes4.data.status && ytRes4.data.result) {
                    const mediaUrl = isAudio ? ytRes4.data.result.audio : ytRes4.data.result.video;
                    if (mediaUrl) {
                        if (isAudio) {
                            await sock.sendMessage(jid, { audio: { url: mediaUrl }, mimetype: 'audio/mpeg' }, { quoted: msg });
                        } else {
                            await sock.sendMessage(jid, { video: { url: mediaUrl } }, { quoted: msg });
                        }
                        return true;
                    }
                }
            } catch (e: any) {
                console.log("YT API 4 Error:", e.message);
            }

            reply("Maaf, semua server download YouTube sedang sibuk atau URL tidak valid. Coba lagu/video lainnya.");
        } catch (e: any) {
            console.error("YouTube Downloader Overall Error:", e.message);
            reply("Error fatal saat memproses YouTube.");
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

    if (cmd === "ttimg") {
        if (!q) return reply("Masukkan URL TikTok Image!");
        try {
            reply("Sedang memproses TikTok Image, mohon tunggu...");
            const res = await ttimg(q);
            if (res.data && Array.isArray(res.data)) {
                for (let img of res.data) {
                    await sock.sendMessage(jid, { image: { url: img } }, { quoted: msg });
                }
            } else {
                reply(res.data || "Gagal mengambil gambar TikTok.");
            }
        } catch (e: any) {
            console.error("TTImg Error:", e.message);
            reply("Error saat memproses TikTok Image.");
        }
        return true;
    }
    
    return false;
}
