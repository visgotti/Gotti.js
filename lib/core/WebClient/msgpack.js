"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = exports.decode = void 0;
const msgpackDecode = require("notepack.io/browser/decode");
const msgpackEncode = require("notepack.io/browser/encode");
exports.decode = msgpackDecode;
exports.encode = msgpackEncode;
