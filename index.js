const {
    WAConnection,
    MessageType,
    Presence,
    Mimetype,
    GroupSettingChange
} = require('@adiwajshing/baileys')
const { color, bgcolor } = require('./lib/color')
const { help } = require('./src/help')
const { wait, simih, getBuffer, h2k, generateMessageID, getGroupAdmins, getRandom, banner, start, info, success, close } = require('./lib/functions')
const { fetchJson } = require('./lib/fetcher')
const { recognize } = require('./lib/ocr')
const fs = require('fs')
const util = require('util')
const execute = util.promisify(require('child_process').exec)
const moment = require('moment-timezone')
const linkfy = require('linkifyjs')
const { welcometxt } = require('./welcometext')
const antilink = JSON.parse(fs.readFileSync('./src/antilink.json'))
const antilinkhard = JSON.parse(fs.readFileSync('./src/antilinkhard.json'))
const antifake = JSON.parse(fs.readFileSync('./src/antifake.json'))
const vcard = 'BEGIN:VCARD\n' 
            + 'VERSION:3.0\n' 
            + 'FN:Meu criador^~^\n' 
            + 'ORG:PENTEST;\n' 
            + 'TEL;type=CELL;type=VOICE;waid=5511968526510:55 11 96852-6510\n' 
            + 'END:VCARD'
prefix = '.'
blocked = []

function kyun(seconds){
  function pad(s){
    return (s < 10 ? '0' : '') + s;
  }
  var hours = Math.floor(seconds / (60*60));
  var minutes = Math.floor(seconds % (60*60) / 60);
  var seconds = Math.floor(seconds % 60);

  //return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds)
  return `${pad(hours)} Jam ${pad(minutes)} Menit ${pad(seconds)} Detik`
}

