/**
 * Created by gonzalo on 26/10/15.
 */
var GChat = require('../controllers/GChat.js'),
    Chat;


Chat = function () {

    init = function () {
        this.service = new GChat();
    };

    return {
        init: init
    };
};


module.exports = Chat();

