const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const PREFIX = process.env.PREFIX;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Display all commands and their descriptions.'),
  
  async execute(interaction) {
    let commands =  [...interaction.client.commands.values()]
    
    let helpEmbed = new EmbedBuilder()
    .setTitle("Help")
    .setDescription("List of all commands")
    .setColor("#F8AA2A")

    commands.forEach(cmd => {
      helpEmbed.addFields({ name: `${PREFIX}${cmd.data.name}`, value: `${cmd.data.description}`});
    });

    helpEmbed.setTimestamp();

    return interaction.reply({embeds: [helpEmbed]});
  }
};