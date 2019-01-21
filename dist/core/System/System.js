"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class System {
    constructor(name) {
        this.name = name;
    }
    // optional
    onInit() { }
    ;
    onStop() { }
    ;
    onStart() { }
    ;
    onGameDataUpdate() { }
    ;
}
exports.default = System;
