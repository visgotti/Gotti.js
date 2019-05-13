
let activeLoop;
const __cancelAnimationFrame = typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame.bind(window) : clearTimeout;

const disabledMeter = {
    tickStart: () => {},
    tick: () => {},
    destroy: () => {},
};

let meter = disabledMeter;

export function clearGameLoop () {
    __cancelAnimationFrame(activeLoop);
    if(meter) {
        meter.destroy();
        meter = disabledMeter;
    }
};

export function setGameLoop (update, tickLengthMs = 1000 / 30, useFpsMeter = true) {
    let __cancelAnimationFrame;
    let __requestAnimationFrame;

    if(useFpsMeter) {
        if(!(typeof FPSMeter)) {
            useFpsMeter = false;
        }
    }

    __requestAnimationFrame = typeof requestAnimationFrame === 'function' ? requestAnimationFrame.bind(window) : (function(){
        var lastTimestamp = Date.now(),
            now,
            timeout;
        return function(callback) {
            now = Date.now();
            timeout = Math.max(0, tickLengthMs - (now - lastTimestamp));
            lastTimestamp = now + timeout;
            return setTimeout(function() {
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
    const tick = tickLengthMs / 1000;

    const gameLoop = function() {
        const currentTime = Date.now();
        if(currentTime < lastFrameTimeMs + tickLengthMs) {
            activeLoop = __requestAnimationFrame(gameLoop);
            return
        }
        delta += currentTime - lastFrameTimeMs;
        lastFrameTimeMs = currentTime;

        var numUpdateSteps = 0;
        while (delta >= tickLengthMs) {
            update(tick);
            delta -= tickLengthMs;
            if (++numUpdateSteps >= 240) {
                panic();
                break;
            }
        }
    };

    const gameLookWithoutMeter = function() {
        gameLoop();
        activeLoop = __requestAnimationFrame(gameLookWithoutMeter);
    };

    const gameLoopWithMeter = function() {
        meter.tickStart();
        gameLoop();
        meter.tick();
        activeLoop = __requestAnimationFrame(gameLoopWithMeter);
    };

    if(useFpsMeter) {
        gameLoopWithMeter();
    } else {
        gameLookWithoutMeter();
    }
};
