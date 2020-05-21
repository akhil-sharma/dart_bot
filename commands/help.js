const { MessageEmbed } = require("discord.js");
const PREFIX = process.env.PREFIX;


module.exports = {
  name: "help",
  description: "Display all commands and descriptions",
  execute(message) {
    let commands = message.client.commands.array();
    
    let helpEmbed = new MessageEmbed()
    .setTitle("Help")
    .setDescription("List of all commands")
    .setColor("#F8AA2A");

    commands.forEach(cmd => {
      helpEmbed.addField(
        `${PREFIX}${cmd.name}`,
        `${cmd.description}`
      );
    });

    helpEmbed.setTimestamp();

    return message.channel.send(helpEmbed);
  }
};