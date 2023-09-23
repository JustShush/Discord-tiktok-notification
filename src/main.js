// TikTok Notifications
const color = require('colors');
const axios = require('axios');
const fs = require("fs");
const { Client, GatewayIntentBits, Partials, ActivityType } = require("discord.js");
const { Guilds, GuildMembers, GuildMessages, GuildPresences, MessageContent } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember, Reaction } = Partials;

const client = new Client({
	intents: [Guilds, GuildMembers, GuildMessages, GuildPresences, MessageContent],
	partials: [User, Message, GuildMember, ThreadMember, Reaction],
});

const config = require("../config.json");

const channelId = '940607525978509333';
const tiktokUsername = config.ttAcc;
let lastVideoId = config.lastVideoId;

const options = {
	method: 'GET',
	url: 'https://scraptik.p.rapidapi.com/user-posts',
	params: {
		user_id: config.user_id,
		count: '10',
		max_cursor: '0'
	},
	headers: {
		'X-RapidAPI-Key': config.Key,
		'X-RapidAPI-Host': config.Host
	}
};

async function checkTikTok() {
	try {
		const response = await axios.request(options);
		const videoId = response.data.aweme_list[0].group_id;
		if (videoId !== lastVideoId) {
			fs.readFile("config.json", 'utf8', (err, data) => {
				if (err) { console.log(err); return; }
				const json = JSON.parse(data);
				json.lastVideoId = videoId;
				const updateJson = JSON.stringify(json, null, 4);
				fs.writeFile("config.json", updateJson, "utf8", (err) => {
					if (err) { console.log(err); return; }
					console.log("JSON file has been updated!")
				});
			});
			const channel = client.channels.cache.get(channelId);
			if (channel) {
				channel.send(`Novo TikTok do Rizzer acbabou de sair: https://www.tiktok.com/@${tiktokUsername}/video/${videoId}\n||@everyone||`);
				console.log(`https://www.tiktok.com/@${tiktokUsername}/video/${videoId}`);
			}
		}
	} catch (error) {
		console.error('Error checking TikTok:', error);
	}
	// Check TikTok periodically (e.g., every 15 minutes)
	setTimeout(checkTikTok, 30 * 60 * 1000); // * Later change this to 30 min
}

client.on('ready', async () => {

	const updateActivities = () => {
		const options = [{
			type: ActivityType.Watching,
			text: `Over ${client.guilds.cache.size} servers! 🙂`,
			status: "online",
		}, {
			type: ActivityType.Listening,
			text: " /help | yourbestbot.pt/support",
			status: "online"
		}, {
			type: ActivityType.Watching,
			text: `Over ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)} Users!`,
			status: "online"
		}, {
			type: ActivityType.Listening,
			text: `new updates soon™`,
			status: "idle"
		}];
		const option = Math.floor(Math.random() * options.length);

		client.user.setPresence({
			activities: [{
				name: options[option].text,
				type: options[option].type,
			}],
			status: options[option].status,
		})
		setTimeout(updateActivities, 1 * 60 * 1000);
	}
	updateActivities();

	client.guilds.cache.forEach(guild => {
		console.log(`${guild.name} | ${guild.id}`.brightRed);
	})
	console.log(`${client.user.username} is on-line!\nIn ${client.guilds.cache.size} Servers!`.brightMagenta.bold);

	checkTikTok();
})

client.login(config.TOKEN);