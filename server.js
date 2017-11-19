var websocket = require('faye-websocket'),
    http      = require('http'),
    fs        = require('fs');

//createServer方法其实本质上也是为http.Server对象添加了一个request事件监听
//server = new http.Server() ;server.on('request' , function);
//  ==
//server = http.createServer(function);

var server = http.createServer( function(req , res){
  //访问localhost:8888 会执行
  //或者说有request请求会执行
  //等价于server.on('request' , callback);
  //websocket不是request请求
  console.log("create server");
});
var clients = [];

server.on('request', function(req , res) {
  console.log("server on request");
  fs.readFile('./nodeserver.html' , function(err , data) {
    if(err) {
      res.writeHead(500 , {"Content-Type" : "text/plain"});
      res.write(err+"\n");
      res.end();
    } else {
      res.writeHead(200 , {'Content-Type' : 'text/html;charset=utf-8'});
      res.write(data);
      res.end();
    }
  });
});

server.on('upgrade', function(request ,socket , body) {
  console.log("http upgrade");
  if(websocket.isWebSocket(request)) {
    var ws = new websocket(request , socket , body);

    ws.on('open', function(event){
      clients.push(ws);
      clients.forEach(function(thews) {
        thews.send("有人进来啦");
      });
      console.log("open a  ws");
    })
    ws.on('message' , function(event) {
      console.log("clients length : " + clients.length);

      clients.forEach(function(thews , i ,cli) {
        thews.send(event.data);
      });
      // ws.send(event.data);
      //slice(str.indexOf(':')+1 , -1);
      if(event.data.substr(event.data.indexOf(":")+2 ,5)==="data:"){
        console.log('message',event.data.substr(0,event.data.indexOf(":")+1),"an image");
      } else {
        console.log('message',event.data);

      }
    });

    ws.on('close' , function(event) {
      console.log('close', event.code , event.reason);

      clients = clients.filter(function(thews){
        return thews !== ws;
      });
      clients.forEach(function(thews) {
        thews.send("有人退出啦");
      });
      console.log("clients length : " + clients.length);
      ws = null;
    });
  }
});

server.listen(8888);
console.log("start!");
