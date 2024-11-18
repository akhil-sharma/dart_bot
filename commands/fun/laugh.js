const {SlashCommandBuilder} = require('discord.js');

const { LAUGH_STRING_ARRAY } = require('../../utils/constants');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('xd')
        .setDescription('This command sends a message with a random laugh when it encounters XD'),

    async execute(interaction ){
        const randomLaughter = LAUGH_STRING_ARRAY[Math.floor(Math.random() * LAUGH_STRING_ARRAY.length)];
        interaction.reply(`${randomLaughter}`);
    }
}