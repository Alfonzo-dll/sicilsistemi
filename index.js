const db = require('quick.db');
const Discord = require('discord.js');
const client = new Discord.Client();

const Moment = require('moment');
Moment.locale('TR');

const kdb = new db.table('kullanici');

const { token } = require('./config.json');

client.on('ready', () => {
	console.log('Client is now ready!')
})

client.on('guildMemberAdd', (member) => {
	member.roles.add('821348466990907412')
})

client.on('message', async (message) => {
	let prefix = '-';

	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content
	.slice(prefix.length)
	.trim()
	.split(/ +/);

	const command = args
	.shift()
	.toLowerCase();

	if (command == 'yardım') {
		const Embed = new Discord.MessageEmbed()
		.setColor('BLUE')
		.addFields([
			{ name: ':lock: MODERASYON', value: `\`kick\`` },
		])

		message.channel.send({ embed: Embed })
	}

	if (command == 'kick') {
		if (!message.member.hasPermission('KICK_MEMBERS')) {
			return message.channel.send('Yetkiniz bulunmuyor!')
		}

		const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
		let reason = args.slice(1).join(' ');

		if (!reason) {
			reason = 'Sebep belirtilmemiş!'
		}

		if (!member) {
			return message.channel.send('Lütfen bir kişi belirt!')
		}

		if (member.roles.highest.position >= message.member.roles.highest.position) {
			return message.channel.send('Belirttiğin kullanıcı senle eşit rolde veya senden daha yüksek!')
		}

		if (member.id === message.author.id) {
			return message.channel.send('Kendine işlem uygulayamazsın!')
		}

		if (member.id === message.guild.ownerID) {
			return message.channel.send('Sunucu sahibine işlem uygulayamazsın!')
		}
		
        let cezaTarih = Moment(message.createdAt).format('LLL')

		kdb.push(`kullanici.${member.id}.sicil`, {
			Yetkili: message.author.id,
			Sebep: reason,
			Ceza: 'Kick',
			Süre: 'Sınırsız',
			Tarih: cezaTarih
		})
		
        member.kick(reason)
		const Embed = new Discord.MessageEmbed()
		.setColor('BLUE')
		.setDescription(`${member} (\`${member.id}\`) adlı kullanıcı başarıyla sunucudan atıldı!
		
		• Atan yetkili: <@!${message.author.id}> (\`${message.author.id}\`)
		• Atılma tarihi: \`${cezaTarih}\`
		• Atılma sebebi: \`${reason}\`
		`)

		message.channel.send({ embed: Embed })
	}

	if (command == 'sicil') {
		let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.author;

		let sicil = kdb.get(`kullanici.${member.id}.sicil`) || [];
		sicil = sicil.reverse()

		let sicilPanel = sicil.length > 0 ? sicil.map((value) => `• Ceza türü: \`${value.Ceza}\`\n\n• Atan yetkili: <@!${value.Yetkili}> (\`${value.Yetkili}\`)\n• Atılma tarihi: \`${value.Tarih}\`\n• Atılma sebebi: \`${value.Sebep}\`\n• Süre: \`${value.Süre}\` `).join("\n\n") : "Bu kullanıcının sicili temiz!";

		const Embed = new Discord.MessageEmbed()
		.setColor('BLUE')
		.setDescription(`${member} adlı kullanıcının sicili \n\n ${sicilPanel}`)

		message.channel.send({ embed: Embed })

	}

	if (command == 'sicil-sıfırla') {
		let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.author;

		if (!member) {
			return message.channel.send('Lütfen bir kişi belirt!')
		}

		kdb.delete(`kullanici.${member.id}.sicil`)
		message.channel.send(`${member} kullanıcısına ait verileri başarıyla sıfırladım!`)
	}
})

client.login(token)