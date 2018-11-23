const Discord = require("discord.js");
const client = new Discord.Client();

client.login(""); // your bot token goes in between "<token>"

const fs = require('fs');
const commands_path = require("path").join(__dirname, "commands");

const _exports = require("./exports.js");

let tempcommands = {};

fs.readdirSync(commands_path).forEach(function(file) {
	let command = file.substr(0,file.length-3);
	tempcommands[command] = require("./commands/"+command+".js").main;
});

let hasAccess = function(access,member) {
	let role;
	let isAdmin = member.hasPermission("ADMINISTRATOR");
	switch(access) {
		case 0:
			return true;
		case 1:
			role = _exports.getData(member.guild).modrole;
			if (isAdmin) return true;
			if (role != "") {
				let modrole = member.guild.roles.find("name",role);
				if (modrole) if (member.roles.has(modrole.id)) return true;
			};
			return false;
		case 2:
			role = _exports.getData(member.guild).hostrole;
			if (isAdmin) return true;
			if (role != "") {
				let hostrole = member.guild.roles.find("name",role);
				if (hostrole) if (member.roles.has(hostrole.id)) return true;
			};
			return false;
		case 3:
			if (isAdmin) return true;
			return false;
	}
}

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
				if (hasAccess(access,msg.member)) {
					tempcommands[command](msg,...args);
				} else {
					return msg.reply(no_perm_str);
				}
			};
		});
		if (!found) {
			msg.reply("command ``"+prefix+""+args[0]+"`` not found! Type ``"+prefix+"help`` to see all commands.");
		};
	} else if (msg.channel.name == data.digitchan) {
		let scrimData = _exports.getScrimData(msg.guild)
		if (scrimData && scrimData.codes) {
			_exports.setScrimData(msg.guild,msg.author,msg.content);
			msg.delete();
		};
	}
});