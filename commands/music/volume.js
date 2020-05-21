const logging = require(`../../utils/logging`);
const handlerInfo = {
    commandModule: 'music',
    commandHandler: 'volume'
};

module.exports = {
    name: "volume",
    description: "Change volume of the currently playing song.",
     guildOnly: true,
     args: true,
     aliases: ['vol'],
     usage: `<number 0-100>`,
     execute(message, args) {
         logging.trace(handlerInfo, {EVENT: `\`volume\` command fired with args: ${args[0]}`});

         if (!message.member.voice.channel) {
             return message.channel.send('You have to be in a voice channel to use the music!');
         }

         const serverQueue = message.client.serverQueue;
         const guildSongQueue = serverQueue.get(message.guild.id);

         if (!guildSongQueue) {
             return message.channel.send(`No song is playing at the moment...`);
         }

         if((parseInt(args[0]) > 100 || parseInt(args[0]) < 0) || isNaN(args[0])) {
             message.reply("Please use a number between 0 - 100.");
             return message.channel.send(`The current volume is: **${guildSongQueue.volume}%**`)
         }

         guildSongQueue.volume = args[0];
         guildSongQueue.connection.dispatcher.setVolumeLogarithmic(args[0] / 100);

         return message.channel.send(`Volume set to: **${args[0]}%**`);
   }
 };