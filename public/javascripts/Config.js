/**
 * Created by gonzalo on 26/10/15.
 */
var Config;

Config = {
    pw: 'asddsa123321',
    user: 'nunu.bot.ninja@gmail.com',
    database: 'mongodb://gconto:35360542@ds045454.mongolab.com:45454/nunu-bot',
    STEAM_GAMES : {
        GREENMANGAMING : {
            hot_deals: {
                src: 'http://www.greenmangaming.com/hot-deals'
            }
        },
        STEAM : {
            featured: {
                src: 'http://store.steampowered.com/api/featured/',
                template: 'steam_featured'
            }
        }
    },
    generic_template: '{"command": "GET", "params": { "type": "torrent","query": "Finding Nemo", "to": "bar@blurdybloop.com, baz@blurdybloop.com" ,"count": "2" } }',
    commands: [
        "torrent",
        "template"
    ]
};


module.exports = Config;