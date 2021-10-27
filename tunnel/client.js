"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nanomsg_1 = require("nanomsg");
var Client = /** @class */ (function () {
    function Client(host, port) {
        this.pair = (0, nanomsg_1.socket)("pair");
        this.dataReciveCallbacks = new Array();
        this.init(host, port);
    }
    Client.prototype.init = function (host, port) {
        var _this = this;
        this.pair.connect("tcp://" + host + ":" + port.toString());
        this.pair.on("data", function (data) {
            _this.dataReciveCallbacks.map(function (item) {
                item(data);
            });
        });
    };
    Client.prototype.sendData = function (data) {
        this.pair.send(data);
    };
    Client.prototype.onDataRecived = function (callback) {
        this.dataReciveCallbacks.push(callback);
    };
    return Client;
}());
exports.default = Client;
