const BEEP_REPLY = 'Bop!';

module.exports = {
    name: 'beep',
    description: `This command sends a message with content ${BEEP_REPLY} when it encounters beep`,
    execute(message){
        message.channel.send(`${BEEP_REPLY}`);
    }
}