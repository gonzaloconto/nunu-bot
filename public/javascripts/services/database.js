/**
 * Created by gonzalo on 29/10/15.
 */
var
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Config = require('../Config.js');


function Comunication() {
    var init = function ( key ) {
            this.database = mongoose;
            this.database.connect(Config.database);


        /*
        this.database.on('open', function() {

        });
        */

            var Contact = mongoose.model('User', { name: String });

            var emitter = new Contact({ name: 'Gonza' });
            emitter.save(function (err) {
                if (err) // ...
                    console.log('error!');
            });
        };

    return {
        init: init
    };
}

var dataBaseService = function () {
    if (typeof dataBaseService.singleton === 'undefined') {
        dataBaseService.singleton = new Comunication();
    }

    return dataBaseService.singleton;
};

module.exports = dataBaseService;
