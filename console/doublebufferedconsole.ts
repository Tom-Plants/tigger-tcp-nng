import { Console } from "console";
import { stdout } from "process";
import { Duplex, Writable } from "stream"
import { InspectOptions } from "util";
import { MoveTo00 } from "../utils/ff";

export default class DoubleBufferedConsole extends Writable{
    private dbConsole: Console;
    private chunks: string;
    private outputLine: number;

    private backBoard: string;
    private initLine: string;

    private FrontBoard: string;
    constructor() {
        super();
        this.dbConsole = new Console(this);
        this.chunks = "";
        this.outputLine = 0;

        this.initLine = "*".repeat(stdout.columns);
        this.backBoard = (this.initLine+"\r\n").repeat(stdout.rows);

        this.FrontBoard = Buffer.alloc(this.backBoard.length).write(this.backBoard).toString();
        //this.clean();
    }

    log(...data: any[]): void {
        this.dbConsole.info(...data);
    }

    clean()  {
        this.FrontBoard = Buffer.alloc(this.backBoard.length).write(this.backBoard).toString();
    }

    _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void) {
        chunk=chunk.toString().replace(/\n|\r/g,""); 
        this.chunks += (chunk.toString().padEnd(stdout.columns, "*") + "\r\n");
        callback(null);
    }

    show() {
        //MoveTo00();
        //stdout.write(this.backBoard);
        MoveTo00();
        stdout.write(this.chunks);
        this.chunks = "";
        this.outputLine = 0;
    }

}