const logging = require(`../../utils/logging`);
const handlerInfo = {
    commandModule: 'music',
    commandHandler: 'skip'
};

module.exports = {
    name: `skip`,
    description: `Skip the current song.`,
    guildOnly: true,
    execute (message){
        logging.trace(handlerInfo, {EVENT: `\`skip\` command fired`});

        if (!message.member.voice.channel) {
            return message.channel.send('You have to be in a voice channel to skip the music!');
        }

        const serverQueue = message.client.serverQueue;
        const guildSongQueue = serverQueue.get(message.guild.id);
        
        if (!guildSongQueue || !guildSongQueue.dispatcher){
            return message.reply(`No song is playing...`);
        }
        
        if(guildSongQueue.dispatcher.paused) {
            //resume the paused song first
            //guildSongQueue.dispatcher.resume();
            return message.reply(`No song is playing...`);
        }

        message.channel.send(`*skipping* ~ ${guildSongQueue.nowPlaying.title}`);
        guildSongQueue.connection.dispatcher.end();
    }
}