function Utils() {
    var isTimePassed = function ( timestamp ) {
            var
                now = new Date().getTime();

            return ((now - timestamp) > 0);
        },
        filterElementFromArray = function (array, positionToFilter) {
            var cleanArray = [];

            if (array.length === 0) return;

            array.forEach(function (element, index) {
                if (positionToFilter !== index ) {
                    cleanArray.push(element);
                }
            });

            return cleanArray;
        },
        isEquivalent = function(a, b) {
            // Create arrays of property names
            var aProps = Object.getOwnPropertyNames(a);
            var bProps = Object.getOwnPropertyNames(b);

            // If number of properties is different,
            // objects are not equivalent
            if (aProps.length != bProps.length) {
                return false;
            }

            for (var i = 0; i < aProps.length; i++) {
                var propName = aProps[i];

                // If values of same property are not equal,
                // objects are not equivalent
                if (a[propName] !== b[propName]) {
                    return false;
                }
            }

            // If we made it this far, objects
            // are considered equivalent
            return true;
        },
        isDifferentArray = function (firstArray, secondArray) {
            if (firstArray.length !== secondArray.length) {
                return true;
            }else{
                firstArray.forEach(function (element, index) {
                    if (isEquivalent(element, secondArray[index])) {
                        return true;
                    }
                });
            }
            return false;
        };

    return {
        isTimePassed: isTimePassed,
        filterElementFromArray: filterElementFromArray,
        isDifferentArray: isDifferentArray,
        isEquivalent: isEquivalent
    };
}

var utils = function () {
    if (typeof utils.singleton === 'undefined') {
        utils.singleton = new Utils();
    }

    return utils.singleton;
};

module.exports = utils;
