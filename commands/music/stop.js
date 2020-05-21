const logging = require(`../../utils/logging`);
const handlerInfo = {
    commandModule: 'music',
    commandHandler: 'stop'
};

module.exports = {
    name: `stop`,
    description: `Stop all songs and clear the playlist.`,
    guildOnly: true,
    aliases: [`skipall`],
    execute (message){
        logging.trace(handlerInfo, {EVENT: `\`stop\` command fired.`});
        
        if (!message.member.voice.channel) {
            return message.channel.send('You have to be in a voice channel to resume the music!');
        }

        const serverQueue = message.client.serverQueue;
        const guildSongQueue = serverQueue.get(message.guild.id);
        
        if (!guildSongQueue || !guildSongQueue.dispatcher) {
            return message.channel.send(`No song is playing at the moment...`);
        }

        if(guildSongQueue.dispatcher.paused){
            guildSongQueue.connection.dispatcher.resume();
        }

        if(guildSongQueue.looping){
            // turn off the looping
            guildSongQueue.looping = false;
        }

        guildSongQueue.songs = [];
        guildSongQueue.connection.dispatcher.end();
    }
}
