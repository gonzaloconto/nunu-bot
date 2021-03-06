/**
 * Created by gonzalo on 29/10/15.
 */
var xmpp = require('node-xmpp'),
    nodemailer = require('nodemailer'),
    Config = require('../Config.js');

var creds = {
    jid: Config.user,
    password: Config.pw
};

function Handler() {
    var message_elem = {};

    var init = function () {
            var self = this;

            this.xmpp = new xmpp.Client(creds);

            this.mailTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: Config.user,
                    pass: Config.pw
                }
            });

            this.xmpp.on('online', function() {
                self.xmpp.send(new xmpp.Element('presence'));
            });

            this.xmpp.on('subscribe', function(s) {
                var xmpp = new xmpp.Element('subscribe');
                xmpp.acceptSubscription(s.attrs.from);
                self.xmpp.acceptSubscription(s.attrs.from);
            });

            this.xmpp.on('stanza', function(stanza) {
                if (stanza.is('presence')){
                    if (stanza.attrs.type === 'subscribe') {
                        self.xmpp.emit('subscribed', stanza);
                    } else {
                        self.xmpp.emit('presence', stanza);
                    }
                } else {
                    if (stanza.is('message')) {
                        self.xmpp.emit('message', stanza);
                    }
                }
            });

        },
        sendMessage = function (params) {
            message_elem = getMessageElement(params);

            this.xmpp.send(message_elem);
        },
        getMessageElement = function (params) {
            message_elem = new xmpp.Element('message', {
                to: params.to,
                type: 'chat'
            })
                .c('body')
                .t(params.text);

            return message_elem;
        },
        sendMail = function (params) {
            this.mailTransport.sendMail({
                from: Config.user, // sender address
                to: params.to, // list of receivers
                subject: 'Nunu Bot Reporting ✔', // Subject line
                html: params.template // html body
            }, function (error, info) {
                if(error){
                    return console.log(error);
                }
                console.log('Message sent: ' + info.response);
            });
        };


    return {
        init: init,
        sendMessage: sendMessage,
        sendMail: sendMail,
        getMessageElement: getMessageElement
    };
}

var Client = function () {
    if (typeof Client.singleton === 'undefined') {
        Client.singleton = new Handler();
        Client.singleton.init();
    }

    return Client.singleton;
};

module.exports = Client;
