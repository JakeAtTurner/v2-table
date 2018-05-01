import { getAttribute } from './util';

const createNumberSort = function (prop) {
    return (a, b) => {
        const numA = getAttribute(a, prop);
        const numB = getAttribute(b, prop);
        return numA - numB;
    };
};

const createStringSort = function (prop) {
    return (a, b) => {
        let stringA = getAttribute(a, prop);
        let stringB = getAttribute(b, prop);
        if (stringA && stringB) {
            stringA = stringA.toLowerCase();
            stringB = stringB.toLowerCase();
            if (stringA < stringB) {
                return -1;
            } else if (stringA > stringB) {
                return 1;
            } else {
                return 0;
            }
        } else {
            if (stringA) {
                return -1;
            } else if (stringB) {
                return 1;
            } else {
                return 0;
            }
        }
    };
};

const createSortFunction = function (prop, order, type) {
    let sortingFunc = null;
    if (type === Number) {
        sortingFunc = createNumberSort(prop);
    } else if (type === String) {
        sortingFunc = createStringSort(prop);
    }
    sortingFunc = applyDescending(order, sortingFunc);
    return sortingFunc;
};

const applyDescending = function (order, sortingFunc) {
    const isDescending = order !== 'ascending';
    if (isDescending) {
        const descendingFunc = (a, b) => {
            const v = sortingFunc(a, b);
            return v * -1;
        };
        return descendingFunc;
    } else {
        return sortingFunc;
    }
};

export {
    createSortFunction
};
