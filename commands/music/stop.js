module.exports = {
    name: `stop`,
    description: `Stop the songs from playing. Requires a --confirm argument.`,
    args: true,
    usage: `--confirm`,
    execute (message, args){
        
        if (!message.member.voice.channel) {
            return message.channel.send('You have to be in a voice channel to stop the music!');
        }

        if(args[0] !== '--confirm'){
            return message.channel.send(`Invalid argument. Try \`stop --confirm\`.`);
        }
        const serverQueue = message.client.serverQueue;
        const guildSongQueue = serverQueue.get(message.guild.id);

        //clear the songs list
        guildSongQueue.songs = [];
        guildSongQueue.connection.dispatcher.end();
    }
}