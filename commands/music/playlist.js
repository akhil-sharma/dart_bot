const { MessageEmbed } = require('discord.js');

const logging = require('../../logging');
const handlerInfo = {
    commandModule: 'music',
    commandHandler: 'playlist'
};

module.exports = {
    name: `playlist`,
    description: `Display the list of next 10 songs in the queue.`,
    guildOnly: true,
    aliases: [`song-list`, `next`, `next-song`],
    execute (message){
        logging.trace(handlerInfo, {EVENT: `\`playlist\` command fired :: `});
        const serverQueue = message.client.serverQueue;
        const guildSongQueue = serverQueue.get(message.guild.id);

        if(!guildSongQueue){
            return message.channel.send(`Nothing to show...`);
        }
        
        if(guildSongQueue.songs.length === 0){
            return message.channel.send(`There are no songs in the queue.`)
        }
        message.channel.send(formatPlaylist(guildSongQueue.songs));
    }
}

const formatPlaylist = (playlistArray) => {
    const limitedArray = playlistArray.slice(0, 15).map(song => {
        return {
            title: song.title,
            duration: song.duration,
        }
    });

    const queueEmbed = new MessageEmbed()
        .setColor('#ff7373')
        .setTitle('Upcoming Songs');
    let counter = 1;
    limitedArray.forEach(song => {
        queueEmbed.addField(`${counter}:`, `${song.title} : ${song.duration}`);
        counter += 1;
    });

    return queueEmbed;
}