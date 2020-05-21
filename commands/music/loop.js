const logging = require(`../../utils/logging`);
const handlerInfo = {
    commandModule: 'music',
    commandHandler: 'loop'
};

module.exports = {
    name: "loop",
    description: "Toggle a loop on the current song.",
    guildOnly: true,
    execute(message) {
        logging.trace(handlerInfo, {EVENT: `\`loop\` command fired.`});

        if (!message.member.voice.channel) {
            return message.channel.send('You have to be in a voice channel to use the music!');
        }

        const serverQueue = message.client.serverQueue;
        const guildSongQueue = serverQueue.get(message.guild.id);

        if (!guildSongQueue || !guildSongQueue.playing) {
            return message.channel.send(`No song is playing at the moment...`);
        }

        const newLoopStatus = !guildSongQueue.looping; 
        guildSongQueue.looping = newLoopStatus;
        
        const replyString =  newLoopStatus ? 
                            `Looping is on. You can still skip the current song or add new ones.` :
                            `Looping is now turned off.`

        return message.channel.send(replyString);
   }
 };