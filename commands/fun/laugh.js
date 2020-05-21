const LAUGH_STRING_ARRAY = [`Bwahahahahah!!`, `Bwahah!`, `heheh...`, `Hahahah!!!`, `Bwahah! That's funny!!`];

module.exports = {
    name: `xd`,
    description: `This command sends a message with a random laugh when it encounters XD`,
    execute(message){
        let randomLaughter = LAUGH_STRING_ARRAY[Math.floor(Math.random() * LAUGH_STRING_ARRAY.length)];
        message.channel.send(`${randomLaughter}`);
        message.react('😄');
        message.react('👍');
    }
}