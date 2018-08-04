var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'made-in-abyss', { preload: preload, create: create, update: update });

function preload () {
    game.load.image('person', 'assets/person.png');
}

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
            let v2 = [x2 - x, y2 - y];
            let mag2 = Math.sqrt(v2[0]*v2[0] + v2[1]*v2[1]);
            let v3 = [-v2[1]/mag2, v2[2]/mag2];

            out.push([x+v3[0]*amt, y+v3[1]*amt])
        }
        else if (i == end-1) {
            let x0 = arr[i-1][0];
            let y0 = arr[i-1][1];
            let v0 = [x - x0, y - y0];
            let mag0 = Math.sqrt(v0[0]*v0[0] + v0[1]*v0[1]);
            let v3 = [-v0[1]/mag0, v0[2]/mag0];



            out.push([x+v3[0]*amt, y+v3[1]*amt])
        }
        else {
            let x2 = arr[i+1][0];
            let y2 = arr[i+1][1];
            let v2 = [x2 - x, y2 - y];
            let mag2 = Math.sqrt(v2[0]*v2[0] + v2[1]*v2[1]);

            let x0 = arr[i-1][0];
            let y0 = arr[i-1][1];
            let v0 = [x - x0, y - y0];
            let mag0 = Math.sqrt(v0[0]*v0[0] + v0[1]*v0[1]);

            //let d02 = Math.sqrt((x2-x0)*(x2-x0) + (x2-x))
            let vl = [-v0[1]/mag0, v0[0]/mag0];
            let vr = [-v2[1]/mag2, v2[0]/mag2];
            let v3 = [vl[0]+vr[0], vl[1]+vr[1]];
            let mag3 = Math.sqrt(v3[0]*v3[0] + v3[1]*v3[1]);


            out.push([x+v3[0]/mag3*amt, y+v3[1]/mag3*amt])
        }
    }
    return smoothPath(out);
};
function generate(fn, num) {
    let out = [];
    for(let i = 0; i < num; i++) {
        out[i] = fn(i);
    }
    return out;
}
function addPath(path) {
    console.log(path);
    for (let i = 1; i < path.length; i++) {
        let [x1, y1] = path[i-1];
        let [x2, y2] = path[i];

        const magnitude = Math.sqrt((y2-y1)*(y2-y1) + (x2-x1)*(x2-x1));
        var randomSprite = game.add.sprite((x1+x2)/2, (y1+y2)/2);
        game.physics.p2.enable(randomSprite, true);
        randomSprite.body.addRectangle(magnitude, 1);
        randomSprite.body.static = true;
        randomSprite.body.rotation = Math.atan((y2-y1) / (x2-x1));
    }
}



function create () {
    game.stage.backgroundColor = "fff";

    //  Our world size is 1600 x 1200 pixels
    //game.world.setBounds(0, 0, 1600, 1200);

    //  Enable P2 and it will use the updated world size
    game.physics.startSystem(Phaser.Physics.P2JS);

    person = game.add.sprite(200, 600, 'person');
    person.scale.setTo(.2);
    game.physics.p2.enable(person, true);
    cursors = game.input.keyboard.createCursorKeys();

    /*var line = game.add.sprite(100, 5);
    game.physics.p2.enable(line, true);
    line.body.addRectangle(100, 1);*/
    let amt = 100;
    let path = generate((i)=>{return [
        Math.cos(Math.PI/30*i) * 100 + 200,
        i * 5]
    }, amt);
    addPath(path);
    let path2 = generate((i)=>{return [
        Math.cos(Math.PI/30*i) * 100 + 500,
        i * 5]
    }, amt);
    addPath(path2);
}

function update() {
    person.body.setZeroVelocity();
    if (cursors.left.isDown) {
        person.body.moveLeft(200);
    } else if (cursors.right.isDown) {
        person.body.moveRight(200);
    }
    if (cursors.up.isDown) {
        person.body.moveUp(200);
    } else if (cursors.down.isDown) {
        person.body.moveDown(200);
    }
}
