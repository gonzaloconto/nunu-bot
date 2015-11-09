/**
 * Created by gonzalo on 02/11/15.
 */
var Promise = require('bluebird');

function Builder() {
    var init = function (params) {
            this.databaseService = params.databaseService;
        },
        getSchedule = function () {
            var
                self = this,
                promise = new Promise(function (resolve, reject) {
                    self.databaseService.getUserSchedule().then(function (schedules) {
                        resolve(schedules);
                    });
                });

            return promise;
        };

    return {
        init: init,
        getSchedule: getSchedule
    };
}

var Schedule = function (params) {
    if (typeof Schedule.singleton === 'undefined') {
        Schedule.singleton = new Builder();
        Schedule.singleton.init(params);
    }

    return Schedule.singleton;
};

module.exports = Schedule;
