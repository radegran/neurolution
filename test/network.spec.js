// TODO: MOVE TO HELPER
var SocketMock = function() {

    var callbacks = {};

    var s = {
        'on': function(event, callback) {
            callbacks[event] = callback;
        },
        'emit': function(event, data) {},
        // Test purpose
        'call' : function(event, arg) {
            callbacks[event](arg);
        }
    };

    spyOn(s, 'on').and.callThrough();
    spyOn(s, 'emit');

    return s;

};

describe("Network", function() {

    describe("Client", function() {

        it("should callback on connect and disconnect", function() {

            var mock = SocketMock();
            var onConnect = jasmine.createSpy('onConnect');
            var onDisconnect = jasmine.createSpy('onDisconnect');
            var c = Client(mock);
            c.on('connect', onConnect);
            c.on('disconnect', onDisconnect);

            expect(onConnect).not.toHaveBeenCalled();
            expect(onDisconnect).not.toHaveBeenCalled();

            mock.call('connect_error');
            expect(onConnect).not.toHaveBeenCalled();
            expect(onDisconnect).not.toHaveBeenCalled();

            mock.call('connect');
            expect(onConnect).toHaveBeenCalled();
            expect(onDisconnect).not.toHaveBeenCalled();
            onConnect.calls.reset();

            mock.call('disconnect');
            expect(onConnect).not.toHaveBeenCalled();
            expect(onDisconnect).toHaveBeenCalled();
            onDisconnect.calls.reset();

            mock.call('reconnect_error');
            expect(onConnect).not.toHaveBeenCalled();
            expect(onDisconnect).not.toHaveBeenCalled();

        });

        it("should emit data", function() {

            var mock = SocketMock();
            var c = Client(mock);
            var data = {'hello': 'world'};

            expect(function() { c.send(data); }).toThrow();
            expect(mock.emit).not.toHaveBeenCalled();

            mock.call('connect');
            c.send(data);
            expect(mock.emit).toHaveBeenCalledWith('data', data);
            mock.emit.calls.reset();

            mock.call('disconnect')
            expect(function() { c.send(data); }).toThrow();
            expect(mock.emit).not.toHaveBeenCalled();

        });

        it("should receive data (multiple receive callbacks)", function() {

            var mock = SocketMock();
            var c = Client(mock);
            var spy1 = jasmine.createSpy('receiveCallback1');
            var spy2 = jasmine.createSpy('receiveCallback2');
            c.receive(spy1);
            c.receive(spy2);

            var obj = {'hello': 'world'};
            mock.call('connect');
            mock.call('data', obj)

            expect(spy1).toHaveBeenCalledWith(obj);
            expect(spy2).toHaveBeenCalledWith(obj);

        });

    });

    describe("Server", function() {

        it("should delegate to commands", function() {

            var mock = SocketMock();
            var clientMock = SocketMock();
            var command = Commands.Command('hello', function(response) {
                    response.sendMessage('world!');
                });

            var s = SocketServer({'socket': mock, 'commands': [command]});

            mock.call('connection', clientMock);

            clientMock.call('data', {'cmd':'hello'});
            expect(clientMock.emit).toHaveBeenCalledWith('data', 
                jasmine.objectContaining({'cmd':'message', 'arg': 'world!'}));

        });

        it("should broadcast to other connected clients", function() {

            var mock = SocketMock();
            var client1 = SocketMock();
            var client2 = SocketMock();
            var client3 = SocketMock();

            var command = Commands.Command('broadcast', function(response, arg) {
                    response.broadcastMessage('ALL: ' + arg);
                });

            var s = SocketServer({'socket': mock, 'commands': [command]});

            mock.call('connection', client1);
            mock.call('connection', client2);
            mock.call('connection', client3);

            var message = {'cmd':'broadcast', 'arg': 'my message'};
            var toOthers = {'cmd':'message', 'arg': 'ALL: my message'};
            
            client2.call('data', message);
            expect(client1.emit).toHaveBeenCalledWith('data', jasmine.objectContaining(toOthers));
            expect(client2.emit).not.toHaveBeenCalled();
            expect(client3.emit).toHaveBeenCalledWith('data', jasmine.objectContaining(toOthers));
        
        });

        it("should return token/identifier", function() {

            var mock = SocketMock();

            var command = Commands.Command('test', function(response, arg) {
                    response.sendMessage('___');
                });
            
            var s = SocketServer({'socket': mock, 'commands': [command]});

            var client = SocketMock();
            mock.call('connection', client);

            client.call('data', {'cmd': 'test', 'token': 42});
            expect(client.emit).toHaveBeenCalledWith('data', jasmine.objectContaining({'token':42}));

        });

    });

});