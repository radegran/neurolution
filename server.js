var fs = require('fs');
var http = require('http');
var socketio = require('socket.io');
var server = require('./server/socketserver');


// Http server
var httpServer = http.createServer(function(req, res) {

    if (req.url.search('client-dist.js') > -1) {
        res.writeHead(200, { 'Content-type': 'text/javascript'});
        res.end(fs.readFileSync(__dirname + '/dist/client-dist.js'));
    }
    else {
        res.writeHead(200, { 'Content-type': 'text/html'});
        res.end(fs.readFileSync(__dirname + '/index.html'));    
    }

});

var ipaddr  = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port    = process.env.OPENSHIFT_NODEJS_PORT || 8080;

httpServer.listen(port, ipaddr);

var socket = socketio.listen(httpServer);

server.Server({'socket': socket});
