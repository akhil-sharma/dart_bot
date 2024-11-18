if(process.env.NODE_ENV !== `development` &&
    process.env.NODE_ENV !== `production`)
{
    console.log('Please specify one of the following environments to run your server');
    console.log('- development');
    console.log('- production');
    process.exit(-1);
}

require('dotenv-flow').config();
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const commonFunctions = require('./utils/common_functions');

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.cooldowns = new Collection();
client.commands = new Collection();

const commandFiles = commonFunctions.getAllFiles('./commands');
for (const file of commandFiles) {
    const command = require(`${file}`);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[Warning] the command at ${file} is missing a required "data" or "execute" property.`)
    }
}

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    
	if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}
    
    const { cooldowns } = interaction.client;
    
    if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection());
    }
    
    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    const defaultCooldownDuration = 3;
    const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;
    
    if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
        
        if (now < expirationTime) {
            const expiredTimestamp = Math.round(expirationTime / 1_000);
            return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });
        }
    }
    
    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    
	try {
        await command.execute(interaction);
	} catch (error) {
        console.error(error);
		if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
})

client.login(DISCORD_TOKEN);
/**
 bot.serverQueue = new Map();
 bot.
 
 
 
 
 bot.once('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
    });

bot.on('shardReconnecting', (id) => {
	console.info(`${id} trying to reconnect!`);
});

bot.on('shardDisconnect', (event, s) => {
	console.info(`${event} :: shardDisconnect :: ${s}`);
});

bot.on('message', async (message)=>{

    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    const command = bot.commands.get(commandName)
		|| bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

    //Check for guildOnly commands.
    if (command.guildOnly && message.channel.type !== 'text') {
        return message.reply('I can\'t execute that command inside DMs!');
    }

    //Check for args.
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
**/

process
.on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
})
.on('uncaughtException', err => {
    console.error(err, 'Uncaught Exception thrown');
    process.exit(1);
});