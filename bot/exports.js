const { Client, RichEmbed } = require('discord.js');

let guilds = {}
let scrims = {}

// access: 0 = everyone; access: 1 = moderators; 2 = scrim hoster; access: 3 = administrators;
exports.commands = {
	// everyone
	help:{access:0,desc:"shows all available commands"},
	host:{access:2,desc:"host scrim game"},
	setup:{access:3,desc:"set up bot to function correctly"},
};

exports.newGuild = function(guild){
	if (guilds[guild.id] != undefined) return
	guilds[guild.id] = {
		setup:false,
		prefix:"!",
		modrole:"",
		mutedrole:"",
		scrimrole:"",
		hostrole:"",
		digitchan:"",
		countdownchan:"",
	}
	//if (guild.systemChannel != null) guild.systemChannel.send("Settings need to be set up, for bot to be fully functional. Type !setup for further instructions!")
}

exports.delGuild = function(guild){
	delete guilds[guild.id]
}

exports.setData = function(guild,prefix,modrole,mutedrole,scrimrole,hostrole,digitchan,countdownchan){
	let data;
	if (typeof prefix === "object") {
		data = prefix;
	}
	if (data != undefined) {
		Object.keys(data).forEach(function(key){
			if (guilds[guild.id][key] != undefined) guilds[guild.id][key] = data[key];
		})
	} else {
		if (prefix != undefined) guilds[guild.id].prefix = prefix;
		if (modrole != undefined) guilds[guild.id].modrole = modrole;
		if (mutedrole != undefined) guilds[guild.id].mutedrole = mutedrole;
		if (scrimrole != undefined) guilds[guild.id].scrimrole = scrimrole;
		if (hostrole != undefined) guilds[guild.id].hostrole = hostrole;
		if (digitchan != undefined) guilds[guild.id].digitchan = digitchan;
		if (countdownchan != undefined) guilds[guild.id].countdownchan = countdownchan;
	}
	if (guilds[guild.id].hostrole != "" && guilds[guild.id].digitchan != "" && guilds[guild.id].countdownchan != "") {
		guilds[guild.id].setup = true;
	} else {
		guilds[guild.id].setup = false;
	}
}

exports.getData = function(guild){
	return guilds[guild.id]
}

exports.one = function(val) {
	if (val == 0) return "now"; else return val+" minutes";
}

let updatelist = function(guild,last) {
	if (last === true) {
		scrims[guild.id].codes = false;
		const embed = new RichEmbed()
			.setColor(0xc1d9ff)
			.setTitle("Final Players")
		Object.keys(scrims[guild.id].codedata).forEach(function(key){
			let codeobj = scrims[guild.id].codedata[key];
			let user_str = "";
			Object.keys(scrims[guild.id].codedata[key]).every(function(key2,count){
				let user = scrims[guild.id].codedata[key][key2];
				user_str = user_str+user+"\n"
				if (count >= 15) {
					if (count > 15) user_str = user_str+"and more...";
					return false;
				};
			})
			embed.addField(key+" ("+Object.keys(codeobj).length+" players)",user_str,true)
		})

		let channel = guild.channels.find(channel => channel.name === guilds[guild.id].digitchan);
		if (scrims[guild.id].message) {
			channel.fetchMessage(scrims[guild.id].message)
				.then(msg => {
					msg.edit(embed);
				});
		}
	} else {
		const embed = new RichEmbed()
			.setColor(0xc1d9ff)
			.setTitle("Current Players")
		Object.keys(scrims[guild.id].codedata).forEach(function(key){
			let codeobj = scrims[guild.id].codedata[key];
			let user_str = "";
			Object.keys(scrims[guild.id].codedata[key]).every(function(key2,count){
				let user = scrims[guild.id].codedata[key][key2];
				user_str = user_str+user+"\n"
				if (count >= 15) {
					if (count > 15) user_str = user_str+"and more...";
					return false;
				};
			})
			embed.addField(key+" ("+Object.keys(codeobj).length+" players)",user_str,true)
		})

		let channel = guild.channels.find(channel => channel.name === guilds[guild.id].digitchan);
		if (scrims[guild.id].message === false) {
			channel.send(embed)
				.then(msg => {
					scrims[guild.id].message = msg.id;
				});
		} else {
			channel.fetchMessage(scrims[guild.id].message)
				.then(msg => {
					msg.edit(embed);
				});
		}
	}
}

let startgame = function(guild,channel1,channel2) {
	channel2.join().then(connection => {
		const dispatcher = connection.playFile('bot/sound/321.mp3');
		dispatcher.on('end', () => {
			channel2.leave();
			const embed2 = new RichEmbed()
				.setColor(0xc1d9ff)
				.addField("Waiting for server 3 digit codes...","Please enter them in here. They are located on top of your screen on left side in game, last 3 digits is the code.",false)
			channel1.send(embed2)
			scrims[guild.id].codes = true;
			scrims[guild.id].codedata = {}
			scrims[guild.id].message = false;
		});
	})
}

exports.startScrim = function(guild,host,type,time){
	const embed = new RichEmbed()
		.setColor(0x91bbff)
		.addField("Scrim Match Starting","Scrim match is starting in "+exports.one(time),false)
		.addField("Mode",type.toUpperCase(),true)
		.addField("Host",host,true)
		.addField("Instructions","Countdown will be made in countdown channel, where you'll need to ready up on go. First be sure to have content loaded in game, after that wait for further instructions.",false)
	
	let channel1 = guild.channels.find(channel => channel.name === guilds[guild.id].digitchan);
	let channel2 = guild.channels.find(channel => channel.name === guilds[guild.id].countdownchan);
	if (channel1 && channel2) {
		channel1.send(embed)
		scrims[guild.id] = {
			timer:setTimeout(function(){
				startgame(guild,channel1,channel2);
			}, time*60000),
			timer2:setTimeout(function(){
				updatelist(guild,true);
			}, 1*60000),
		};
	};
}

exports.stopScrim = function(guild){
	if (scrims[guild.id]) {
		if (scrims[guild.id].timer) clearTimeout(scrims[guild.id].timer)
		if (scrims[guild.id].timer2) clearTimeout(scrims[guild.id].timer2)
		delete scrims[guild.id]
	}
}

function replacecode(guild,user) {
	Object.keys(scrims[guild.id].codedata).forEach(function(key){
		Object.keys(scrims[guild.id].codedata[key]).forEach(function(key2,count){
			let userr = scrims[guild.id].codedata[key][key2];
			if (user.id == userr.id) delete scrims[guild.id].codedata[key][key2];
			if (Object.keys(scrims[guild.id].codedata[key]).length == 0) delete scrims[guild.id].codedata[key];
		})
	})
}

exports.setScrimData = function(guild,user,code){
	if (code.length > 3 || code.length < 3) return
	if (!scrims[guild.id].codedata[code]) scrims[guild.id].codedata[code] = {};
	replacecode(guild,user);
	scrims[guild.id].codedata[code][user.id] = user;
	updatelist(guild);
}

exports.getScrimData = function(guild){
	if (guild && scrims[guild.id]) return scrims[guild.id];
}