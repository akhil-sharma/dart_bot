module.exports = {
    name: `nowplaying`,
    description: `Displays the name of the current song.`,
    execute(message){
        const serverQueue = message.client.serverQueue;
        const guildSongQueue = serverQueue.get(message.guild.id);
        if(!guildSongQueue) {
            return message.channel.send(`I don't think anything is playing...`);
        }
        
        return message.channel.send(`Now playing: ${guildSongQueue.songs[0].title}`);
    }
}