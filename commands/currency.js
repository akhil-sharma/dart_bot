const axios = require('axios');
const constants =  require('../utils/constants');
const commonFunctions = require('../utils/common_functions');
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
    name: `currency`,
    description: `This command converts any amount from one currency to another.`,
    cooldown: 4,
    args: true,
    aliases: ['price'],
    usage: `<amount> <currency-symbol> <currency-symbol> (for currency conversion) or
    !currency <currency-symbol> (for the full form)`,
    async execute(message, args){
        logging.trace(handlerInfo, {EVENT: `Fired \`currency\` command with args :: ${args}`});
        try{
            let baseCurrencySymbol = null;
            let newCurrencySymbol = null;
            let amount = 1;
            let responseString = ``;
            let sentMessage = null;
            let currencyString = null;
            switch (args.length){
                case 1:
                    baseCurrencySymbol = args[0].toUpperCase();
                    currencyString = constants.allowedCurrencySymbols[baseCurrencySymbol];
                    responseString = currencyString ? currencyString : `I don't recognize ${baseCurrencySymbol}... try another?`;
                    return message.reply(responseString);

                case 2:
                    baseCurrencySymbol = args[0].toUpperCase();
                    newCurrencySymbol = args[1].toUpperCase();
                    break;

                case 3:
                    amount = parseInt(args[0]);
                    baseCurrencySymbol = args[1].toUpperCase();
                    newCurrencySymbol = args[2].toUpperCase();
                    break;
                
                default:
                    responseString = `Invalid arguments. 
                    Try \`!currency <amount> <currency-symbol> <currency-symbol>\`
                    or  \`!currency <currency-symbol> <currency-symbol>\` (for currency conversion) 
                    and
                    \`!currency <currency-symbol>\` (for the full form)`;
                    sentMessage = await message.reply(responseString);
                    return commonFunctions.clearInvalidCommand(message, sentMessage);
            }

            if(!constants.allowedCurrencySymbols[baseCurrencySymbol] || !constants.allowedCurrencySymbols[newCurrencySymbol]){
                return message.reply("I don't recognize one of the currency symbols... try another?");
            }

            const currencyConversionUrl = buildCurrencyConversionUrl(baseCurrencySymbol, newCurrencySymbol);
            const response = await axios.get(currencyConversionUrl);
            responseString = formatCurrencyData(response.data, baseCurrencySymbol, newCurrencySymbol, amount);
            return message.reply(responseString);
            
        } catch(error){
            logging.error(handlerInfo, {EVENT: `Encountered error in \`currency\` command.`}, {ERROR: error});
            message.reply(`I am unable to fetch this data...`);
        }
    }
}