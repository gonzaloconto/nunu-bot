/**
 * Created by gonzalo on 26/10/15.
 */
var GChat = require('../handlers/GChat.js'),
    Chat;


Chat = function () {

    init = function () {
      this.service = GChat;
    };

    return {
        init: init
    };
};


module.exports = new Chat();

