$(document).ready(function() {

    var client = Client(io());
    
    Console.attach(
        Console.create($('#console')),
        client
    );

    MainView($('#main'));

});
