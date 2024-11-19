# **DART BOT**
### *A fun discord bot that, for some reason, has nothing to do with the game of darts.*

[![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)](https://forthebadge.com) 

## **How do I run it?**

0. Create a new bot application in the discord developer panel.

1. Add the necessary api_keys / tokens in the `.env` file.

2. run `npm install` { I have only tried node v20.15.1 }

3. NODE_ENV=development node index.js


## **COMMANDS**

>### *WEATHER*
| COMMAND   | DESCRIPTION  | USAGE  | ALIASES |
| :-------  | :----------- | :----- | :-------|
| `/weather`| Retrieve the weather of a given city. | `/weather <city>` | -- |

>### *CURRENCY*
| COMMAND    | DESCRIPTION  | USAGE  | ALIASES |
| :-------   | :----------- | :----- | :-------|
| `/currency`| Convert any amount from one currency to another. | `/currency <amount> <currency-symbol> <currency-symbol>` | -- |
|            | Converting unit amount.                          | `/currency <currency-symbol> <currency-symbol>` |
|            | Display the currency for symbol.                 | `/currency <currency-symbol>` |

>### *FUN*
| COMMAND | DESCRIPTION       | USAGE   | ALIASES |
| :-------| :---------------- | :------ | :-------|
| `/joke` | Display a random joke | `/joke` | -- |
|         | Random joke containing a \<string\> | `/joke <string>`
| `/XD`   | Use it and you'll never laugh alone.| `/XD` |


>### *MISC*
| COMMAND | DESCRIPTION       | USAGE   | ALIASES |
| :-------| :---------------- | :------ | :-------|
| `/ping` | Reply with `Pong!`| `/ping` | --      |
| `/user` | Provides information about the user. | `/user` | --      |

>### *MUSIC* (Under Maintainance)

| COMMAND    | DESCRIPTION  | USAGE  | ALIASES |
| :--------- | :----------- | :----- | :-------|
| `/play`    | Play a song by name.                 | `/play <name>` | `/p`|
|            | Play songs and playlists using link. | `/play <link>`
| `/pause`   | Pause the song which is currently playing.| `/pause` | --|
| `/resume`  | Resume the paused song. | `/resume` | `/continue` |
| `/playlist`| Display the current playlst | `/playlist` | `/upcoming` |
| `/skip`    | Skip the current song. |`/skip` | -- |
| `/volume`  | Change the volume of the current song. | `/volume <number 0-100>` | `/vol` |
| `/stop`    | Stop all songs and clear the playlist.
| `/loop`    | Toggle a loop on the current playlist. | `/loop` | -- |

## **Try it out!**

 Add the bot to you own Discord Server: [INSTALL](https://discord.com/oauth2/authorize?client_id=1307149225728938054)