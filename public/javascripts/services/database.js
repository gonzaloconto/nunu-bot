/**
 * Created by gonzalo on 29/10/15.
 */
var
    mongoose = require('mongoose'),
    Promise = require('bluebird'),
    Schema = mongoose.Schema,
    Config = require('../Config.js');



function Comunication() {
    var init = function () {
        var self = this;

        this.database = mongoose;

        var Show = this.database.model('Show', {
            "id": Number,
            "title": String,
            "provider":  {'type':String, 'default':'eztv'}
        });

        /**
         * Atomic connect Promise - not sure if I need this, might be in mongoose already..
         * @return {Priomise}
         */
        function connect(uri, options){
            return new Promise(function(resolve, reject){
                self.database.connect(uri, options, function(err){
                    if (err) return reject(err);
                    console.log('CONECTED!');
                    resolve(self.database.connection);
                });
            });
        }

        /**
         * Bulk-upsert an array of records
         * @param  {Array}    records  List of records to update
         * @param  {Model}    Model    Mongoose model to update
         * @param  {Object}   match    Database field to match
         * @return {Promise}  always resolves a BulkWriteResult
         */
        function save(records, Model, match){
            match = match || 'id';
            return new Promise(function(resolve, reject){
                var bulk = Model.collection.initializeUnorderedBulkOp();
                records.forEach(function(record){
                    var query = {};
                    query[match] = record[match];
                    bulk.find(query).upsert().updateOne( record );
                });
                bulk.execute(function(err, bulkres){
                    if (err) return reject(err);
                    resolve(bulkres);
                });
            });
        }

        /**
         * Map function for EZTV-to-Show
         * @param  {Object} show EZTV show
         * @return {Object}      Mongoose Show object
         */
        function mapEZ(show){
            return {
                title: show.title,
                id: Number(show.id),
                provider: show.provider
            };
        }

        var shows = [
            {
                title: 'Cocina con Pepe',
                id: Number('1'),
                provider: 'telefe'
            },
            {
                title: 'Susana',
                id: Number('2'),
                provider: 'telefe'
            },
            {
                title: 'Almorzando con Mirtha Legrand',
                id: Number('3'),
                provider: 'canal13'
            },
            {
                title: 'Los Simuladores',
                id: Number('4'),
                provider: 'canal13'
            },
            {
                title: 'Tom y Jerry',
                id: Number('5'),
                provider: 'telefe'
            }
        ];

    // var eztv = require('eztv');
    // eztv.getShows({}, function(err, shows){
    //   if(err) return console.log('EZ Error:', err);

    // var shows = shows.map(mapEZ);
        console.log('found', shows.length, 'shows.');
        connect(Config.database, {}).then(function(db){
            save(shows, Show).then(function(bulkRes){
                console.log('Bulk complete.', JSON.stringify(bulkRes));
                db.close();
            }, function(err){
                console.log('Bulk Error:', err);
                db.close();
            });
        }, function(err){
            console.log('DB Error:', err);
        });

    };

    return {
        init: init
    };
}

var dataBaseService = function () {
    if (typeof dataBaseService.singleton === 'undefined') {
        dataBaseService.singleton = new Comunication();
        dataBaseService.singleton.init();
    }

    return dataBaseService.singleton;
};

module.exports = dataBaseService;
