export default async function ({ cmd, q, reply, sock, jid, msg, isGroup, args }: any) {
    if (cmd === "hidetag") {
        if (!isGroup) return reply("Fitur ini hanya untuk di grup.");
        const groupMetadata = await sock.groupMetadata(jid);
        const participants = groupMetadata.participants.map((p: any) => p.id);
        await sock.sendMessage(jid, { 
            text: q || "", 
            mentions: participants 
        });
        return true;
    }

    if (cmd === "kick") {
        if (!isGroup) return reply("Fitur ini hanya untuk di grup.");
        const mention = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (args[0]?.replace(/[^\d]/g, '') + "@s.whatsapp.net");
        if (!mention) return reply("Tag orang yang ingin di-kick.");
        try {
            await sock.groupParticipantsUpdate(jid, [mention], "remove");
            reply("Berhasil mengeluarkan member.");
        } catch (e) {
            reply("Gagal mengeluarkan member. Pastikan bot adalah admin.");
        }
        return true;
    }

    if (cmd === "add") {
        if (!isGroup) return reply("Fitur ini hanya untuk di grup.");
        const newUser = args[0]?.replace(/[^\d]/g, '') + "@s.whatsapp.net";
        if (!args[0]) return reply("Masukkan nomor yang ingin ditambah.");
        try {
            await sock.groupParticipantsUpdate(jid, [newUser], "add");
            reply("Berhasil menambah member.");
        } catch (e) {
            reply("Gagal menambah member. Pastikan bot adalah admin.");
        }
        return true;
    }

    if (cmd === "group") {
        if (!isGroup) return reply("Fitur ini hanya untuk di grup.");
        if (q === "open") {
            await sock.groupSettingUpdate(jid, 'not_announcement');
            reply("Grup telah dibuka! Peserta sekarang bisa mengirim pesan.");
        } else if (q === "close") {
            await sock.groupSettingUpdate(jid, 'announcement');
            reply("Grup telah ditutup! Hanya admin yang bisa mengirim pesan.");
        } else {
            reply("Gunakan .group open atau close");
        }
        return true;
    }

    if (cmd === "promote") {
        if (!isGroup) return reply("Fitur ini hanya untuk di grup.");
        const mention = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (args[0]?.replace(/[^\d]/g, '') + "@s.whatsapp.net");
        if (!mention) return reply("Tag orang yang ingin di-promote.");
        try {
            await sock.groupParticipantsUpdate(jid, [mention], "promote");
            reply("Berhasil menjadikan admin.");
        } catch (e) {
            reply("Gagal promote. Bot harus admin.");
        }
        return true;
    }

    if (cmd === "demote") {
        if (!isGroup) return reply("Fitur ini hanya untuk di grup.");
        const mention = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (args[0]?.replace(/[^\d]/g, '') + "@s.whatsapp.net");
        if (!mention) return reply("Tag orang yang ingin di-demote.");
        try {
            await sock.groupParticipantsUpdate(jid, [mention], "demote");
            reply("Berhasil menurunkan jabatan admin.");
        } catch (e) {
            reply("Gagal demote. Bot harus admin.");
        }
        return true;
    }
    
    return false;
}
