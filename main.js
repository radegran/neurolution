var nodeFs = require('fs');
var nodeHttp = require('http');
//var mongojs = require('mongojs');
var httpServer = require('./httpserver');

var ipaddr = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

// Create

httpServer.HttpServer(
    nodeHttp, 
    nodeFs, 
    ipaddr, 
    port
);

console.log("Server started at " + new Date());
