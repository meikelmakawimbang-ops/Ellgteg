
export default async function (m, conn) {
    if (global.opts && global.opts['noprint']) return
    let name = m.name || 'User'
    let chat = m.chat || 'Private'
    let text = m.text || ''
    console.log(`[${new Date().toLocaleTimeString()}] ${chat} | ${name}: ${text}`)
}
