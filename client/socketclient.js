var Client = function(socket) {

    var isConnected = false;

    var connectCallback = function() {};
    var disconnectCallback = function() {};
    var receiveCallbacks = [];

    var connect = function() {
        isConnected = true;
        connectCallback();
    };

    var disconnect = function() {
        isConnected = false;
        disconnectCallback();
    };

    socket.on('connect', connect);
    socket.on('connect_error', function() {});
    socket.on('disconnect', disconnect);
    socket.on('reconnect', function() {});
    socket.on('reconnect_error', function() {});
    socket.on('data', function(data) {

        receiveCallbacks.forEach(function(cb) { cb(data); }); 
    
    });

    var client = {
        'on': function(event, callback) {
            if (event == 'connect') {
                connectCallback = callback;
            }
            else if (event == 'disconnect') {
                disconnectCallback = callback;
            }
        },
        'send': function(data) {
            if (!isConnected)
                throw new Error("Client not connected!");

            socket.emit('data', data);
        },
        'receive': function(callback) {
            receiveCallbacks.push(callback);
        }
    };

    return client;

};