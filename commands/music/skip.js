const logging = require('../../logging');
const handlerInfo = {
    commandModule: 'music',
    commandHandler: 'skip'
};

module.exports = {
    name: `skip`,
    description: `Skip the current song. Note: skip will not work if a song is paused.`,
    guildOnly: true,
    usage: ``,
    execute (message){
        logging.trace(handlerInfo, {EVENT: `\`skip\` command fired`});

        if (!message.member.voice.channel) {
            return message.channel.send('You have to be in a voice channel to skip the music!');
        }

        const serverQueue = message.client.serverQueue;
        const guildSongQueue = serverQueue.get(message.guild.id);
        
        if (typeof guildSongQueue == undefined || guildSongQueue.dispatcher.paused) {
            return message.channel.send(`No song is playing at the moment...`);
        }

        guildSongQueue.connection.dispatcher.end();
        message.channel.send(`${guildSongQueue.nowPlaying.title} ## skipping ##`);
    }
}