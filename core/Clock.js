define(function(require, exports, module) {
    var EventHandler = require('famous/core/EventHandler');
    var EventMapper = require('famous/events/EventMapper');

    var streams = [];
    var add = [];
    var sub = [];

    var Clock = {};

    var eventInput = new EventHandler();
    var eventOutput = new EventHandler();
    EventHandler.setOutputHandler(Clock, eventOutput);

    eventInput.on('tick', function(){
        var i;

        while (add.length)
            streams.push(add.shift());

        while (sub.length){
            var index = streams.indexOf(sub.pop());
            streams.splice(index, 1);
        }

        for (i = 0; i < streams.length; i++)
            streams[i].update();
    }.bind(this));

    eventInput.on('start', function(data){
        var stream = data.stream;
        Clock.register(stream);
        eventOutput.emit('dirty');
    }.bind(this));

    eventInput.on('end', function(data){
        var stream = data.stream;
        Clock.unregister(stream);
        eventOutput.emit('clean');
    }.bind(this));

    Clock.register = function(stream){
        add.push(stream);
    };

    Clock.unregister = function(stream){
        sub.push(stream);
    };

    Clock.subscribeEngine = function(engine){
        eventInput.subscribe(engine, ['tick']);
    };

    Clock.subscribe = function(stream){
        var mapper = new EventMapper(function(data){
            if (data === undefined) data = {};
            data.stream = stream;
            return data;
        });
        mapper.subscribe(stream);
        eventInput.subscribe(mapper)
    };

    Clock.unsubscribe = function(stream){
        //TODO
    };

    module.exports = Clock;
});