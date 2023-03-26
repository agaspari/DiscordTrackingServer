import fs from 'fs';
import cors from 'cors';
import config from './config.json';
import bodyParser from 'body-parser';
import express from 'express';
import api from './api';
import middleware from './middleware';
import Discord from 'discord.js';
import { initalizeConnection } from './util/database';
import { handleUserMessage, handleUserServerStatus, handleUserPresenceChange, handleMemberChange } from './tracking/';
import { SERVER_STATUS, PRESENCE_CHANGE_STATUS, MEMBER_CHANGE_STATUS } from './constants';

/* Command Setup */ 

export const bot = new Discord.Client();
bot.commands = new Discord.Collection();

const token = config.discordBotSettings.token;
const prefix = config.prefix;

const commandFiles = fs
	.readdirSync(`${__dirname}/commands/`)
	.filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	bot.commands.set(command.name, command);
}

/* Express Setup */

const app = express();
const PORT = config.expressSettings.port;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use(middleware({ config }));
app.use('/api', api({ config }));

app.listen(PORT, () => {
	console.log(`Your server is running on port: ${PORT}`);
});

/* Bot setup */

bot.on("ready", () => {
	console.log("Bot is running");
	//bot.user.setActivity(`Upgrades people, upgrades!`);
});


bot.on("guildMemberAdd", (member) => {
	handleUserServerStatus({ member, type: SERVER_STATUS.JOINED });
});

bot.on("guildMemberRemove", (member) => {
	handleUserServerStatus({ member, type: SERVER_STATUS.LEFT });
});

bot.on("guildMemberUpdate", (oldMember, newMember) => {
	if (oldMember.nickname != newMember.nickname) {
		handleMemberChange({ member: newMember, type: MEMBER_CHANGE_STATUS.NICKNAME });
	}
});

bot.on("voiceStateUpdate", function(oldState, newState){
	// if (oldState.guild.id == 341297200221126677 && newState.guild.id == 341297200221126677) {
	// 	if (newState.selfDeaf || (newState.serverMute && newState.serverDeaf)) {
	// 		newState.kick();
	// 	}
	// }
	if (oldState.channelID != 495852302725414922) {
		if (oldState.channelID != newState.channelID) {
			// User has either left, joined or moved channels
			
			if (!oldState.channelID) {
				// TODO: Look into either passing only the needed params, or always pass the object. In the below code, we are passing the user and guild object, but we are passing the channelID, and not the channel. This is due to the fact that presence object does not contain the VoiceChannel object.
				handleUserPresenceChange({ member: newState.member, channelId: newState.channelID, type: PRESENCE_CHANGE_STATUS.JOINED });
				// User has joined the channel
				
			} else if (!newState.channelID) {
				// User has left the channel
				handleUserPresenceChange({ member: oldState.member, channelId: oldState.channelID, type: PRESENCE_CHANGE_STATUS.LEFT });
	
			} else {
				// User has moved channels
				handleUserPresenceChange({ member: oldState.member, oldChannelId: oldState.channelID, newChannelId: newState.channelID, type: PRESENCE_CHANGE_STATUS.MOVED });
			}
		}
	}
});

bot.on("message", (msg) => {
	const { author, member, content, channel } = msg;
	if (author.bot) return;
	if (channel.type == 'dm') return;

  	let args = content.substring(prefix.length).split(" ");

  	if (content.charAt(0) === prefix) {
		switch (args[0]) {
			case "ban":
				bot.commands.get("ban").execute(msg, args);
				break;
		}
	} else {
		// Handle non-command
		const { guild, createdAt } = msg;
		handleUserMessage({ channel, member, message: msg });
	}
});

bot.login(token);

/* Database */
initalizeConnection();