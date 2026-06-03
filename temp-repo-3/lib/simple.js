
import { jidNormalizedUser, proto, generateWAMessageFromContent, getContentType } from '@whiskeysockets/baileys'
import fs from 'fs'
import path from 'path'
import axios from 'axios'
import fetch from 'node-fetch'

export function smsg(conn, m, store) {
    if (!m) return m
    let M = proto.WebMessageInfo
    if (m.key) {
        m.id = m.key.id
        m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16
        m.chat = m.key.remoteJid
        m.fromMe = m.key.fromMe
        m.isGroup = m.chat.endsWith('@g.us')
        m.sender = jidNormalizedUser(m.fromMe ? conn.user.id : m.participant || m.key.participant || m.chat || '')
        if (m.isGroup) m.participant = jidNormalizedUser(m.key.participant || '')
    }
    if (m.message) {
        m.mtype = getContentType(m.message)
        m.msg = (m.mtype === 'viewOnceMessageV2' ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype])
        m.body = m.message.conversation || m.msg.caption || m.msg.text || (m.mtype == 'listResponseMessage') && m.msg.singleSelectReply.selectedRowId || (m.mtype == 'buttonsResponseMessage') && m.msg.selectedButtonId || (m.mtype == 'templateButtonReplyMessage') && m.msg.selectedId || m.msg || ''
        m.text = typeof m.msg.text === 'string' ? m.msg.text : m.msg.caption || m.message.conversation || m.msg.contentText || m.msg.selectedDisplayText || m.msg.title || ''
        m.name = m.pushName || 'User'
        
        let quoted = m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null
        if (m.quoted) {
            let type = getContentType(m.quoted)
            m.quoted = m.quoted[type]
            if (['productMessage'].includes(type)) {
                type = getContentType(m.quoted)
                m.quoted = m.quoted[type]
            }
            if (typeof m.quoted === 'string') m.quoted = { text: m.quoted }
            m.quoted.mtype = type
            m.quoted.id = m.msg.contextInfo.stanzaId
            m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat
            m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false
            m.quoted.sender = jidNormalizedUser(m.msg.contextInfo.participant)
            m.quoted.fromMe = m.quoted.sender === jidNormalizedUser(conn.user.id)
            m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || ''
            m.quoted.msg = m.quoted
            m.quoted.reply = (text, chatId, options) => conn.reply(chatId ? chatId : m.quoted.chat, text, m.quoted.id ? { ...options, quoted: m } : options)
        }
    }
    m.reply = (text, chatId, options) => conn.reply(chatId ? chatId : m.chat, text, m, options)
    return m
}

export async function generateProfilePicture(buffer) {
    // Basic implementation
    return { img: buffer }
}
