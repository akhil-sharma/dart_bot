const axios = require('axios');
const {EmbedBuilder, SlashCommandBuilder} = require('discord.js');

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
    
    let weatherEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`${main}, ${temp}°C`)
        .setURL(`${buildCityUrl(name)}`)
        .setDescription(`${description}`)
        .setThumbnail(`${buildWeatherIconUrl(icon)}`)
        .addFields({name: "Overview", value: `Range \u2193 ${temp_min}°C  \u200B \u200B \u200B \u200B \u2191 ${temp_max}°C`})
        .addFields([
            {name: `Feels Like`, value: `${feels_like}°C`, inline: true},
            {name: `Humidity`, value: `${humidity}%`, inline: true},
            {name: `Pressure`, value: `${pressure} hpa`, inline: true}
        ])
        .addFields({name: `Wind Speed`, value: `${speed} m/s ${getWindDirection(deg)} ${deg}°`})
        .addFields({name: '\u200B', value: '\u200B'})
        .setTimestamp()
        .setFooter({text: `Created for ${createdFor}`});
        
    return weatherEmbed;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('This command gives sends weather details of a given location')
        .addStringOption(option => 
            option.setName('city')
                .setDescription('Name of the city')
                .setRequired(true)
        ),
    args: true,
    cooldown: 5,
    usage: '!weather <city>',
    async execute(interaction){
        const city = interaction.options.getString('city');
        logging.trace(handlerInfo, {EVENT: `\`weather\` command fired with args :: ${city}`});
        try {
            let weatherUrl = buildWeatherUrl(city);
            let weatherResponse = await axios.get(weatherUrl);
            let weatherData = generateEmbed({...weatherResponse.data, createdFor: interaction.user.username});
            interaction.reply({ embeds: [weatherData] });

        } catch (error) {
            logging.trace(handlerInfo, {EVENT: `\`weather\` command fired with args :: ${city}`}, {ERROR: error});
            interaction.reply(`Ummm... I seem to be having some trouble finding the weather for this location.`);
        }
    }
}