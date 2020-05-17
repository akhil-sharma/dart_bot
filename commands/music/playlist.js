module.exports = {
    name: `playlist`,
    description: `Display the list of songs in the queue.`,
    execute (message){
        console.log(message.member.voice.channel);
        
        const serverQueue = message.client.serverQueue;
        const guildSongQueue = serverQueue.get(message.guild.id);

        if(!guildSongQueue){return }
        
        message.channel.send(formatPlaylist(guildSongQueue.songs));
    }
}

const formatPlaylist = (playlistArray) => {
    let playlistString = 
    `Playlist\n-------------------\n`;
    let count = 1;

    playlistArray.forEach(song => {
        playlistString += `${count}   -  ${song.title}\n`;
        count += 1;
    });
    return playlistString;
}