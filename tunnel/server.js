"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nanomsg_1 = require("nanomsg");
var server = /** @class */ (function () {
    function server(host, port) {
        this.pair = (0, nanomsg_1.socket)("pair");
        this.dataReciveCallbacks = new Array();
        this.init(host, port);
    }
    server.prototype.init = function (host, port) {
        var _this = this;
        this.pair.bind("tcp://" + host + ":" + port.toString());
        this.pair.on("data", function (data) {
            _this.dataReciveCallbacks.map(function (item) {
                item(data);
            });
        });
    };
    server.prototype.sendData = function (data) {
        this.pair.send(data);
    };
    server.prototype.onDataRecived = function (callback) {
        this.dataReciveCallbacks.push(callback);
    };
    return server;
}());
exports.default = server;
