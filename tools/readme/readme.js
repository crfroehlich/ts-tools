"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("util");
var fs_1 = require("fs");
;
var Readme = /** @class */ (function () {
    function Readme(path) {
        if (path === void 0) { path = null; }
        this.indexedBlocks = new Map([]);
        this.orderedBlocks = [];
        this.path = path;
        if (this.path == null) {
            throw new Error('parse method requires a path to a readme file.');
        }
    }
    Readme.prototype.parse = function () {
        return __awaiter(this, void 0, void 0, function () {
            var readmeContent, e_1, lines, indexedBlocks, orderedBlocks, currentHeaderKey, lines_1, lines_1_1, line, block, latestBlock, currentIndexedBlocks;
            var e_2, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.path == null) {
                            return [2 /*return*/];
                        }
                        readmeContent = '';
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, util_1.promisify(fs_1.readFile)(this.path, 'utf8')];
                    case 2:
                        readmeContent = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _b.sent();
                        if (e_1.code === 'ENOENT') {
                            console.log("The file " + this.path + " could not be found");
                            process.exit(1);
                        }
                        return [3 /*break*/, 4];
                    case 4:
                        lines = readmeContent.split('\n');
                        indexedBlocks = new Map();
                        orderedBlocks = [];
                        currentHeaderKey = '_root';
                        indexedBlocks.set(currentHeaderKey, [[]]);
                        orderedBlocks.push({
                            header: currentHeaderKey,
                            content: [],
                        });
                        try {
                            for (lines_1 = __values(lines), lines_1_1 = lines_1.next(); !lines_1_1.done; lines_1_1 = lines_1.next()) {
                                line = lines_1_1.value;
                                // ordered: header, create new object. content line, push to latest
                                // new block
                                if (line.trim().startsWith('#')) {
                                    currentHeaderKey = line;
                                    // add a numerically indexed block, doesn't matter if we've seen before or not
                                    // because it's ordered
                                    orderedBlocks.push({
                                        header: currentHeaderKey,
                                        content: [],
                                    });
                                    block = indexedBlocks.get(currentHeaderKey);
                                    if (block) {
                                        block.push([]);
                                    }
                                    else {
                                        // create new array for block, doesn't exist yet
                                        indexedBlocks.set(currentHeaderKey, [[]]);
                                    }
                                }
                                else {
                                    latestBlock = orderedBlocks[orderedBlocks.length - 1];
                                    latestBlock.content.push(line);
                                    indexedBlocks.set(currentHeaderKey, indexedBlocks.get(currentHeaderKey) || [[]]);
                                    currentIndexedBlocks = indexedBlocks.get(currentHeaderKey);
                                    if (Array.isArray(currentIndexedBlocks)) {
                                        currentIndexedBlocks[currentIndexedBlocks.length - 1].push(line);
                                    }
                                }
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (lines_1_1 && !lines_1_1.done && (_a = lines_1.return)) _a.call(lines_1);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        this.indexedBlocks = indexedBlocks;
                        this.orderedBlocks = orderedBlocks;
                        return [2 /*return*/];
                }
            });
        });
    };
    Readme.prototype.export = function () {
        var e_3, _a;
        var _b = __read(this.orderedBlocks), root = _b[0], contentBlocks = _b.slice(1);
        // edge case: empty file
        if (!contentBlocks && root.content.length === 0) {
            return '';
        }
        var output = '';
        try {
            for (var _c = __values(this.orderedBlocks), _d = _c.next(); !_d.done; _d = _c.next()) {
                var block = _d.value;
                if (block.header !== '_root') {
                    output += block.header + '\n';
                }
                if (block.content.length > 0) {
                    output += block.content.join('\n') + '\n';
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return output;
    };
    Readme.prototype.getSection = function (target) {
        var e_4, _a;
        try {
            for (var _b = __values(this.indexedBlocks.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                if (typeof target === 'string') {
                    if (key.includes(target)) {
                        return value;
                    }
                }
                else if (target instanceof RegExp) {
                    if (target.test(key)) {
                        return value;
                    }
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
    };
    Readme.prototype.setSection = function (target, content) {
        var e_5, _a;
        if (content === void 0) { content = ''; }
        try {
            for (var _b = __values(this.indexedBlocks.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                var entry = new Map([]);
                if (typeof target === 'string') {
                    if (key.includes(target)) {
                        this.indexedBlocks.set(key, [content.split('\n')]);
                    }
                }
                else if (target instanceof RegExp) {
                    if (target.test(key)) {
                        this.indexedBlocks.set(key, [content.split('\n')]);
                    }
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
    };
    return Readme;
}());
exports.default = Readme;
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var filename, readme, newReadme;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                filename = process.argv.slice(2)[0];
                if (!filename) {
                    throw new Error('Missing Filename parameter. readme <filename>');
                    process.exit(1);
                }
                readme = new Readme(filename);
                return [4 /*yield*/, readme.parse()];
            case 1:
                _a.sent();
                readme.setSection(/#+ Table\ of\ Contents/, 'replaced toc with this crap');
                newReadme = readme.export();
                console.log(newReadme);
                return [2 /*return*/];
        }
    });
}); };
if (__filename === ((_b = (_a = process) === null || _a === void 0 ? void 0 : _a.mainModule) === null || _b === void 0 ? void 0 : _b.filename)) {
    main();
}
