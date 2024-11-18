const axios = require('axios');
const { SlashCommandBuilder } = require('discord.js')
const logging = require('../../utils/logging');
const handlerInfo = {
    commandModule: 'fun',
    commandHandler: 'joke'
};

const buildJokesUrl = (stringArg) => {
    let jokesUrl = `https://sv443.net/jokeapi/v2/joke/Any?type=single`;
            
    if(stringArg.length){
        jokesUrl += `&contains=${stringArg}`;
    }
    console.log(jokesUrl)
    return jokesUrl;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('joke')
        .setDescription('This command generates a random joke.')
        .addStringOption(option => 
            option.setName("contains")
                .setDescription("try fetching jokes which contains the following string")
        ),
    cooldown: 5,
    async execute(interaction) {
        logging.trace(handlerInfo, {EVENT: `Fired \`joke\` command.`});
        let jokeResponse = '¯\\_(ツ)_/¯';
        try{
            const contains = interaction.options.getString('contains') ?? "";
            let jokesUrl = buildJokesUrl(contains);
            let response = await axios.get(jokesUrl);
            let joke = response.data.joke;
            if(joke){
                jokeResponse = joke
            }

        } catch(error ){
            logging.error(handlerInfo, {EVENT: `error when fetching jokes`}, {ERROR: error});
        }
        interaction.reply(jokeResponse);
    }
}
