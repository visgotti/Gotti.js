"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let activeLoop;
const __cancelAnimationFrame = typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame.bind(window) : clearTimeout;
function clearGameLoop() {
    __cancelAnimationFrame(activeLoop);
}
exports.clearGameLoop = clearGameLoop;
;
function setGameLoop(update, tickLengthMs = 1000 / 30) {
    let __cancelAnimationFrame;
    let __requestAnimationFrame;
    __requestAnimationFrame = typeof requestAnimationFrame === 'function' ? requestAnimationFrame.bind(window) : (function () {
        var lastTimestamp = Date.now(), now, timeout;
        return function (callback) {
            now = Date.now();
            timeout = Math.max(0, tickLengthMs - (now - lastTimestamp));
            lastTimestamp = now + timeout;
            return setTimeout(function () {
                callback(lastTimestamp);
            }, timeout);
        };
    })();
    let delta = 0;
    let framesThisSecond = 0;
    let lastFpsUpdate = 0;
    let lastFrameTimeMs = 0;
    function panic() {
        delta = 0;
    }
    const gameLoop = function () {
        const currentTime = Date.now();
        if (currentTime < lastFrameTimeMs + tickLengthMs) {
            activeLoop = __requestAnimationFrame(gameLoop);
            return;
        }
        delta += currentTime - lastFrameTimeMs;
        lastFrameTimeMs = currentTime;
        var numUpdateSteps = 0;
        while (delta >= tickLengthMs) {
            console.log('timestep was', tickLengthMs);
            update(tickLengthMs);
            delta -= tickLengthMs;
            if (++numUpdateSteps >= 240) {
                panic();
                break;
            }
        }
        activeLoop = __requestAnimationFrame(gameLoop);
    };
    gameLoop();
}
exports.setGameLoop = setGameLoop;
;
