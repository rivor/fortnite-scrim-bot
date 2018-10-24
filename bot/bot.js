const Discord = require("discord.js");
const client = new Discord.Client();

const fs = require('fs');
const commands_path = require("path").join(__dirname, "commands");

const _exports = require("./exports.js");

// access: 0 = everyone; access: 1 = moderators; access: 2 = administrators;
let tempcommands = {};

fs.readdirSync(commands_path).forEach(function(file) {
	let command = file.substr(0,file.length-3);
	tempcommands[command] = require("./commands/"+command+".js").main;
});

let isAdmin = function(member) {
	if (member.hasPermission("ADMINISTRATOR")) return true;
	return false;
};

let isMod = function(member) {
	let role = _exports.getData(member.guild).modrole;
	if (isAdmin(member)) return true;
	if (role != "") {
		let role_moderator = member.guild.roles.find("name",role);
		if (member.roles.has(role_moderator.id)) return true;
	};
	return false;
};

let isHoster = function(member) {
	let role = _exports.getData(member.guild).hostrole;
	if (isAdmin(member)) return true;
	if (role != "") {
		let role_hoster = member.guild.roles.find("name",role);
		if (member.roles.has(role_hoster.id)) return true;
	};
	return false;
};

client.on("ready", () => {
	console.log(`connected as ${client.user.tag}`);
	client.user.setActivity("Scrim Games");
	client.guilds.forEach(function(guild){
		_exports.newGuild(guild);
		console.log("Guild `"+guild.name+"` Members `"+guild.memberCount+"`")
	})
});

client.on('guildCreate', guild => {
	_exports.newGuild(guild);
});

client.on('guildDelete', guild => {
	_exports.delGuild(guild);
});

client.on('guildMemberAdd', member => {
	//
});

client.on("message", msg => {
	if (msg.author.bot) return;
  
  	let data = _exports.getData(msg.guild);
  	let prefix = data.prefix
	if (msg.content.startsWith(prefix)) {
		let found = false;
		let args = msg.content.substring(1);
		let no_perm_str = "You don't have access to this command!";
		args = args.split(" ");
		Object.keys(_exports.commands).forEach(function(command){
			let access = _exports.commands[command].access;
			if (args[0] == command) {
				found = true;
				if (access == 1 && !isMod(msg.member)) {
					return msg.reply(no_perm_str);
				} else if (access == 2 && !isHoster(msg.member)) {
					return msg.reply(no_perm_str);
				} else if (access == 3 && !isAdmin(msg.member)) {
					return msg.reply(no_perm_str);
				};
				tempcommands[command](msg,...args);
			};
		});
		if (!found) {
			msg.reply("command ``"+prefix+""+args[0]+"`` not found! Type ``"+prefix+"help`` to see all commands.");
		};
	} else if (msg.channel.name == data.digitchan) {
		let scrimData = _exports.getScrimData(msg.guild)
		if (scrimData && scrimData.codes) _exports.setScrimData(msg.guild,msg.author,msg.content);
	}
});

client.login("");