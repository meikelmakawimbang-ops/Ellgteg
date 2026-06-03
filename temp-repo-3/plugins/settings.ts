export default async function ({ cmd, q, botSettings, saveSettings, reply, prefix }: any) {
    if (cmd === "setautoread") {
        if (!q) return reply(`Gunakan ${prefix}setautoread on atau off`);
        botSettings.autoRead = q.toLowerCase() === "on";
        await saveSettings();
        reply(`Fitur Auto-Read (Centang Biru Otomatis) berhasil di${botSettings.autoRead ? "aktifkan" : "matikan"}.`);
        return true;
    }

    if (cmd === "setautoreact") {
        if (!q) return reply(`Gunakan ${prefix}setautoreact on atau off`);
        botSettings.autoReaction = q.toLowerCase() === "on";
        await saveSettings();
        reply(`Fitur Auto-Reaction berhasil di${botSettings.autoReaction ? "aktifkan" : "matikan"}. Default emoji: ${botSettings.reactionEmoji}`);
        return true;
    }

    if (cmd === "setemoji") {
        if (!q) return reply(`Gunakan ${prefix}setemoji <emoji> atau ${prefix}setemoji random`);
        botSettings.reactionEmoji = q.trim().toLowerCase() === 'random' ? 'random' : q.trim();
        await saveSettings();
        reply(`Emoji reaction berhasil diubah menjadi: ${botSettings.reactionEmoji === 'random' ? 'Random 🎲' : botSettings.reactionEmoji}`);
        return true;
    }

    return false;
}
