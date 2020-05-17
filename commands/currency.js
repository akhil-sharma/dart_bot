const axios = require('axios');

const allowedCurrencies = {
    CAD: "CAD",
    HKD: "HKD",
    ISK: "ISK",
    PHP: "PHP",
    DKK: "DKK",
    HUF: "HUF",
    CZK: "CZK",
    GBP: "GBP",
    RON: "RON",
    SEK: "SEK",
    IDR: "IDR",
    INR: "INR",
    BRL: "BRL",
    RUB: "RUB",
    HRK: "HRK",
    JPY: "JPY",
    THB: "THB",
    CHF: "CHF",
    EUR: "EUR",
    MYR: "MYR",
    BGN: "BGN",
    TRY: "TRY",
    CNY: "CNY",
    NOK: "NOK",
    NZD: "NZD",
    ZAR: "ZAR",
    USD: "USD",
    MXN: "MXN",
    SGD: "SGD",
    AUD: "AUD",
    ILS: "ILS",
    KRW: "KRW",
    PLN: "PLN" 
};

const buildCurrencyUrl = (baseCurrency, newCurrency) => {
    return `https://api.exchangeratesapi.io/latest?base=${baseCurrency}&symbols=${baseCurrency},${newCurrency}`;
}

const formatCurrencyData = (currencyData, newCurrency, value) => {
    let { rates, base, date } = currencyData;

    let baseString = `${value} ${base}  =  ${(value * rates[newCurrency]).toFixed(2)} ${newCurrency}\n\nFor ${date}`;

    return baseString;
}

module.exports = {
    name: 'currency',
    description: 'This command gives the excange rate of various currencies based on the base currency.',
    cooldown: 3,
    args: true,
    usage: '<value> <base-currency-symbol> <new-currency-symbol> - eg: !currency 100 USD INR',
    async execute(message, args){
        try{
            if(args.length !== 3){
                return message.channel.send("Invalid command format.")
            }

            const value = parseInt(args[0]) || 1;
            const baseCurrencySymbol = args[1].toUpperCase();
            const newCurrencySymbol = args[2].toUpperCase();

            if(allowedCurrencies[baseCurrencySymbol] && allowedCurrencies[newCurrencySymbol]){
                const response = await axios.get(buildCurrencyUrl(baseCurrencySymbol, newCurrencySymbol));
                const formattedCurrencyData = formatCurrencyData(response.data, newCurrencySymbol, value);
    
                return message.channel.send(formattedCurrencyData);
            }

            return message.channel.send("I don't recognize one of the currency symbols... try another?");

        } catch(error ){
            message.channel.send(`${error.response.data.error}`);
        }
    }
}