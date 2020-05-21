const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const ytdl = require('ytdl-core-discord');
const { MessageEmbed } = require('discord.js');
const Youtube = require('simple-youtube-api');
const youtube = new Youtube(YOUTUBE_API_KEY);

const commonFunctions = require('../../utils/common_functions');
const logging = require(`../../utils/logging`);
const handlerInfo = {
    commandModule: 'music',
    commandHandler: 'play'
};

module.exports = {
    name: `play`,
    description: `Play a song or a playlist form Youtube. Use a link or just search by name.`,
    args: true,
    cooldown: 5,
    guildOnly: true,
    aliases: ['p'],
    usage: `<song-name> or <youtube-url> or <youtube-playlist-url>`,
    async execute(message, args) {
        logging.trace(handlerInfo, {EVENT: `\`play\` command fired with args :: ${args}`});

        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel){
            let responseString = `You need to be in a voice channel to play music.`;
            logging.trace(handlerInfo, responseString);
            return message.channel.send(responseString);
        }

        const permissions = voiceChannel.permissionsFor(message.client.user);
        if(!permissions.has('CONNECT') || !permissions.has('SPEAK')){
            let responseString = `I need permission to join and speak in your voice channel.`;
            logging.trace(handlerInfo, responseString);
            return message.channel.send(responseString);
        }

        // Any new song will be push into this array before adding to the guildSongQueue
        let newSongsArray = [];

        try {
            ///New code starting here
            let queryString = args.join(' ');
            
            //check for playlist url 
            if (queryString.match(/^(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*$/)){
                const playlist = await youtube.getPlaylist(queryString).catch(function() {
                    return message.channel.send(`Playlist is either private or it does not exist!`);
                });

                const videosObj = await playlist.getVideos(30).catch(function() {
                    return message.channel.send(`There was a problem getting one of the videos in the playlist!`);
                });

                for (let i = 0; i < videosObj.length; i++) {
                    if (videosObj[i].raw.status.privacyStatus == 'private') continue;
                    const video = await videosObj[i].fetch();
                    newSongsArray.push(
                        createSongObject(video, voiceChannel)
                    );
                }
            }
            // check for simgle video url
            else if (queryString.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
                queryString = queryString
                  .replace(/(>|<)/gi, '')
                  .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
                const id = queryString[2].split(/[^0-9a-z_\-]/i)[0];
                const video = await youtube.getVideoByID(id).catch(function() {
                    return message.channel.send(`There was a problem getting the video you provided!`);
                });

                newSongsArray.push(
                    createSongObject(video, voiceChannel)
                );
            } 
            // search for video by name
            else {
                const videos = await youtube.searchVideos(queryString, 5).catch(function() {
                    return message.channel.send(`There was a problem searching the video you requested :(`);
                });
                if (videos.length < 5) {
                    return message.channel.send(`I had some trouble finding what you were looking for, please try again or be more specific`);
                }

                const videoArray = [];
                for (let i = 0; i < videos.length; i++) {
                    videoArray.push(`${i + 1}: ${videos[i].title}`);
                }
                videoArray.push('exit');
                
                const embed = new MessageEmbed()
                    .setColor('#e9f931')
                    .setTitle('Choose a song by commenting a number between 1 and 5')
                    .addField('Song 1', videoArray[0])
                    .addField('Song 2', videoArray[1])
                    .addField('Song 3', videoArray[2])
                    .addField('Song 4', videoArray[3])
                    .addField('Song 5', videoArray[4])
                    .addField('Exit', videoArray[5]);
                let songEmbed = await message.channel.send({ embed });

                let userResponse = await message.channel.awaitMessages(
                    (msg) => {
                        return (msg.content > 0 && msg.content < 6) || msg.content === 'exit';
                    },
                    {
                        max: 1,
                        time: 60000,
                        errors: ['time']
                    }
                ).catch((error) => {
                    logging.error(handlerInfo, {EVENT: `Invalid user response to song selection embed`}, {Error: error});
                    
                    if (songEmbed) {
                        songEmbed.delete();
                    }
                    return message.channel.send('Please try again and enter a number between 1 and 5 or exit');
                });

                if (userResponse.first().content === 'exit') {
                    return songEmbed.delete();
                }

                const videoIndex = parseInt(userResponse.first().content);
                const video = await youtube.getVideoByID(videos[videoIndex - 1].id).catch((error) => {
                    logging.error(handlerInfo, 
                        {EVENT: `Invalid video id for youtube.getVideoById(\`${videos[videoIndex - 1].id}\`)`}, 
                        {Error: error}
                    );
                    
                    if (songEmbed) {
                        songEmbed.delete();
                    }
                    return message.channel.send('An error has occured when trying to get the video ID from youtube');

                });

                if (video.duration.hours !== 0) {
                    songEmbed.delete();
                    return message.say('I cannot play videos longer than 1 hour');
                }

                newSongsArray.push(
                    createSongObject(video, voiceChannel)
                );

                if(songEmbed){
                    songEmbed.delete();
                }
            }

            const serverQueue = message.client.serverQueue;
            const guildSongQueue = serverQueue.get(message.guild.id);

            if(!guildSongQueue){
                //creating a new queue for songs

                const queueConstruct = {
                    textChannel: message.channel,
                    voiceChannel: voiceChannel,
                    connection: null,
                    songs: [],
                    volume: 50,
                    playing: false,
                    nowPlaying: null,
                    dispatcher: null,
                    looping: false
                };

                serverQueue.set(message.guild.id, queueConstruct);
                
                queueConstruct.songs = [...queueConstruct.songs, ...newSongsArray];
                logging.trace(handlerInfo, {EVENT: `queueConstruct.songs populated :: queueConstruct.song.length :: ${queueConstruct.songs.length}`})

                try{
                    const connection = await voiceChannel.join();
                    queueConstruct.connection = connection;
                    play(message, queueConstruct.songs[0]);
                
                } catch (error){
                    logging.error(handlerInfo, {EVENT: `\`play\` method was called on new queueConstruct.songs array :: song :: ${queueConstruct.songs[0].title}`}, {ERROR: error});
                    serverQueue.delete(message.guild.id);
                    return message.channel.send(`Ummm... Try again?`);
                }
            }else { 
                //Adding songs to a guildSongQueue.songs array.

                guildSongQueue.songs = [...guildSongQueue.songs, ...newSongsArray];
                logging.trace(handlerInfo, {EVENT: `guildSongQueue.songs populated :: new guildSongQueue.songs.length :: ${guildSongQueue.songs.length}`});

                const newSongsQueueEmbed = new MessageEmbed()
                    .setColor(`#ff7373`)
                    .setTitle(`New Song${newSongsArray.length > 1 ? "s" : ""} added to the queue\n`);
                let counter = 1;
                newSongsArray.forEach(song => {
                    newSongsQueueEmbed.addField(`${counter}:`, `${song.title} : ${song.duration}`);
                    counter += 1;
                });
                return message.channel.send(newSongsQueueEmbed);
            }

        } catch (error) {
            logging.error(handlerInfo, {EVENT: `Caught error in \`play\` command.`}, {ERROR: error});
            message.channel.send(`Something went wrong...`);
        }       
    }
}

