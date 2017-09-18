var nodeFs = require('fs');
var nodeHttp = require('http');
//var mongojs = require('mongojs');
var httpServer = require('./httpserver');


var ipaddr = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
var port   = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;

// Create

httpServer.HttpServer(
    nodeHttp, 
    nodeFs, 
    ipaddr, 
    port
);

console.log("Server started at " + new Date());
