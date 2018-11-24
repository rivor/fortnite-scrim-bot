let _exports = require("../exports.js");

module.exports.main = function(msg,cmd,type,minutes) {
	_exports.getData(msg.guild,(data) => {
		if (!data.setup) return msg.reply(`settings aren't set up correctly, for bot to be fully functional. Type ${data.prefix}setup for further instructions!`)
		if (!type) return msg.reply(`Syntax for hosting games ${data.prefix}host <solo/duo/squad or "stop" to cancel> <starts in (minutes, leave blank for instant start)>`)
		if (type != "solo" && type != "duo" && type != "squad" && type != "stop") return msg.reply("wrong type, available <solo/duo/squad>")
		if (!minutes || minutes == " ") minutes = 0;
		if (type === "stop") {
			_exports.stopScrim(msg.guild)
			msg.reply("Scrim stopped")
		} else {
			_exports.startScrim(msg.guild,msg.member,type,minutes)
			msg.reply("Starting scrim, type "+type+" starting in "+_exports.one(minutes))
		}
	});
};