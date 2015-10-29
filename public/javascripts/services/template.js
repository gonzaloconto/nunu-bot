/**
 * Created by gonzalo on 29/10/15.
 */
var
    templates = {
        mail: require('../templates/mail'),
        steam_featured: require('../templates/steam_featured')
    };


function Delivery() {
    var template = function ( key ) {
            return templates[key];
        },
        parsedTemplate = function (params) {
            return templates[params.key](params.data);
        };

    return {
        template: template,
        parsedTemplate: parsedTemplate
    };
}

var tamplateDelivery = function () {
    if (typeof tamplateDelivery.singleton === 'undefined') {
        tamplateDelivery.singleton = new Delivery();
    }

    return tamplateDelivery.singleton;
};

module.exports = tamplateDelivery;
