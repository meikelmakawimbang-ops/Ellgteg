export default async function ({ cmd, q, botSettings, saveSettings, reply, model, sock, jid, prefix }: any) {
    if (cmd === "setai") {
        if (!q) return reply(`Gunakan ${prefix}setai on atau off`);
        botSettings.aiEnabled = q.toLowerCase() === "on";
        await saveSettings();
        reply(`Fitur AI berhasil di${botSettings.aiEnabled ? "aktifkan" : "matikan"}.`);
        return true;
    }

    if (cmd === "ai") {
        if (!botSettings.aiEnabled) return reply("Fitur AI sedang dimatikan oleh admin.");
        if (!model) return reply("Sistem AI belum siap. Pastikan API Key Gemini sudah diatur di environment.");
        if (!q) return reply("Halo! Ada yang bisa saya bantu? Silahkan masukkan pertanyaan Anda.");
        try {
            await sock.sendPresenceUpdate('composing', jid);
            
            const prompt = `Kamu adalah ellBot-MK, asisten AI WhatsApp yang ramah, cerdas, dan membantu. 
            Gunakan Bahasa Indonesia yang santai tapi sopan. 
            Sistem kamu berjalan pada teknologi Core 2026.
            Jika user bertanya siapa pembuatmu, katakan kamu dikembangkan oleh ellBot-MK Team.
            
            Pertanyaan User: ${q}`;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            
            // Format response if it's too long or has blocks
            await reply(responseText.trim());
        } catch (error: any) {
            console.error("Gemini Error:", error.message);
            await reply("Maaf, terjadi gangguan pada otak AI saya. Coba lagi sesaat lagi ya!");
        }
        return true;
    }
    
    return false;
}
