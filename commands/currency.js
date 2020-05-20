const axios = require('axios');
const constants =  require('../constants');
const utils = require('../utils');

const currencyApiKey = process.env.FIXER_CURRENCY_API_KEY;

const buildCurrencyConversionUrl = (baseCurrency, newCurrency) => {
    return `http://data.fixer.io/api/latest?access_key=${currencyApiKey}&symbols=${baseCurrency},${newCurrency}`;
}

const formatCurrencyData = (currencyData, baseCurrency, newCurrency, amount) => {
    let returnString = null;
    if(currencyData.success === true){
        let { timestamp, date, rates } = currencyData;
        const result = amount * (rates[newCurrency] / rates[baseCurrency]);
        returnString = `${amount} ${baseCurrency}  =  ${result} ${newCurrency}\n\nFor ${utils.convertSecondsToTimeString(timestamp)} UTC on ${date}`;
    
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
        try{
            let baseCurrencySymbol = null;
            let newCurrencySymbol = null;
            let 
            switch (args.length){
                case 1:
                    const currencySymbol = args[0].toUpperCase();
                    const currencyString = constants.allowedCurrencySymbols[currencySymbol];
    
                    let response = currencyString ? currencyString : `I don't recognize this symbol... try another?`;
                    return message.channel.send(response);

                case 2:


            }

            if(args.length > 1){
                
                const amount = parseInt(args[0]) || 1;
                const baseCurrencySymbol = args[1].toUpperCase();
                const newCurrencySymbol = args[2].toUpperCase();
    
                if(! constants.allowedCurrencySymbols[baseCurrencySymbol] || !constants.allowedCurrencySymbols[newCurrencySymbol]){
                    return message.channel.send("I don't recognize one of the currency symbols... try another?");
                }

                const currencyConversionUrl = buildCurrencyConversionUrl(baseCurrencySymbol, newCurrencySymbol);
                const response = await axios.get(currencyConversionUrl);
                const formattedCurrencyData = formatCurrencyData(response.data, baseCurrencySymbol, newCurrencySymbol, amount);
                return message.channel.send(formattedCurrencyData);
            
            } else if(args.length === 1){

            }

        } catch(error){
            console.log(error);
            message.channel.send(`I am unable to fetch this data...`);
        }
    }
}