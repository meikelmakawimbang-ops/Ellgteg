
import fs from 'fs'
import path from 'path'

const DB_PATH = './database.json'

global.db = {
    data: {
        users: {},
        chats: {},
        stats: {},
        msgs: {},
        sticker: {},
        settings: {},
        ...(JSON.parse(fs.existsSync(DB_PATH) ? fs.readFileSync(DB_PATH, 'utf-8') : '{}'))
    }
}

global.loadDatabase = async function() {
    if (fs.existsSync(DB_PATH)) {
        global.db.data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
    } else {
        global.db.data = {
            users: {},
            chats: {},
            stats: {},
            msgs: {},
            sticker: {},
            settings: {}
        }
        await global.saveDatabase()
    }
}

global.saveDatabase = async function() {
    fs.writeFileSync(DB_PATH, JSON.stringify(global.db.data, null, 2))
}

// Auto-save every 30 seconds
setInterval(async () => {
    await global.saveDatabase()
}, 30000)
