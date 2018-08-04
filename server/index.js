const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const p2 = require('p2');

app.use('/js', express.static(__dirname + '/js'));
app.use('/assets', express.static(__dirname + '/assets'));

let lastPlayerID = 0;
const world = new p2.World({
    gravity: [0, 40],
});

const groundBody = new p2.Body({
    mass: 0,
});

/*const groundShape = new p2.Box({ width: 500, height: 20 });
groundBody.addShape(groundShape);
groundBody.position[1] = 200;
groundBody.angle = 20;
world.addBody(groundBody);*/

const amt = 100;
const path = generate((i) => {
    return [
        Math.cos(Math.PI/30 * i) * 40 + 50,
        i * 5,
    ];
}, amt);
const path2 = generate((i) => {
    return [
        Math.cos(Math.PI/30 * i) * 40 + 400,
        i * 5,
    ];
}, amt);
const firstPath = path;
const secondPath = path2;

registerPath(firstPath);
registerPath(secondPath);

function registerPath (path) {
    for (let i = 1; i < path.length-1; i++) {
        let [x1, y1] = path[i-1];
        let [x2, y2] = path[i];
        const magnitude = Math.sqrt((y2-y1)*(y2-y1) + (x2-x1)*(x2-x1));
        const lineBody = new p2.Body({
            mass: 0,
        });
        const line = new p2.Box({ width: magnitude, height: 1 });
        lineBody.addShape(line);
        lineBody.position = [(x1+x2)/2, (y1+y2)/2];
        lineBody.immovable = true;
        lineBody.rotation = (Math.atan((y2-y1) / (x2-x1)) * (180/Math.PI));
        world.addBody(lineBody);
    }
}

function generate (fn, num) {
    let out = [];
    for (let i = 0; i < num; i++) {
        out[i] = fn(i);
    }
    return out;
}

const playerBodies = {};

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

function expand (arr, amt) {
    let out = []
    let start = 0;
    let end = 100;
    for (let i = start; i < end; i++) {
        const x = arr[i][0];//Math.cos(Math.PI/30*i) * 40 + 20;
        const y = arr[i][1];//i * 5;

        if (i == start) {
            let x2 = arr[i+1][0];
            let y2 = arr[i+1][1];
            let v2 = [x2 -x, y2 - y];
            let mag2 = v2[0]*v2[0] + v2[1]*v2[1];
            let v3 = [-v2[1]/mag2, v2[2]/mag2];
            out.push([x+v3[0]*amt, y+v3[1]*amt])
        } else if (i == end-1) {
            let x0 = arr[i-1][0];
            let y0 = arr[i-1][1];
            let v0 = [x - x0, y - y0];
            let mag0 = v0[0]*v0[0] + v0[1]*v0[1];
            let v3 = [-v0[1]/mag0, v0[2]/mag0];
            out.push([x+v3[0]*amt, y+v3[1]*amt])
        } else {
            let x2 = arr[i+1][0];
            let y2 = arr[i+1][1];
            let v2 = [x2 - x, y2 - y];
            let mag2 = v2[0]*v2[0] + v2[1]*v2[1];

            let x0 = arr[i-1][0];
            let y0 = arr[i-1][1];
            let v0 = [x - x0, y - y0];
            let mag0 = v0[0]*v0[0] + v0[1]*v0[1];

            let v3r = [-v2[1]/mag2, v2[2]/mag2];
            let v3l = [-v0[1]/mag0, v0[2]/mag0];

            let v3 = [-v0[1]/mag0/2 - v2[1]/mag2/2,
                    v0[0]/mag0/2 + v2[0]/mag2/2];

            out.push([x+v3[0]*amt, y+v3[1]*amt])
        }
    }
    return out;
};

io.on('connection', function (socket) {
    socket.on('newplayer', function() {
        const body = new p2.Body({
            mass: 1,
            position: [200, 0],
        });
        body.addShape(new p2.Box({ width: 100, height: 100 }));
        playerBodies[lastPlayerID] = body;

        world.addBody(body);

        socket.player = {
            id: lastPlayerID++,
            x: 200,
            y: 0,
        };

        socket.emit('allplayers', getAllPlayers());
        socket.emit('boundary', firstPath);
        socket.emit('boundary', secondPath);
        socket.broadcast.emit('newplayer', socket.player);

        socket.on('move', function (data) {
            const playerBody = playerBodies[socket.player.id];
            if (data.left.isDown) {
                playerBody.velocity[0] = -100;
            } else if (data.right.isDown) {
                playerBody.velocity[0] = 100;
            }
            if (data.up.isDown) {
                playerBody.velocity[1] = -100;
            } else if (data.down.isDown) {
                playerBody.velocity[1] = 100;
            }
        });

        socket.on('disconnect', function () {
            io.emit('remove', socket.player.id);
        });
    });

    const timeStep = 1 / 30;

    setInterval(function () {
        world.step(timeStep);
        socket.emit('timestep', timestep());
    }, 1000 * timeStep);
});

function getAllPlayers () {
    let players = [];
    Object.keys(io.sockets.connected).forEach(function (socketID) {
        const player = io.sockets.connected[socketID].player;
        if (player) {
            player.x = playerBodies[player.id].position[0];
            player.y = playerBodies[player.id].position[1];
            players.push(player);
        }
    });
    return players;
}

function timestep () {
    let players = [];
    Object.keys(io.sockets.connected).forEach(function (socketID) {
        const player = io.sockets.connected[socketID].player;
        if (player) {
            player.x = playerBodies[player.id].position[0];
            player.y = playerBodies[player.id].position[1];
            players.push(player);
        }
    });
    return players;
}

http.listen(3000, function () {
    console.log('listening on *:3000');
});
