/**
 * Created by gonzalo on 26/10/15.
 */
var GChat = require('../controllers/GChat.js');

function Services() {
    var init = function () {
        this.gmailService = new GChat();
    };

    return {
        init: init
    };
}

var Chat = function () {
    if (typeof Chat.singleton === 'undefined') {
        Chat.singleton = new Services();
        Chat.singleton.init();
    }

    return Chat.singleton;
};

module.exports = Chat;
