"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Mapper = /** @class */ (function () {
    function Mapper() {
        this.items = new Map();
    }
    Mapper.prototype.removeItem = function (id, cb) {
        //this.avoidNullCall(cb)(this.items[id]);
        var i = this.items.get(id);
        if (i != undefined)
            cb(i);
        this.items.set(id, undefined);
    };
    Mapper.prototype.getItem = function (id) {
        return this.items.get(id);
    };
    Mapper.prototype.setItem = function (id, obj) {
        this.items.set(id, obj);
    };
    Mapper.prototype.foreach = function (cb) {
        this.items.forEach(function (item, key) {
            cb(key, item);
        });
    };
    return Mapper;
}());
exports.default = Mapper;