const createSongObject = (video, voiceChannel) => {
    let duration = commonFunctions.formatSongDuration(video.duration);
    if (duration == '00:00') duration = 'Live Stream';
    return {
        url: `https://www.youtube.com/watch?v=${video.raw.id}`,
        title: video.title,
        rawDuration: video.duration,
        duration,
        thumbnail: video.thumbnails.high.url,
        voiceChannel
    };
}

const play = async (message, song) => {
    logging.trace(handlerInfo, {EVENT: `play method called for song :: ${song.title}`});
    
    const serverQueue = message.client.serverQueue;
    const guildSongQueue = serverQueue.get(message.guild.id);

    try {

        const dispatcher = guildSongQueue.connection.play(await ytdl(song.url), {
            type: 'opus', 
            quality: 'highestaudio', 
            highWaterMark: 50, //pre save 50 voice packets >> in case of failure the baseplayer ffmpeg arguments instead
            bitrate: 192000
        });
        
        dispatcher.on('start', () => {
            logging.trace(handlerInfo, {EVENT: `Fired \`start\` for ${guildSongQueue.songs[0].title}`});
            dispatcher.setVolumeLogarithmic(guildSongQueue.volume / 100);
            guildSongQueue.dispatcher = dispatcher;
            
            const videoEmbed = new MessageEmbed()
              .setThumbnail(guildSongQueue.songs[0].thumbnail)
              .setColor('#e9f931')
              .addField('Now Playing:', guildSongQueue.songs[0].title)
              .addField('Duration:', guildSongQueue.songs[0].duration);
            if (guildSongQueue.songs[1]) videoEmbed.addField(`Next Song:`, `${guildSongQueue.songs[1].title} : ${guildSongQueue.songs[1].duration}`);

            guildSongQueue.playing = true;
            guildSongQueue.nowPlaying = guildSongQueue.songs[0];

            return message.channel.send(videoEmbed);
        });
        
        dispatcher.on('finish', () => {
            logging.trace(handlerInfo, {EVENT: `Fired \`finish\` for ${guildSongQueue.nowPlaying ? guildSongQueue.nowPlaying.title : `null_song`}`});
            guildSongQueue.playing = false;
            guildSongQueue.nowPlaying = null;
            if(guildSongQueue.dispatcher){
                guildSongQueue.dispatcher.destroy()
            }

            if(guildSongQueue.looping){
                //Add current song to the end of queue
                let lastSong = guildSongQueue.songs.shift();
                guildSongQueue.songs.push(lastSong);
                return play(message, guildSongQueue.songs[0]);
            }
            else if(guildSongQueue.songs[1]){
                guildSongQueue.songs.shift();
                return play(message, guildSongQueue.songs[0]);
            
            }else{
                guildSongQueue.voiceChannel.leave();
                serverQueue.delete(message.guild.id);
                return message.channel.send(`No more songs left to play...`);
            }
        });

        dispatcher.on('end', () => {
            logging.trace(handlerInfo, {EVENT: `Fired \`end\` for ${guildSongQueue.nowPlaying.title}`, }, {CAUSE: `\`Skip\` command destroyes the dispatcher`});
        });

        dispatcher.on('error', err => {
            logging.error(handlerInfo, {EVENT: `Fired \`error\` for ${guildSongQueue.nowPlaying.title}`}, {ERROR: err});
            message.guild.me.voice.channel.leave();
            return serverQueue.delete(message.guild.id);
        });

    } catch (err) {
        logging.error(handlerInfo, {EVENT: `Caught error in \`play\` method.`}, {ERROR: err});
        if(guildSongQueue && guildSongQueue.voiceChannel){
            guildSongQueue.voiceChannel.leave();
        }
        return serverQueue.delete(message.guild.id);
    }

}