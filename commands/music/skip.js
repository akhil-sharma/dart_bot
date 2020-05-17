module.exports = {
    name: `skip`,
    description: `Skip the current song.`,
    execute (message){
        
        if (!message.member.voice.channel) {
            return message.channel.send('You have to be in a voice channel to skip the music!');
        }
        
        const serverQueue = message.client.serverQueue;
        const guildSongQueue = serverQueue.get(message.guild.id);
        if (!guildSongQueue) {
            return message.channel.send(`Nothing to skip...`);
        }

        guildSongQueue.connection.dispatcher.end()        
    }
}