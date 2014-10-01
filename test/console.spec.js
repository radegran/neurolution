describe("Console", function() {

    describe("Auto completion", function() {

        var scope = null;

        var verify = function(text, expected) {

            var list = Console.getTabCompletions(text, scope);

            for (var i = 0; i < expected.length; i++)
            {
                expect(list[i]).toBe(expected[i]);
            }

            expect(list.length).toBe(expected.length);

        };

        beforeEach(function() {

            scope = {
                'root1': {
                    'leaf1': {},
                    'leaf2': {}
                },
                'root2': {
                    'leaf': {}
                },
                'leafValue': 23,
                'BLAleafBLA': 42,
                'camera' : {
                    'position': {
                        'x': 10,
                        'y': 20,
                        'z': 40
                    }
                },
                'hasfunc' : {
                    'func': function() {},
                    'int': 5
                }
            };

        });

        it("should give no completions if no match", function() {

            verify('oot', []);

        });

        it("should give completions for root level", function() {

            verify('root', ['root1', 'root2']);

        });

        it("should give completions for leaf level", function() {

            verify('root1.le', ['root1.leaf1', 'root1.leaf2']);

        });

        it("should give completions for a completion", function() {

            verify('root1', ['root1.leaf1', 'root1.leaf2']);

        });

        it("should give same completion for completed leaf", function() {

            verify('root2.leaf', ['root2.leaf']);

        });

        it("should match with starting strings", function() {

            verify('leaf', ['leafValue']);

        });

        it("should give completions if ending with dot", function() {

            verify('camera.', ['camera.position']);

        });

        it("should give leaf completions if ending with dot", function() {

            verify('camera.position.', ['camera.position.x', 'camera.position.y', 'camera.position.z']);

        });

        it("should give '(' suffix on function completions", function() {

            verify('hasfunc', ['hasfunc.func(', 'hasfunc.int']);

        });

    });

});