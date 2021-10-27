"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Mapper_1 = __importDefault(require("../Mapper"));
var PacketMixer = /** @class */ (function () {
    function PacketMixer(tunnelN) {
        this.tunnelN = tunnelN;
        this.packetController = new Mapper_1.default();
        this.cb = function () { };
    }
    PacketMixer.prototype.input = function (data) {
        var packet = this.analyzePacket(data);
        var found_obj = undefined;
        //found_obj = this.packetController.getClient(packet.port.toString());
        found_obj = this.packetController.getItem(packet.port.toString());
        if (found_obj != undefined) {
            found_obj.data[packet.num] = packet.data;
            found_obj.setup[packet.num] = true;
            this.analyzePackets(found_obj);
        }
        else {
            var p = this.newPacket(packet.port);
            p.data[packet.num] = packet.data;
            p.setup[packet.num] = true;
            //this.packetController.addClientWithId(packet.port.toString(), p);
            this.packetController.setItem(packet.port.toString(), p);
            this.analyzePackets(p);
        }
    };
    PacketMixer.prototype.analyze = function (cb) {
        this.cb = cb;
    };
    PacketMixer.prototype.newPacket = function (port) {
        var buffers = new Array();
        var setups = new Array();
        for (var i = 0; i < this.tunnelN; i++) {
            buffers.push(Buffer.alloc(0));
            setups.push(false);
        }
        return {
            port: port,
            data: buffers,
            setup: setups,
        };
    };
    PacketMixer.prototype.analyzePacket = function (data) {
        var port = data.readUInt16LE(0);
        var num = data.readUInt8(2);
        var real_data = data.slice(3, data.length);
        return { port: port, num: num, data: real_data };
    };
    PacketMixer.prototype.analyzePackets = function (found_obj) {
        if (this.isPacketSuccess(found_obj)) {
            this.cb(found_obj.port, this.mixPacket(found_obj.data));
            this.clearPacket(found_obj);
        }
    };
    PacketMixer.prototype.clearPacket = function (obj_g) {
        //this.packetController.removeClient(obj_g.port.toString());
        this.packetController.removeItem(obj_g.port.toString(), function (obj) { });
    };
    PacketMixer.prototype.isPacketSuccess = function (obj) {
        var success = true;
        for (var i in obj.setup) {
            if (obj.setup[i] == false) {
                success = false;
                break;
            }
        }
        return success;
    };
    PacketMixer.prototype.mixPacket = function (data) {
        var rtn = Buffer.alloc(0);
        for (var i in data) {
            rtn = Buffer.concat([rtn, data[i]]);
        }
        return rtn;
    };
    return PacketMixer;
}());
exports.default = PacketMixer;
