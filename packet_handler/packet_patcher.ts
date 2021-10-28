export default class PacketPatcher {
    private tunnelN: number;

    constructor(tunnelN: number) {
        this.tunnelN = tunnelN;
    }

    public patch(data: Buffer, port: number):Buffer[] {
        return this.silceBuffer(data, this.tunnelN, port);
    }
    private silceBuffer(buffer: Buffer, count:number, port: number): Buffer[]
    {
        let length:number = buffer.length;
        let block_length:number = Math.ceil(length/count);
        let ap:Buffer[] = [];

        for(let i:number = 0; i < count; i++)
        {
            let l:Buffer = Buffer.from([0, 0, i]);
            let lh:number = l.length;

            let ls:Buffer = buffer.slice((i)*block_length, (i+1)*block_length);
            let g:Buffer = Buffer.concat([l, ls], ls.length + lh);

            g.writeUInt16LE(port, 0);
            ap.push(g);
        }
        return ap;
    }
}