/**
 * Created by gonzalo on 26/10/15.
 */
var xmpp = require('node-xmpp'),
    kickass=require('kickass-torrent'),
    Config = require('../Config.js'),
    Dictionary = require('../Dictionary.js'),
    util = require('util');

var creds = {
    jid: Config.user,
    password: Config.pw
};

var model = {};

var GChat = function(creds) {
    var self = this,
        c = this.client = new xmpp.Client(creds);

    function executeCommand (command, params, from) {
        var result_msg = {},
            message_elem = {};

        switch (command){
            case 'GET':
                if (params.type.toUpperCase() === 'TORRENT') {

                    params.count = params.count || 0;

                    kickass({
                        q: params.query,//actual search term
                        field:'seeders',//seeders, leechers, time_add, files_count, empty for best match
                        order:'desc',//asc or desc
                        page: 1,//page count, obviously
                        url: 'https://kat.cr'//changes site default url (https://kat.cr)
                    },function(e, data){
                        //will get the contents from
                        //http://kickass.to/json.php?q=test&field=seeders&order=desc&page=2
                        if(e)
                            return console.log(e)
                        console.log(data)//actual json response

                        data.list.forEach( function (result, index) {

                            if (index > (params.count - 1)) return;

                            result_msg = {
                                title: result.title,
                                pubDate: result.pubDate,
                                autoDownloadLink: result.torrentLink,
                                comments: result.comments,
                                seeds: result.seeds,
                                leechs: result.leechs,
                                size: result.size,
                                votes: result.votes
                            };

                            message_elem = new xmpp.Element('message', {
                                to: from,
                                type: 'chat'
                            })
                                .c('body')
                                .t(JSON.stringify(result_msg));

                            c.send(message_elem);
                        } );


                    })
                }else if (params.type.toUpperCase() === 'TEMPLATE') {
                    message_elem = new xmpp.Element('message', {
                        to: from,
                        type: 'chat'
                    })
                        .c('body')
                        .t(Config.generic_template);

                    c.send(message_elem);
                }
        }

    }

    c.on('online', function() {
        c.send(new xmpp.Element('presence'));
    });

    c.on('stanza', function(stanza) {
        if (stanza.is('presence')){
            if (stanza.attrs.type === 'subscribe') {
                var subscribe_elem = new xmpp.Element('presence', {
                    to: stanza.attrs.from,
                    type: 'subscribed'
                });
                c.send('subscribed', subscribe_elem);
            } else {
                c.emit('presence', stanza);
            }
        } else {
            if (stanza.is('message')) {
                c.emit('message', stanza);
            }
        }
    });

    c.on('presence', function(p) {
        var show = p.getChild('show'),
            text = 'Friend: ' + p.attrs.from + ' ' + ( (show) ? (' ('+show.getText()+')') : '' );

        console.log(text);

    });

    c.on('message', function(msg) {
        var
            from = msg.attrs.from,
            body = msg.getChild('body'),
            error = false,
            message_elem,
            text = body ? body.getText() : '',
            command,
            params;

        if (!body) return;

        try{
            text = JSON.parse(text);
        }catch(e){
            message_elem = new xmpp.Element('message', {
                to: from,
                type: 'chat'
            })
                .c('body')
                .t('Enter a Valid JSON, type "TEMPLATE" on the "type" param');
            c.send(message_elem);
            error = true;
        }

        params = text.params;

        try{
            command = text.command;
        }catch(e){
            message_elem = new xmpp.Element('message', {
                to: from,
                type: 'chat'
            })
                .c('body')
                .t('Command needed');
            c.send(message_elem);
            error = true;
        }

        if (!error && params) {
            executeCommand(command, params, from);
        }

    });
};

module.exports = new GChat(creds);