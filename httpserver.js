var HttpServer = function(nodeHttp, nodeFs, ipaddr, port) {

    var httpServer = nodeHttp.createServer(function(req, res) {

        if (req.url.search('.js') > -1)  {
            console.log(req.url)

            res.writeHead(200, { 'Content-type': 'text/javascript'});
            res.end(nodeFs.readFileSync(__dirname + '/client' + req.url));
        
        } else if (req.url.search('index.html') > -1 || (req.url == '/')) {

            res.writeHead(200, { 'Content-type': 'text/html'});
            res.end(nodeFs.readFileSync(__dirname + '/client/index.html'));    
        
        } else {

            res.writeHead(404, { 'Content-type': 'text/html'});
            console.log("File not found: " + req.url);
        }

    });

    httpServer.listen(port, ipaddr);

    return httpServer;

};

if (typeof module !== 'undefined') {
    module.exports = {
        'HttpServer': HttpServer
    };
}