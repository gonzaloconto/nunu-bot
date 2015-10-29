var
    Handlebars = require('./public/javascripts/helpers/handlebars.js'),
    chatService = require('./public/javascripts/services/Chat.js');

var App;
/**
 * Factory Application
 */
App = function () {return {};};
module.exports = new App();


App.chatService = new chatService();

