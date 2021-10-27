"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = __importDefault(require("../tunnel/server"));
var packer_patcher_1 = __importDefault(require("../packet_handler/packer_patcher"));
var packet_mixer_1 = __importDefault(require("../packet_handler/packet_mixer"));
var Server = /** @class */ (function () {
    function Server(host, port, tunnelN) {
        var _this = this;
        this.servers = new Array();
        this.patcher = new packer_patcher_1.default(tunnelN);
        this.mixer = new packet_mixer_1.default(tunnelN);
        this.dataReciveCallbacks = new Array();
        this.openServers(host, port, tunnelN);
        this.mixer.analyze(function (arg, data) {
            _this.dataReciveCallbacks.map(function (cb) {
                cb(arg, data);
            });
        });
    }
    Server.prototype.openServers = function (host, port, n) {
        var _this = this;
        var targetPort = 0;
        for (var i = 0; i < n; i++) {
            targetPort = port + i;
            var tServer = new server_1.default(host, targetPort);
            this.servers.push(tServer);
            tServer.onDataRecived(function (data) {
                _this.mixer.input(data);
            });
        }
    };
    Server.prototype.sendData = function (data, sourcePort) {
        var splitBuffer = this.patcher.patch(data, sourcePort);
        this.servers.map(function (client, index) {
            client.sendData(splitBuffer[index]);
        });
    };
    Server.prototype.onDataRecived = function (callback) {
        this.dataReciveCallbacks.push(callback);
    };
    return Server;
}());
exports.default = Server;
