export default async function ({ cmd, prefix, pushname, botSettings, reply, sock, jid, msg }: any) {
    if (cmd !== "menu" && cmd !== "help") return false;

    const menu = `
╭━━〔 ✦ *ellBot-MK INDO* ✦ 〕━━╮
┃ 👤 *User:* ${pushname}
┃ ⚡ *Prefix:* "${prefix}"
┃ 🤖 *Status:* Online & Stable
┃ 💎 *Engine:* 2026 Core
╰━━━━━━━━━━━━━━━━━━━╯

*Pilih kategori menu di bawah:*

┌──〔 🤖 *AI & SEARCH* 〕
│ ✎ ${prefix}ai <tanya>
│ ✎ ${prefix}aiimg <prompt>
│ ✎ ${prefix}google <search>
│ ✎ ${prefix}wiki <query>
│ ✎ ${prefix}pinterest <query>
└───────────────

┌──〔 📥 *DOWNLOADER* 〕
│ ✎ ${prefix}play <judul lagu>
│ ✎ ${prefix}ytmp3 <url youtube>
│ ✎ ${prefix}ytmp4 <url youtube>
│ ✎ ${prefix}tiktok <url tiktok>
│ ✎ ${prefix}ig <url instagram>
│ ✎ ${prefix}fb <url facebook>
└───────────────

┌──〔 🎨 *CONVERTER* 〕
│ ✎ ${prefix}sticker (balas media)
│ ✎ ${prefix}ttp <teks>
│ ✎ ${prefix}toimg (balas stiker)
│ ✎ ${prefix}toqr <link/teks>
│ ✎ ${prefix}tourl (balas foto)
└───────────────

┌──〔 👥 *GROUP MENU* 〕
│ ✎ ${prefix}hidetag <pesan>
│ ✎ ${prefix}kick @user
│ ✎ ${prefix}add 62xxx
│ ✎ ${prefix}group <open/close>
│ ✎ ${prefix}demote/promote @user
└───────────────

┌──〔 ⚙️ *SETTINGS* 〕
│ ✎ ${prefix}setai <on/off>
│ ✎ ${prefix}setsticker <on/off>
│ ✎ ${prefix}setautoread <on/off>
│ ✎ ${prefix}setautoreact <on/off>
│ ✎ ${prefix}setemoji <emoji>
└───────────────

┌──〔 🏆 *LEVELING* 〕
│ ✎ ${prefix}profile
│ ✎ ${prefix}leaderboard
└───────────────

┌──〔 🎮 *GAMES* 〕
│ ✎ ${prefix}tebakgambar
└───────────────

┌──〔 🛠 *TOOLS* 〕
│ ✎ ${prefix}nulis <teks>
│ ✎ ${prefix}tr <lang> <teks>
│ ✎ ${prefix}buatcv <nama|data...>
└───────────────

_Bot ini berbasis ellBot-MK dengan fitur terlengkap._
`.trim();
    
    const menuImage = "https://w0.peakpx.com/wallpaper/950/203/HD-wallpaper-whatsapp-aesthetic-dark-green-neon-logo.jpg";
    
    try {
        await sock.sendMessage(jid, { 
            image: { url: menuImage }, 
            caption: menu + "\n\n_© 2024 ellBot-MK v3.0_"
        }, { quoted: msg });
    } catch (e) {
        console.error("Menu Image Error, falling back to text:", e);
        await reply(menu + "\n\n_© 2024 ellBot-MK v3.0_");
    }
    
    return true;
}
