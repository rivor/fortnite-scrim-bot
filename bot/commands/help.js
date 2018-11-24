let _exports = require("../exports.js");

// access: 0 = everyone; access: 1 = moderators; access: 2 = administrators;
module.exports.main = function(msg,cmd) {
	_exports.getData(msg.guild,(data) => {
		let cmds_str = "\n";
		let check = {};
		Object.keys(_exports.commands).forEach(function(command){
			let access = _exports.commands[command].access;
			let description = _exports.commands[command].desc;
			if (!check[access] && access == 0) {
				check[access] = true;
				cmds_str = cmds_str+"  **General:**\n";
			} else if (!check[access] && access == 1) {
				check[access] = true;
				cmds_str = cmds_str+"  **Moderator:**\n";
			} else if (!check[access] && access == 2) {
				check[access] = true;
				cmds_str = cmds_str+"  **Scrim Hoster:**\n";
			} else if (!check[access] && access == 3) {
				check[access] = true;
				cmds_str = cmds_str+"  **Administrator:**\n";
			};
			cmds_str = cmds_str+"    "+data.prefix+command+" **|** "+description+"\n";
		});
		msg.reply(cmds_str);
	})
};