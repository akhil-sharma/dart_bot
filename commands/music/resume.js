const logging = require(`../../logging`);
const handlerInfo = {
    commandModule: 'music',
    commandHandler: 'resume'
};

module.exports = {
    name: `resume`,
    description: `Resume the paused song.`,
    guildOnly: true,
    aliases: [`continue`],
    execute (message){
        logging.trace(handlerInfo, {EVENT: `\`resume\` command fired.`});
        
        if (!message.member.voice.channel) {
            return message.channel.send('You have to be in a voice channel to resume the music!');
        }

        const serverQueue = message.client.serverQueue;
        const guildSongQueue = serverQueue.get(message.guild.id);
        
        if (typeof guildSongQueue == undefined || !guildSongQueue.dispatcher) {
            return message.channel.send(`No song is playing at the moment...`);
        }

        if(guildSongQueue.dispatcher.paused){
            //check if the stream is paused
            guildSongQueue.connection.dispatcher.resume();
            message.channel.send(`${guildSongQueue.nowPlaying.title} ## resumed ##`);
        
        } else {
            //ignore
        }
    }
}