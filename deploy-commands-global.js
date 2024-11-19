const { REST, Routes } = require('discord.js');
const commonFunctions = require('./utils/common_functions');
require('dotenv-flow').config();
const { DISCORD_CLIENT_ID, DISCORD_TOKEN } = process.env;
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
// Grab all the command folders from the commands directory you created earlier
/**/
const commandFiles = commonFunctions.getAllFiles('./commands');
for (const file of commandFiles) {
    const command = require(`${file}`);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[Warning] the command at ${file} is missing a required "data" or "execute" property.`)
    }
}
/**/
// Construct and prepare an instance of the REST module
const rest = new REST().setToken(DISCORD_TOKEN);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(DISCORD_CLIENT_ID),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
