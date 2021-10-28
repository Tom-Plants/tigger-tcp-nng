import { randomInt } from "crypto";
import Mapper from "../Mapper";

type RandomKV = {key:number, value: number};
/**
 * 只能使用整数！
 */
export default class Random {
    private mapper:Map<number, number>;
    private min: number;
    private max: number;
    private length: number;
    private count: number;
    constructor(min: number, max: number) {
        this.min = min;
        this.max = max;
        this.count = 0;

        let length = max - min;
        if(length <= 0) throw "min cannot >= max";

        this.length = length;
        this.mapper = new Map<number, number>();

        for(let i:number = min; i < max; i++)
        {
            this.mapper.set(i, i);
        }
    }
    public getANumber(): number {
        let karr:Array<RandomKV> = new Array<RandomKV>();

        if(this.count == this.length) {
            this.mapper.clear();
            for(let i:number = this.min; i < this.max; i++) this.mapper.set(i, i);
        }

        this.mapper.forEach((key: number, value: number) => {
            karr.push({key, value});
        });

        let karrLength = karr.length;
        let randomIndex = randomInt(0, karrLength);
        let num:RandomKV = karr[randomIndex];
        let rtn: number  = num.value;

        this.count++;
        this.mapper.delete(num.key);
        return rtn;
    }
}