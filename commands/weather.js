const axios = require('axios');
const Discord = require('discord.js');

const logging = require(`../utils/logging`);
const handlerInfo = {
    commandModule: 'weather',
    commandHandler: 'weather'
};

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

const buildWeatherUrl = (cityName) => {
    return `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${WEATHER_API_KEY}&units=metric`;
}

const buildWeatherIconUrl = (iconId) => {
    return `http://openweathermap.org/img/wn/${iconId}@2x.png`;
}

const buildCityUrl = (cityName) => {
    let citySearchUrl = new URL(`https://google.com/search?q=${cityName}`);
    return citySearchUrl.href;
}

const getWindDirection = (angle) => {
    let directionsArray = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW","N"];
    let index = Math.round((angle % 360)/22.5);
    let compassDirection = directionsArray[index];

    return compassDirection ? compassDirection : ''; 
}

const generateEmbed = (weatherData) => {
    let {   
        name,
        weather,
        main: {temp, temp_min, temp_max, feels_like, pressure, humidity},
        wind: {speed, deg},
        createdFor
    } = weatherData; 

    let { main, description, icon } = weather[0];
    
    let weatherEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`${main}, ${temp}°C`)
        .setURL(`${buildCityUrl(name)}`)
        .setAuthor(`${name}`)
        .setDescription(`${description}`)
        .setThumbnail(`${buildWeatherIconUrl(icon)}`)
        .addField(`Range`, `\u2193 ${temp_min}°C  \u200B \u200B \u200B \u200B \u2191 ${temp_max}°C`)
        .addFields(
            {name: `Feels Like`, value: `${feels_like}°C`, inline: true},
            {name: `Humidity`, value: `${humidity}%`, inline: true},
            {name: `Pressure`, value: `${pressure} hpa`, inline: true},
        )
        .addField(`Wind Speed`, `${speed} m/s ${getWindDirection(deg)} ${deg}°`)
        .addField('\u200B', '\u200B' )
        .setTimestamp()
        .setFooter(`Created for ${createdFor}`);
    
    return weatherEmbed;
}

module.exports = {
    name: `weather`,
    args: true,
    cooldown: 5,
    usage: '<city>',
    description: `This command gives sends weather details of a given location`,
    async execute(message, args){
        logging.trace(handlerInfo, {EVENT: `\`weather\` command fired with args :: &{args}`});
        try {
            let cityName = args.join(' ');

            let weatherUrl = buildWeatherUrl(cityName);
            let weatherResponse = await axios.get(weatherUrl);
            let weatherData = generateEmbed({...weatherResponse.data, createdFor: message.author.username});

            message.channel.send(weatherData);

        } catch (error) {
            console.error(error);
            message.reply(`Ummm... I seem to be having some trouble finding the weather for this location.`);
        }
    }
}