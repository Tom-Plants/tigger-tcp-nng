"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var packer_patcher_1 = __importDefault(require("../packet_handler/packer_patcher"));
var packet_mixer_1 = __importDefault(require("../packet_handler/packet_mixer"));
var client_1 = __importDefault(require("../tunnel/client"));
var Client = /** @class */ (function () {
    function Client(host, port, tunnelN) {
        var _this = this;
        this.clients = new Array();
        this.patcher = new packer_patcher_1.default(tunnelN);
        this.mixer = new packet_mixer_1.default(tunnelN);
        this.dataReciveCallbacks = new Array();
        this.openTunnels(host, port, tunnelN);
        this.mixer.analyze(function (arg, data) {
            _this.dataReciveCallbacks.map(function (cb) {
                cb(arg, data);
            });
        });
    }
    Client.prototype.openTunnels = function (host, port, n) {
        var _this = this;
        var targetPort = 0;
        for (var i = 0; i < n; i++) {
            targetPort = port + i;
            var tClient = new client_1.default(host, targetPort);
            this.clients.push(tClient);
            tClient.onDataRecived(function (data) {
                _this.mixer.input(data);
            });
        }
    };
    Client.prototype.sendData = function (data, sourcePort) {
        var splitBuffer = this.patcher.patch(data, sourcePort);
        this.clients.map(function (client, index) {
            client.sendData(splitBuffer[index]);
        });
    };
    Client.prototype.onDataRecived = function (callback) {
        this.dataReciveCallbacks.push(callback);
    };
    return Client;
}());
exports.default = Client;
