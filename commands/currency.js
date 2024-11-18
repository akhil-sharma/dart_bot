const axios = require('axios');
const {allowedCurrencySymbols} =  require('../utils/constants');
const commonFunctions = require('../utils/common_functions');
const {SlashCommandBuilder} = require('discord.js');
const logging = require('../utils/logging');
const handlerInfo = {
    commandModule: 'currency',
    commandHandler: 'currency'
};

const currencyApiKey = process.env.FIXER_CURRENCY_API_KEY;

const buildCurrencyConversionUrl = (baseCurrency, newCurrency) => {
    return `http://data.fixer.io/api/latest?access_key=${currencyApiKey}&symbols=${baseCurrency},${newCurrency}`;
}

const formatCurrencyData = (currencyData, baseCurrency, newCurrency, amount) => {
    let returnString = null;
    if(currencyData.success === true){
        let { timestamp, date, rates } = currencyData;
        const result = amount * (rates[newCurrency] / rates[baseCurrency]);
        returnString = `${amount} ${baseCurrency}  =  ${result} ${newCurrency}\n\nFor ${commonFunctions.convertSecondsToTimeString(timestamp)} UTC on ${date}`;
    
    }else{
        returnString = `I am unable to fetch this data at the given moment...`;
    }
    
    return returnString;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('currency')
        .setDescription('This command converts any amount from one currency to another.')
        .addStringOption(option => 
            option.setName('currency-symbol-1')
            .setDescription('The first currency symbol*')
            .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('currency-symbol-2')
            .setDescription('The second currency symbol')
        ),
    cooldown: 4,
    args: true,
    aliases: ['price'],
    usage: `!currency <amount> <currency-symbol> <currency-symbol> (for currency conversion) or
    !currency <currency-symbol> (for the full form)`,
    async execute(interaction){
        let baseCurrencySymbol = interaction.options.getString("currency-symbol-1");
        let newCurrencySymbol = interaction.options.getString("currency-symbol-2") ?? null;
        const amount = interaction.options.getNumber("amount") ?? 1;
        
        logging.trace(handlerInfo, {EVENT: `Fired \`currency\` command with args :: ${{baseCurrencySymbol}, {newCurrencySymbol}, {amount}}`});
        
        try{
            let responseString = ``;
            let currencyString = null;

            if (!newCurrencySymbol) {
                // Only the base currency string is provided
                currencyString = allowedCurrencySymbols[baseCurrencySymbol.toUpperCase()];
                responseString = currencyString ? currencyString : `I don't recognize ${baseCurrencySymbol}... try another?`;
                return interaction.reply(responseString);
            }

            //     responseString = `Invalid arguments. 
            //     Try \`!currency <amount> <currency-symbol> <currency-symbol>\`
            //     or  \`!currency <currency-symbol> <currency-symbol>\` (for currency conversion) 
            //     and
            //     \`!currency <currency-symbol>\` (for the full form)`;
            //     sentMessage = await message.reply(responseString);
            //     return commonFunctions.clearInvalidCommand(message, sentMessage);
            baseCurrencySymbol = baseCurrencySymbol.toUpperCase()
            newCurrencySymbol = newCurrencySymbol.toUpperCase()

            if(!allowedCurrencySymbols[baseCurrencySymbol] || !allowedCurrencySymbols[newCurrencySymbol]){
                return interaction.reply("I don't recognize one of the currency symbols... try another?");
            }

            const currencyConversionUrl = buildCurrencyConversionUrl(baseCurrencySymbol, newCurrencySymbol);
            const response = await axios.get(currencyConversionUrl);
            responseString = formatCurrencyData(response.data, baseCurrencySymbol, newCurrencySymbol, amount);
            return interaction.reply(responseString);
            
        } catch(error){
            logging.error(handlerInfo, {EVENT: `Encountered error in \`currency\` command.`}, {ERROR: error});
            interaction.reply(`I am unable to fetch this data...`);
        }
    }
}