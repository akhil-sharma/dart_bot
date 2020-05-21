const DING_REPLY = 'Dong!';

module.exports = {
    name: 'ding',
    description: `This command sends a message with content ${DING_REPLY} when it encounters ding`,
    execute(message){
        message.channel.send(`${DING_REPLY}`);
    }
}