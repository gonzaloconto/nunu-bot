/**
 * Created by gonzalo on 26/10/15.
 */
var Client = require('./../handlers/Client'),
    kickass = require('kickass-torrent'),
    TemplateService = require('./../services/template'),
    DatabaseService = require('./../services/database'),
    Config = require('../Config.js'),
    Dictionary = require('../Dictionary.js'),
    request = require("request");

var model = {};

var GChat = function() {
    var self = this;

    this.client = new Client();
    this.templateService = new TemplateService();
    this.databaseService = new DatabaseService();

    function executeCommand (command, params, from) {
        var result_msg = {},
            message_elem = {};

        function getPage (params) {

            request({
                uri: params.src
            }, function(error, response, body) {
                var data = {},
                    template;

                try {
                    data = {results: JSON.parse(body)[params.filter]};
                    template = self.templateService.parsedTemplate({
                        key: params.template,
                        data: data
                    });
                } catch (e) {
                    template = body;
                }

                self.client.sendMessage({
                    to: params.from,
                    text: 'Sending you a mail faggot, be patient e.e)9'
                });

                self.client.sendMail({
                    to: params.to,
                    template: template
                });


            });
        }

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
                        var results = [];
                        //will get the contents from
                        //http://kickass.to/json.php?q=test&field=seeders&order=desc&page=2
                        if(e){
                            return console.log(e);
                        }

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

                            results.push(result_msg);

                        } );

                        self.client.sendMessage({
                            to: from,
                            text: 'Sending you a mail faggot, be patient e.e)9'
                        });

                        var html   = self.templateService.parsedTemplate({
                            key: 'mail',
                            data: {results: results}
                        });


                        console.log(from);

                        self.client.sendMail({
                            to: params.to,
                            template: html
                        });

                    });

                } else if (params.type.toUpperCase() === 'TEMPLATE') {

                    self.client.sendMessage({
                        to: from,
                        text: Config.generic_template
                    });

                } else if (params.type.toUpperCase() === 'GREENMANGAMING') {
                    getPage({
                        to: params.to,
                        from: from,
                        src: Config.STEAM_GAMES.GREENMANGAMING.hot_deals.src,
                        template: 'page'
                    });

                } else if (params.type.toUpperCase() === 'STEAM') {
                    getPage({
                        src: Config.STEAM_GAMES.STEAM.featured.src,
                        to: params.to,
                        from: from,
                        filter: 'large_capsules',
                        template: 'steam_featured'
                    });

                } else {
                    self.client.sendMessage({
                        to: from,
                        text: "I don't understand you faggot"
                    });
                }
                break;
            default :
                self.client.sendMessage({
                    to: from,
                    text: "I don't understand you faggot"
                });
        }

    }

    this.client.xmpp.on('message', function(msg) {
        var
            from = msg.attrs.from,
            body = msg.getChild('body'),
            error = false,
            text = body ? body.getText() : '',
            command,
            params;

        if (!body) return;

        try{
            text = JSON.parse(text);
        }catch(e){
            self.client.sendMessage({
                to: from,
                text: "I don't understand you ... enter a Valid JSON, type 'TEMPLATE' on the 'type' param"
            });
            error = true;
        }

        params = text.params;

        try{
            command = text.command;
        }catch(e){
            self.client.sendMessage({
                to: from,
                text: "Command needed"
            });
            error = true;
        }

        if (!error && params) {
            executeCommand(command, params, from);
        }

    });
};

module.exports = GChat;