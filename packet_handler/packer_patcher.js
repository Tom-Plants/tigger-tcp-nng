"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PacketPatcher = /** @class */ (function () {
    function PacketPatcher(tunnelN) {
        this.tunnelN = tunnelN;
    }
    PacketPatcher.prototype.patch = function (data, port) {
        return this.silceBuffer(data, this.tunnelN, port);
    };
    PacketPatcher.prototype.silceBuffer = function (buffer, count, port) {
        var length = buffer.length;
        var block_length = Math.ceil(length / count);
        var ap = [];
        for (var i = 0; i < count; i++) {
            var l = Buffer.from([0, 0, i]);
            var lh = l.length;
            var ls = buffer.slice((i) * block_length, (i + 1) * block_length);
            var g = Buffer.concat([l, ls], ls.length + lh);
            g.writeUInt16LE(port, 0);
            ap.push(g);
        }
        return ap;
    };
    return PacketPatcher;
}());
exports.default = PacketPatcher;
