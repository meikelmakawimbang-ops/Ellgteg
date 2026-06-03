export default async function ({ cmd, sock, jid, pushname, sender, reply, UserModel, msg }: any) {
    if (cmd === "level" || cmd === "profile" || cmd === "me") {
        if (!UserModel) return reply("Database MongoDB belum terhubung. Fitur leveling tidak tersedia.");

        try {
            const userData = await UserModel.findOne({ jid: sender });
            if (!userData) return reply("Data Anda belum tercatat. Kirim beberapa pesan lagi!");

            const requiredXp = userData.level * 100;
            const progress = (userData.xp / requiredXp) * 100;
            const barLength = 10;
            const filledLength = Math.max(0, Math.min(barLength, Math.floor((progress / 100) * barLength)));
            const bar = "▓".repeat(filledLength) + "░".repeat(barLength - filledLength);

            const profileText = `╭─── *USER PROFILE* ───
│ 👤 *Name:* ${pushname}
│ 📱 *Number:* ${sender.split("@")[0]}
│ 📈 *Level:* ${userData.level}
│ 📊 *XP:* ${userData.xp} / ${requiredXp}
│ ✉️ *Messages:* ${userData.messages}
│ 📅 *Progress:* [${bar}] ${progress.toFixed(1)}%
╰──────────────────`;

            await sock.sendMessage(jid, { 
                text: profileText,
                mentions: [sender]
            }, { quoted: msg });

        } catch (e) {
            console.error(e);
            reply("Gagal mengambil data profil.");
        }
        return true;
    }

    if (cmd === "leaderboard" || cmd === "lb") {
        if (!UserModel) return reply("Database MongoDB belum terhubung.");

        try {
            const topUsers = await UserModel.find({}).sort({ level: -1, xp: -1 }).limit(10);
            if (topUsers.length === 0) return reply("Belum ada data di leaderboard.");

            let lbText = `╭─── *LEADERBOARD* ───\n`;
            topUsers.forEach((user, index) => {
                lbText += `│ ${index + 1}. ${user.jid.split("@")[0]} - Lvl ${user.level}\n`;
            });
            lbText += `╰────────────────────`;
            
            reply(lbText);
        } catch (e) {
            console.error(e);
            reply("Gagal mengambil leaderboard.");
        }
        return true;
    }

    return false;
}
