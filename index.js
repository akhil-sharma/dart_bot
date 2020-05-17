require('dotenv').config();

const Discord = require('discord.js');
const utils = require('./utils');

const bot = new Discord.Client();
bot.commands = new Discord.Collection();
bot.serverQueue = new Map();
bot.cooldowns = new Discord.Collection();

const TOKEN = process.env.TOKEN;
const PREFIX = process.env.PREFIX;

bot.login(TOKEN);

const commandFiles = utils.getAllFiles('./commands');

for (const file of commandFiles) {
	const command = require(`${file}`);
	bot.commands.set(command.name, command);
}

bot.once('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.once('reconnecting', () => {
	console.info(`${bot.user.tag} is trying to reconnect!`);
});

bot.once('disconnect', () => {
	console.info(`${bot.user.tag} disconnected!`);
});

bot.on('message', async (message)=>{

    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    if (!bot.commands.has(commandName)) return;

    const command = bot.commands.get(commandName);

    if(command.args && !args.length){
        let reply = (`You didn't provide any arguments, ${message.author}!`);

        if(command.usage) {
            reply += `\nThe proper usage would be: \`${PREFIX}${commandName} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }

    // Managing command Cooldowns
    if(!bot.cooldowns.has(command.name)){
        bot.cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = bot.cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if(timestamps.has(message.author.id)){
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime){
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`)
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply(`Something doesn't seem right...`);
    }
});

process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error));