var Client = {};
Client.socket = io.connect(undefined, {'force new connection': true, 'multiplex': false});

Client.askNewPlayer = function () {
    Client.socket.emit('newplayer');
};

Client.socket.on('newplayer', function (data) {
    Game.addNewPlayer(data.id, data.x, data.y);
});

Client.socket.on('allplayers', function (data) {
    for (let i = 0; i < data.length; i++) {
        Game.addNewPlayer(data[i].id, data[i].x, data[i].y);
    }
});

Client.socket.on('timestep', function (data) {
    Game.timestep(data);
});

Client.socket.on('remove', function (id) {
    Game.removePlayer(id);
});

Client.socket.on('boundary', function (data) {
    Game.addBoundary(data);
});
