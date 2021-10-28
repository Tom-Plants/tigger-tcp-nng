import Client from "./transmission/client";
let count = 0;

let client = new Client("45.135.135.142", 12345, 2);

for(;count < 100; count++) {
    console.log(count);
    client.sendData(Buffer.alloc(1024*100), 1000);
}