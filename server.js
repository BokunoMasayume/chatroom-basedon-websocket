var websocket = require('faye-websocket'),
    http      = require('http'),
    fs        = require('fs');

var server = http.createServer();
var clients = [];
server.on('upgrade', function(request ,socket , body) {
  if(websocket.isWebSocket(request)) {
    var ws = new websocket(request , socket , body);

    ws.on('open', function(event){
      clients.push(ws);
      console.log("open a  ws");
    })
    ws.on('message' , function(event) {
      console.log("clients length : " + clients.length);

      clients.forEach(function(thews , i ,cli) {
        thews.send(event.data);
      });
      // ws.send(event.data);
      console.log('message',event.data);
    });

    ws.on('close' , function(event) {
      console.log('close', event.code , event.reason);

      clients = clients.filter(function(thews){
        return thews !== ws;
      });

      console.log("clients length : " + clients.length);
      ws = null;
    });
  }
});

server.listen(8888);
console.log("start!");
