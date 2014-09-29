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

        it("should receive data", function() {

            var mock = SocketMock();
            var c = Client(mock);
            var spy = jasmine.createSpy('receiveCallback');
            c.receive(spy);
            var obj = {'hello': 'world'};

            mock.call('connect');
            mock.call('data', obj)

            expect(spy).toHaveBeenCalledWith(obj);

        });

    });

    describe("Server", function() {

        it("should respond 'ping' with a 'pong'", function() {

            var mock = SocketMock();
            var clientMock = SocketMock();
            var s = SocketServer({'socket': mock});

            mock.call('connection', clientMock);

            clientMock.call('data', {'cmd':'ping'});
            expect(clientMock.emit).toHaveBeenCalledWith('data', jasmine.objectContaining({'cmd':'pong'}));

        });

        it("should send 'message's to other connected clients", function() {

            var mock = SocketMock();
            var client1 = SocketMock();
            var client2 = SocketMock();
            var client3 = SocketMock();
            var s = SocketServer({'socket': mock});

            mock.call('connection', client1);
            mock.call('connection', client2);
            mock.call('connection', client3);

            var message = {'cmd':'message', 'arg': 'hello all'};
            var toOthers = {'cmd':'message', 'arg': 'someone: hello all'};
            var toSelf = {'cmd':'message', 'arg': 'you: hello all'};

            client2.call('data', message);
            expect(client1.emit).toHaveBeenCalledWith('data', jasmine.objectContaining(toOthers));
            expect(client2.emit).toHaveBeenCalledWith('data', jasmine.objectContaining(toSelf));
            expect(client3.emit).toHaveBeenCalledWith('data', jasmine.objectContaining(toOthers));
        
        });

        it("should respond to 'uptime'", function() {

            var time = 10;
            var mock = SocketMock();
            var s = SocketServer({'socket': mock, 'timer': function() { return time; }});

            time = 30;
            var client = SocketMock();
            mock.call('connection', client);

            time = 70;
            client.call('data', {'cmd': 'uptime'});

            var message = {'cmd':'message', 'arg':60};
            expect(client.emit).toHaveBeenCalledWith('data', jasmine.objectContaining(message));

        });

        it("should return token/identifier", function() {

            var mock = SocketMock();
            var s = SocketServer({'socket': mock});

            var client = SocketMock();
            mock.call('connection', client);

            client.call('data', {'cmd': 'ping', 'token': 42});
            expect(client.emit).toHaveBeenCalledWith('data', jasmine.objectContaining({'token':42}));

        });

    });

});