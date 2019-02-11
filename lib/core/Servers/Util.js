"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const querystring = require("querystring");
const nanoid = require('nanoid');
//
// nodemon sends SIGUSR2 before reloading
// (https://github.com/remy/nodemon#controlling-shutdown-of-your-script)
//
const signals = ['SIGINT', 'SIGTERM', 'SIGUSR2'];
function registerGracefulShutdown(callback) {
    signals.forEach((signal) => process.once(signal, () => callback(signal)));
}
exports.registerGracefulShutdown = registerGracefulShutdown;
function retry(cb, maxRetries = 3, retries = 0, errorWhiteList = []) {
    return new Promise((resolve, reject) => {
        cb()
            .then(resolve)
            .catch((e) => {
            if (errorWhiteList.indexOf(e.constructor) === -1 &&
                retries++ < maxRetries) {
                retry(cb, maxRetries, retries, errorWhiteList).
                    then(resolve).
                    catch((e2) => reject(e2));
            }
            else {
                reject(e);
            }
        });
    });
}
exports.retry = retry;
function spliceOne(arr, index) {
    // manually splice availableRooms array
    // http://jsperf.com/manual-splice
    if (index === -1 || index >= arr.length) {
        return false;
    }
    const len = arr.length - 1;
    for (let i = index; i < len; i++) {
        arr[i] = arr[i + 1];
    }
    arr.length = len;
    return true;
}
exports.spliceOne = spliceOne;
function parseQueryString(query) {
    const data = querystring.parse(query.substr(1));
    for (const k in data) {
        if (!Object.prototype.hasOwnProperty.call(data, k)) {
            continue;
        }
        let typedValue;
        try {
            typedValue = JSON.parse(data[k]);
        }
        catch (e) {
            typedValue = data[k];
        }
        data[k] = typedValue;
    }
    return data;
}
exports.parseQueryString = parseQueryString;
function generateId() { return nanoid(9); }
exports.generateId = generateId;
function merge(a, ...objs) {
    for (let i = 0, len = objs.length; i < len; i++) {
        const b = objs[i];
        for (const key in b) {
            if (b.hasOwnProperty(key)) {
                a[key] = b[key];
            }
        }
    }
    return a;
}
exports.merge = merge;
function sortByProperty(property) {
    return function (a, b) {
        if (a[property] < b[property])
            return -1;
        if (a[property] > b[property])
            return 1;
        return 0;
    };
}
exports.sortByProperty = sortByProperty;
function logError(err) {
    if (err) {
        console.error(`websocket error: ${err.message}\n${err.stack}`);
    }
}
exports.logError = logError;
