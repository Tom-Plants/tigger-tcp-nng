import arg from "arg";
import { ListenOptions, TcpSocketConnectOpts } from "net";

try{
    const args = arg({
        '--type': String
    });

    //条件通过
    if(args["--type"] != undefined)
    {
        if(args["--type"] == "server")
        {
            //以服务器方式运作

            // let server:TiggerTcpServer = Server(options);
            // server.sendData()

            //let client:TiggerTcpClient = Client(options);

            let controlListen:ListenOptions = {port: 0, host: ""};       //控制通道监听地址
            let outboundsListen:ListenOptions = {port: 0, host: ""};     //多线程通道监听起始地址
            let options:TcpSocketConnectOpts = {port: 0, host: ""};      //目标转发地址

            let server: TiggerTcpServer = Server(controlListen); 
            new Dispatcher(options, outboundsListen, server, 0, true);
        }else if(args["--type"] == "client")
        {
            //以客户端方式运作

            let options:TcpSocketConnectOpts = {port: 10000, host: "ali1.0x7c00.site"};
            // let server:TiggerTcpServer = Server(options);
            // server.sendData()

            //let server: TiggerTcpServer = Server(options);
            let client:TiggerTcpClient = Client(options);
            let dispatcher_listen_options:ListenOptions = {port: 10000, host: "localhost"};
            new Dispatcher(dispatcher_listen_options, options, client, 8, false);
        }else
        {
            throw "请指定运行方式";
        }
        
    }
}catch(err: any)
{
    if(err.code == 'ARG_UNKNOWN_OPTION')
    {
        console.log(err.message);
    }
    else{
        throw err;
    }
}