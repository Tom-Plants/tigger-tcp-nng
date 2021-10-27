export default class Mapper<T> {
    private items: Map<string, T | undefined>;
    constructor() {
        this.items = new Map<string, T>();
    }
    public removeItem(id: string, cb : (obj: T)=> void): void {
        //this.avoidNullCall(cb)(this.items[id]);
        let i = this.items.get(id);
        if(i == undefined) return;
        cb(i);
    }
    public getItem(id: string, cb?: (obj: T) => void):T | undefined {
        if(cb != undefined) {
            let item = this.items.get(id);
            if(item != undefined) {
                cb(item);
            }
        }
        return this.items.get(id);
    }
    public setItem(id: string, obj: T): void {
        this.items.set(id, obj);
    }
    public foreach(cb: (id: string, obj: T|undefined) => void): void{
        this.items.forEach((item: T | undefined, key:string) => {
            cb(key, item);
        });
    }
}