async function starts() {
	const client = new WAConnection()
	client.logger.level = 'warn'
	console.log(banner.string)
	client.on('qr', () => {
		console.log(color('[','white'), color('!','red'), color(']','white'), color(' Scan the qr code above'))
	})

	fs.existsSync('./BarBar.json') && client.loadAuthInfo('./BarBar.json')
	client.on('connecting', () => {
		start('2', 'Connecting...')
	})
	client.on('open', () => {
		success('2', 'Connected')
	})
	await client.connect({timeoutMs: 30*1000})
        fs.writeFileSync('./BarBar.json', JSON.stringify(client.base64EncodedAuthInfo(), null, '\t'))

	client.on('group-participants-update', async (anu) => {
		try {
			const mdata = await client.groupMetadata(anu.jid)
			if(antifake.includes(anu.jid)) {
				if (anu.action == 'add'){
					num = anu.participants[0]
					if(!num.split('@')[0].startsWith(55)) {
						client.sendMessage(mdata.id, '🚫 NUMERO GRINGOS NÃO SÃO PERMITIDOS 🚫', MessageType.text)
						setTimeout(async function () {
							client.groupRemove(mdata.id, [num])
							return
						}, 1000)
					}
				}
			}
		} catch (e) {
			console.log('Error : %s', color(e, 'red'))
		}
	})

	client.on('CB:Blocklist', json => {
            if (blocked.length > 2) return
	    for (let i of json[1].blocklist) {
	    	blocked.push(i.replace('c.us','s.whatsapp.net'))
	    }
	})
	client.on('chat-update', async (mek) => {
		try {
			if (!mek.hasNewMessage) return
			mek = JSON.parse(JSON.stringify(mek)).messages[0]
			if (!mek.message) return
			if (mek.key && mek.key.remoteJid == 'status@broadcast') return
			if (mek.key.fromMe) return
			global.prefix
			global.blocked
			const content = JSON.stringify(mek.message)
			const from = mek.key.remoteJid
			const num = mek.participant
			const type = Object.keys(mek.message)[0]
			const { text, extendedText, contact, location, liveLocation, image, video, sticker, document, audio, product } = MessageType
			const time = moment.tz('Asia/Jakarta').format('DD/MM HH:mm:ss')
			body = (type === 'conversation' && mek.message.conversation.startsWith(prefix)) ? mek.message.conversation : (type == 'imageMessage') && mek.message.imageMessage.caption.startsWith(prefix) ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption.startsWith(prefix) ? mek.message.videoMessage.caption : (type == 'extendedTextMessage') && mek.message.extendedTextMessage.text.startsWith(prefix) ? mek.message.extendedTextMessage.text : ''
			budy = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : ''
			const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
			const args = body.trim().split(/ +/).slice(1)
			const isCmd = body.startsWith(prefix)
			mess = {
				wait: '⌛ Aguarde um pouco... ⌛',
				success: '✔️ Sucesso! ✔️',
				error: {
					stick: '❌ Falha, ocorreu um erro ao converter a imagem em um adesivo ❌',
					Iv: '❌ Link inválido ❌'
				},
				only: {
					group: '❌ Este comando só pode ser usado em grupos! ❌',
					ownerG: '❌ Este comando só pode ser usado pelo grupo proprietário! ❌',
					ownerB: '❌ Este comando só pode ser usado pelo bot proprietário! ❌',
					admin: '❌ SILÊNCIO MEMBRO COMUM VC N TEM MORAL PRA USAR ESSE COMANDO ❌',
					Badmin: '❌ Este comando só pode ser usado quando o bot se torna administrador! ❌'
				}
			}

			const botNumber = client.user.jid
			const OriginalOwner = '5511968526510'
			const ownerNumber = ["5511968526510@s.whatsapp.net"] // replace this with your number
			const isGroup = from.endsWith('@g.us')
			const sender = isGroup ? mek.participant : mek.key.remoteJid
			const groupMetadata = isGroup ? await client.groupMetadata(from) : ''
			const groupName = isGroup ? groupMetadata.subject : ''
			const groupId = isGroup ? groupMetadata.jid : ''
			const groupMembers = isGroup ? groupMetadata.participants : ''
			const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
			const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
			const isGroupAdmins = groupAdmins.includes(sender) || false
			const isAntiLink = isGroup ? antilink.includes(from) : false
			const isAntiLinkHard = isGroup ? antilinkhard.includes(from) : false
			
			const isUrl = (url) => {
				if(linkfy.find(url)[0]) return true
				return false
			}
			const reply = (teks) => {
				client.sendMessage(from, teks, text, {quoted:mek})
			}
			const sendMess = (hehe, teks) => {
				client.sendMessage(hehe, teks, text)
			}
			const mentions = (teks, memberr, id) => {
				(id == null || id == undefined || id == false) ? client.sendMessage(from, teks.trim(), extendedText, {contextInfo: {"mentionedJid": memberr}}) : client.sendMessage(from, teks.trim(), extendedText, {quoted: mek, contextInfo: {"mentionedJid": memberr}})
			}

			colors = ['red','white','black','blue','yellow','green']
			const isMedia = (type === 'imageMessage' || type === 'videoMessage')
			const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
			const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
			const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')
			if (!isGroup && isCmd) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(command), 'from', color(sender.split('@')[0]), 'args :', color(args.length))
			if (!isGroup && !isCmd) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;31mRECV\x1b[1;37m]', time, color('Message'), 'from', color(sender.split('@')[0]), 'args :', color(args.length))
			if (isCmd && isGroup) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(command), 'from', color(sender.split('@')[0]), 'in', color(groupName), 'args :', color(args.length))
			if (!isCmd && isGroup) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;31mRECV\x1b[1;37m]', time, color('Message'), 'from', color(sender.split('@')[0]), 'in', color(groupName), 'args :', color(args.length))
			
			if(isUrl(budy) && isAntiLinkHard && !isGroupAdmins && isBotGroupAdmins) {
				kic = `${sender.split("@")[0]}@s.whatsapp.net`
				client.groupRemove(from, [kic])
			}
			if(isUrl(budy) && isAntiLinkHard && isGroupAdmins && isBotGroupAdmins) {
				reply('Isso é um link amigo... ah é tu é adm ent pode kkkk 🙃')
			}

			if(budy.includes('://chat.whatsapp.com/') && isAntiLink && !isGroupAdmins && isBotGroupAdmins) {
				kic = `${sender.split("@")[0]}@s.whatsapp.net`
				client.groupRemove(from, [kic])
			}
			if(budy.includes('://chat.whatsapp.com/') && isAntiLink && isGroupAdmins && isBotGroupAdmins) {
				reply('Isso é um link amigo... ah é tu é adm ent pode kkkk 🙃')
			}
			if(budy.includes('://youtube.com/channel') && isAntiLink && !isGroupAdmins && isBotGroupAdmins) {
				kic = `${sender.split("@")[0]}@s.whatsapp.net`
				client.groupRemove(from, [kic])
			}
			if(budy.includes('://youtube.com/channel') && isAntiLink && isGroupAdmins && isBotGroupAdmins) {
				reply('Isso é um link amigo... ah é tu é adm ent pode kkkk 🙃')
			}
			
			switch(command) {
				case 'listonline':
					try{
						if (!isGroup) return reply(mess.only.group)
						client.updatePresence(from, Presence.composing)
						client.requestPresenceUpdate(from, Presence.available)
						let online = [...Object.keys(client.chats.get(from).presences)]
						client.sendMessage(from, 'List Online:\n' + online.map(v => '- @' + v.replace(/@.+/, '')).join`\n`, extendedText, {quoted: mek, contextInfo: {"mentionedJid": online}})
					} catch {
						reply(msgerr)
					}
				break
				case 'criador':
					try {
					client.sendMessage(from, {displayname: "KABULOS-BOT", vcard: vcard}, MessageType.contact, { quoted: mek})
       				client.sendMessage(from, 'Este é o número do meu proprietário >_<, não envie spam ou bloqueio você',MessageType.text, { quoted: mek} )
					} catch {
						reply(msgerr)
					}
				break
				case 'gerarcc':
					try{
                   reply(`carregando`)
				   anu = await fetchJson(`https://videfikri.com/api/ccgenerator/`, {method:'get'})
				   teks = `*✅ Cartão Gerado com sucesso ✅*\n*💳NÚMERO*: ${anu.result.card.number}\n*💳️BANDEIRA*: ${anu.result.card.network}\n*💳CVV*: ${anu.result.card.cvv}\n*💳PIN*: ${anu.result.card.pin}\n*💳️DINHEIRO NA CONTA*: ${anu.result.card.balance}\n*💳️EXPIRAR-MÊS*: Personalizado\n*💳VENCIMENTO*: Custume\n*💳️PAÍS*: ${anu.result.customer.country}\n*💳NOME*: ${anu.result.customer.name}\n*💳ENDEREÇO*: ${anu.result.customer.address}`
				   client.sendMessage(from, teks, text, {quoted: mek})
				} catch (e) {
					console.log(e)
					reply(msgerr)
				}
				   break
				case 'attp':
					try{                 
			     	if (args.length < 1) return reply(`_Coloque o texto _\n\n*Exemplo ${prefix}stc Daddy*`)
                    	url = encodeURI(`https://api.xteam.xyz/attp?file&text=${body.slice(6)}`)
		    			attp2 = await getBuffer(url)
			    		client.sendMessage(from, attp2, sticker, {quoted: mek})
					} catch {
						reply(msgerr)
					}
			    break
				case 'menu':
					cr = 'KABULOS-BOT'
					client.sendMessage(from, help(prefix), text, {quoted: mek, quoted: { key: { fromMe: false, participant: `0@s.whatsapp.net`, ...(from ? { remoteJid: "status@broadcast" } : {}) }, message: { "imageMessage": { "url": "https://mmg.whatsapp.net/d/f/At0x7ZdIvuicfjlf9oWS6A3AR9XPh0P-hZIVPLsI70nM.enc", "mimetype": "image/jpeg","caption": cr, 'jpegThumbnail': fs.readFileSync('./img/logobot.jpg')}}}})
					break
				case 'ban':
					if (!isGroup) return reply(mess.only.group)
					if (!isGroupAdmins) return reply(mess.only.admin)
					if (!isBotGroupAdmins) return reply(mess.only.Badmin)
					if (mek.message.extendedTextMessage != undefined || mek.message.extendedTextMessage != null) {
						num = mek.message.extendedTextMessage.contextInfo.participant
						client.sendMessage(from, bye(num.split('@')[0]), extendedText, {quoted: mek, contextInfo: { mentionedJid: [num]}})
						client.groupRemove(from, [num])
					}
					else { 
						reply('Responda a mensagem da pessoa')
					}
				break
				case 'antifake':
					try {
					if (!isGroup) return reply(mess.only.group)
					if (!isGroupAdmins) return reply(mess.only.admin)
					if (args.length < 1) return reply('Hmmmm')
					if (Number(args[0]) === 1) {
						if (isAntiFake) return reply('Ja esta ativo')
						antifake.push(from)
						fs.writeFileSync('./src/antifake.json', JSON.stringify(antifake))
						reply('Ativou com sucesso o recurso de antifake neste grupo✔️')
					} else if (Number(args[0]) === 0) {
						antifake.splice(from, 1)
						fs.writeFileSync('./src/antifake.json', JSON.stringify(antifake))
						reply('Desativou com sucesso o recurso de antifake neste grupo✔️')
					} else {
						reply('1 para ativar, 0 para desativar')
					}
					} catch {
						reply('erro ao fazer esse comando')
					}
                break
				case 'antilink':
					try {
						if (!isGroup) return reply(mess.only.group)
						if (!isGroupAdmins) return reply(mess.only.admin)
						if (args.length < 1) return reply('Hmmmm')
						if (Number(args[0]) === 1) {
							if (isAntiLink) return reply('Ja esta ativo')
							antilink.push(from)
							fs.writeFileSync('./src/antilink.json', JSON.stringify(antilink))
							reply('Ativou com sucesso o recurso de antilink neste grupo✔️')
						} else if (Number(args[0]) === 0) {
							antilink.splice(from, 1)
							fs.writeFileSync('./src/antilink.json', JSON.stringify(antilink))
							reply('Desativou com sucesso o recurso de antilink neste grupo✔️')
						} else {
							reply('1 para ativar, 0 para desativar')
						}
					} catch {
						reply('Deu erro, tente novamente :/')
					}
					break
				case 'antilinkhard':
					try {
						if (!isGroup) return reply(mess.only.group)
						if (!isGroupAdmins) return reply(mess.only.admin)
						if (args.length < 1) return reply('Hmmmm')
						if (Number(args[0]) === 1) {
							if (isAntiLinkHard) return reply('Ja esta ativo')
							antilinkhard.push(from)
							fs.writeFileSync('./src/antilinkhard.json', JSON.stringify(antilinkhard))
							reply('Ativou com sucesso o recurso de antilink hardcore neste grupo✔️')
						} else if (Number(args[0]) === 0) {
							antilinkhard.splice(from, 1)
							fs.writeFileSync('./src/antilinkhard.json', JSON.stringify(antilinkhard))
							reply('Desativou com sucesso o recurso de antilink harcore neste grupo✔️')
						} else {
							reply('1 para ativar, 0 para desativar')
						}
					} catch {
						reply('Deu erro, tente novamente :/')
					}
				break
				case 'kick':
					if (!isGroup) return reply(mess.only.group)
					if (!isGroupAdmins) return reply(mess.only.admin)
					if (!isBotGroupAdmins) return reply(mess.only.Badmin)
					if (mek.message.extendedTextMessage === undefined || mek.message.extendedTextMessage === null) return reply('Tag target yang ingin di tendang!')
					mentioned = mek.message.extendedTextMessage.contextInfo.mentionedJid
					if (mentioned.length > 1) {
						teks = 'Pedidos recebidos, emitidos :\n'
						for (let _ of mentioned) {
							teks += `@${_.split('@')[0]}\n`
						}
						mentions(teks, mentioned, true)
						client.groupRemove(from, mentioned)
					} else {
						mentions(`Pedidos recebidos, emitidos : @${mentioned[0].split('@')[0]}`, mentioned, true)
						client.groupRemove(from, mentioned)
					}
					break
				default:
					console.log(color('[ERROR]','red'), 'Unregistered Command from', color(sender.split('@')[0]))

			}
			
		} catch (e) {
			console.log('Error : %s', color(e, 'red'))
		}
	})
}
starts()
