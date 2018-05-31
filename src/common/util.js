/**
 * When given an attribute as a string, return the attribute chain for the object
 * @param {Object} object 
 * @param {String} attribute 
 */
const getAttribute = function (object, attribute) {
    const attributeSplit = attribute.split('.');
    return getAttributeFromSplit(object, attributeSplit);
};

/**
 * given a list of strings, chains the object to return the attributes of the list
 * @param {*} object 
 * @param {*} attributeSplit 
 */
const getAttributeFromSplit = function (object, attributeSplit) {
    if (!object) {
        return null;
    }
    if (attributeSplit.length === 1) {
        return object[attributeSplit[0]];
    } else {
        return getAttributeFromSplit(object[attributeSplit[0]], attributeSplit.slice(1, attributeSplit.length));
    }
};

export {
    getAttribute
};
