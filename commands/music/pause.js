const logging = require(`../../logging`);
const handlerInfo = {
    commandModule: 'music',
    commandHandler: 'pause'
};

module.exports = {
    name: `pause`,
    description: `Pause the song.`,
    guildOnly: true,
    aliases: [`pause`],
    usage: ``,
    execute (message){
        logging.trace(handlerInfo, {EVENT: `\`pause\` command fired.`});
        
        if (!message.member.voice.channel) {
            return message.channel.send('You have to be in a voice channel to ause the music!');
        }

        const serverQueue = message.client.serverQueue;
        const guildSongQueue = serverQueue.get(message.guild.id);
        
        if (!guildSongQueue) {
            return message.channel.send(`No song is playing at the moment...`);
        }

        guildSongQueue.connection.dispatcher.pause();
        message.channel.send(`${guildSongQueue.nowPlaying.title} ## paused ##`);
    }
}