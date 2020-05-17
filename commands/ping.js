const PING_REPLY = 'Pong!';

module.exports = {
    name: 'ping',
    description: `This command sends a message with content ${PING_REPLY} when it encounters ping`,
    execute(message){
        message.channel.send(`${PING_REPLY}`);
    }
}