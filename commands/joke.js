const axios = require('axios');

const buildJokesUrl = (stringArg) => {
    let jokesUrl = `https://sv443.net/jokeapi/v2/joke/Any?type=single`;
            
    if(stringArg.length){
        jokesUrl += `&contains=${stringArg[0]}`;
    }

    return jokesUrl;
}

module.exports = {
    name: 'joke',
    description: 'This command generates a random joke.',
    cooldown: 5,
    async execute(message, args){
        try{
            let jokesUrl = buildJokesUrl(args);
            let response = await axios.get(jokesUrl);
            let joke = response.data.joke;
            
            if(joke){
                message.channel.send(joke);
            }else{
                message.channel.send('¯\\_(ツ)_/¯');
            }

        } catch(error ){
            message.channel.send(`Don't know...`);
        }
    }
}