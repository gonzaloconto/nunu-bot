/**
 * Created by gonzalo on 29/10/15.
 */
var
    mongoose = require('mongoose'),
    Promise = require('bluebird'),
    Schema = mongoose.Schema,
    Utils = require('../helpers/utils.js'),
    Config = require('../Config.js');



function Comunication() {
    var init = function () {
        var self = this;

        this.database = mongoose;
        this.utils = new Utils();

        var
            userSchema = new Schema({
                "id": { type: String, required: true },
                "reminders":  { type: Array }
            }, { collection: 'users' }),
            promise;

          this.users =  this.database.model('User', userSchema);



        /**
         * Atomic connect Promise - not sure if I need this, might be in mongoose already..
         * @return {Priomise}
         */
        function connect(uri, options){
            return new Promise(function(resolve, reject){
                self.database.connect(uri, options, function(err, db){
                    if (err) return reject(err);
                    console.log('CONECTED!');
                    resolve(self.database.connection);
                });
            });
        }

        /**
         * Map function
         * @param  {Object} parametter
         * @return {Object}  cooked object
         */
        function mapEZ(user){
            return {
                "id": user.id,
                "reminders":  user.reminders
            };
        }

        var users = [
            {
                "id": '212z726vm0kl203vsd4r4taoki@public.talk.google.com',
                "reminders":  [{when: new Date().getTime() + 1000000, msg: 'Hoooooola'}]
            },
            {
                "id": '212z726vm0zp503vsd4r4taoki@public.talk.google.com',
                "reminders":  [{when: new Date().getTime() + 1000001, msg: 'Hoooooola1'}]
            },
            {
                "id": '212z726vm0sd203vsd4r4taoki@public.talk.google.com',
                "reminders":  [{when: new Date().getTime() + 1000002, msg: 'Hoooooola2'}]
            },
            {
                "id": '212z726ma0zx203vsd4r4taoki@public.talk.google.com',
                "reminders":  [{when: new Date().getTime() + 1000003, msg: 'Hoooooola3'}]
            },
            {
                "id": '212z726xd0zx203vsd4r4taoki@public.talk.google.com',
                "reminders":  [{when: new Date().getTime() + 1000000, msg: 'Hoooooola4'}]
            },
            {
                "id": '212z726re0zx203kid4r4taoki@public.talk.google.com',
                "reminders":  [
                    {when: new Date().getTime() - 1005, msg: 'Hoooooola5'},
                    {when: new Date().getTime() + 1000006, msg: 'Hoooooola6'}
                ]
            }
        ];

    // var bulkUsers = require('bulkUsers');

    // var users = bulkUsers.map(mapEZ);

        //console.log('found', users.length, 'users.');

        promise = new Promise(function (resolve, reject) {
            connect(Config.database, {}).then(function(db){
                save(users, self.users).then(function(bulkRes){
                    console.log('Bulk complete.', JSON.stringify(bulkRes));
                    resolve();
                    //db.close();
                }, function(err){
                    console.log('Bulk Error:', err);
                    reject();
                    db.close();
                });
            }, function(err){
                reject();
                console.log('DB Error:', err);
            });
        });

        return promise;

    },
        /**
         * Save users
         * @param  {Array}    users  List of users to update
         * @param  {Model}    Model    Mongoose model to update
         * @param  {Object}   match    Database field to match
         * @return {Promise}  always resolves a BulkWriteResult
         */
        save = function (users, Model, match){
            match = match || 'id';
            return new Promise(function(resolve, reject){
                var bulk = Model.collection.initializeUnorderedBulkOp();
                users.forEach(function(user){
                    var query = {};
                    query[match] = user[match];
                    bulk.find(query).upsert().updateOne( user, function (a,b,c) {
                        console.log('UPDATED ONE');
                    } );
                });
                bulk.execute(function(err, bulkres){
                    if (err) return reject(err);
                    resolve(bulkres);
                });
            });
        },
        userRegister = function (userId) {
            var
                self = this,
                callback;

            userId = userId.split('/')[0];

            callback = {
                success : function(models, err) {
                    if (models.length === 0) {
                        save([{
                            "id": userId,
                            "reminders":  []
                        }], self.users).then(function(resp){
                            console.log('Success Response: ', JSON.stringify(resp));
                            //db.close();
                        }, function(err){
                            console.log('Error Response: ', err);
                            //db.close();
                        });
                    }
                },
                error : function(err){
                    console.log('error', err);
                }
            };

            this.users.find({'id': userId}).exec()
                .then(callback.success);
        },
        reminderRegister = function (user, reminder) {

        },
        getUserSchedule = function () {
            var self = this,
                callback;

            callback = {
                success : function(models, err) {
                    var schedules = [],
                        userReminders,
                        userId;

                    if (err) console.log('getUserScheduleError: ', err);

                    if (models.length > 0) {
                        models.forEach(function (model, index) {
                            userId = model.id;
                            userReminders = [];

                            model.reminders.forEach(function (reminderObj, index) {
                                if (!self.utils.isTimePassed(reminderObj.when)) {
                                    schedules.push(reminderObj);
                                    userReminders.push(reminderObj);
                                }
                            });
                            if ((userReminders.length > 0) && self.utils.isDifferentArray(model.reminders, userReminders)) {
                                save([{
                                    "id": userId,
                                    "reminders":  userReminders
                                }], self.users).then(function(resp){
                                    console.log('Success Response: ', JSON.stringify(resp));
                                    //db.close();
                                }, function(err){
                                    console.log('Error Response: ', err);
                                    //db.close();
                                });
                            }

                        });
                        return schedules;
                    }
                },
                error : function(err){
                    console.log('error', err);
                }
            };

            return this.users.find({}).exec().then(callback.success);

        };

    return {
        init: init,
        userRegister: userRegister,
        reminderRegister: reminderRegister,
        getUserSchedule: getUserSchedule
    };
}

var dataBaseService = function () {
    var
        promise = new Promise(function (resolve, reject) {
            dataBaseService = new Comunication();
            dataBaseService
                .init()
                .then(function () {
                    resolve(dataBaseService);
                });

        });

    return promise;
};

module.exports = dataBaseService;
