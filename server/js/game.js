const Game = {};

Game.init = function () {
    game.stage.disableVisibilityChange = true;
}

Game.preload = function () {
    game.load.image('person', 'assets/person.png');
}

Game.addNewPlayer = function (id, x, y) {
    let person = game.add.sprite(200, 600, 'person');
    person.scale.setTo(.2);
    Game.playerMap[id] = person;
};

Game.removePlayer = function (id) {
    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
};

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

function generate (fn, num) {
    let out = [];
    for (let i = 0; i < num; i++) {
        out[i] = fn(i);
    }
    return out;
}

function addPath (path) {
    console.log(path);
    for (let i = 1; i < path.length; i++) {
        let [x1, y1] = path[i-1];
        let [x2, y2] = path[i];
        const magnitude = Math.sqrt((y2-y1)*(y2-y1) + (x2-x1)*(x2-x1));
        var randomSprite = game.add.sprite((x1+x2)/2, (y1+y2)/2);
        /*randomSprite.anchor.setTo(0.5, 0.5);
        randomSprite.width = magnitude;
        randomSprite.height = 1;
        randomSprite.angle = Math.atan((y2-y1) / (x2-x1))/(180*Math.PI);*/
        game.physics.p2.enable(randomSprite, true);
        randomSprite.body.addRectangle(magnitude, 1);
        randomSprite.body.static = true;
        randomSprite.body.rotation = Math.atan((y2-y1) / (x2-x1));
    }
}

Game.create = function () {
    Game.playerMap = {};

    game.stage.backgroundColor = 'fff';

    //  Our world size is 1600 x 1200 pixels
    //game.world.setBounds(0, 0, 1600, 1200);

    //  Enable P2 and it will use the updated world size
    game.physics.startSystem(Phaser.Physics.P2JS);

    cursors = game.input.keyboard.createCursorKeys();

    let amt = 100;
    let path = generate((i)=>{return [
        Math.cos(Math.PI/30*i) * 40 + 200,
        i * 5];
    }, amt);

    Client.askNewPlayer();
};

Game.update = function () {
    if (cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown) {
        const left = {
            isDown: cursors.left.isDown,
        };
        const right = {
            isDown: cursors.right.isDown,
        };
        const up = {
            isDown: cursors.up.isDown,
        };
        const down = {
            isDown: cursors.down.isDown,
        };
        Client.socket.emit('move', { left, right, up, down });
    }
};

Game.timestep = function (data) {
    for (const player of data) {
        if (!Game.playerMap || !(player.id.toString() in Game.playerMap)) {
            return;
        }
        const playerSprite = Game.playerMap[player.id];
        playerSprite.x = player.x;
        playerSprite.y = player.y;
    }
};

Game.addBoundary = function (data) {
    addPath(data);
}

const game = new Phaser.Game(800, 600, Phaser.CANVAS, 'made-in-abyss', Game);
game.state.add('Game', Game);
game.state.start('Game');
