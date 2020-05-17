const ytdl = require('ytdl-core-discord');

module.exports = {
    name: `play`,
    description: `Play a song.`,
    args: true,
    usage: `<youtube-video-link>`,
    async execute(message, args) {
        try {
            const voiceChannel = message.member.voice.channel;
            if(!voiceChannel){
                return message.channel.send(`You need to be in a voice channel to play music.`);
            }

            const permissions = voiceChannel.permissionsFor(message.client.user);
            if(!permissions.has('CONNECT') || !permissions.has('SPEAK')){
                return message.channel.send(`I need permission to join and speak in your voice channel.`);
            }


            let songName = args[0];
            let songInfo = await ytdl.getInfo(songName);
            let song = {
                title: songInfo.title,
                url: songInfo.video_url
            };
            
            const serverQueue = message.client.serverQueue;
            const guildSongQueue = serverQueue.get(message.guild.id);

            if(!guildSongQueue) {
                const queueConstruct = {
                    textChannel: message.channel,
                    voiceChannel: voiceChannel,
                    connection: null,
                    songs: [],
                    volume: 5,
                    playing: true
                };

                serverQueue.set(message.guild.id, queueConstruct);
                
                queueConstruct.songs.push(song);

                try{
                    const connection = await voiceChannel.join();
                    queueConstruct.connection = connection;
                    play(message, queueConstruct.songs[0]);
                } catch (error){
                    console.log(error);
                    serverQueue.delete(message.guild.id);
                    return message.channel.send(error);
                }
            } else {
                guildSongQueue.songs.push(song);
                console.log(guildSongQueue.songs);
                return message.channel.send(`${song.title} has been added to the queue!`);
            }
        } catch (error) {
            console.log(error);
            message.channel.send(error.message);
        }       
    }
}


const play = async (message, song) => {
    const serverQueue = message.client.serverQueue;
    const guildSongQueue = serverQueue.get(message.guild.id);

	if (!song) {
		guildSongQueue.voiceChannel.leave();
		serverQueue.delete(message.guild.id);
		return;
	}

	const dispatcher = guildSongQueue.connection.play(await ytdl(song.url), {type: 'opus'});
    
    dispatcher.on('finish', () => {
        //To account for early firing of `finish`
        setTimeout(()=>{
            console.log('Music ended!');
            guildSongQueue.songs.shift();
            play(message, guildSongQueue.songs[0]);
        }, 5000);
    });
        
    dispatcher.on('error', error => {
			console.error(error);
		});
    dispatcher.setVolumeLogarithmic(guildSongQueue.volume / 5);
    guildSongQueue.textChannel.send(`Now playing: ### ${song.title} ###`);
}