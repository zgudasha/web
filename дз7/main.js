const white = 'rgba(255,255,255, 1)',
      black = '#e89297',
      degToRad = Math.PI / 180,
      resistance = 0.05,
      gravity = -0.35,
      minParameter = 15,
      maxParameter = 25,
      maxSpeed = 8,
      maxCount = 5,
      maxLives = 8;

let canvas,
    context,
    idTimer,
    reloadingTimer,
    gun,
    bullet,
    player,
    lastShot = Date.now(),
    angle = -45 * degToRad,
    types = {
        gun: {parameter: 20, reloadingTime: 1000},
        chopper: {parameter: 5, reloadingTime: 200}
    },
    active,
    heart = new Image(200, 200),
    skull = new Image(595, 595);

class Player {
    constructor(name) {
        this.name = (name === '') ? "Name" : name;
        this.level = 1;
        this.score = 0;
        this.lives = 5;
        this.countOfEnemies = 1;
        this.speed = 2;
        this.enemies = [];
        this.figures = [];
    }

    draw() {
        this.drawLevel();
        this.drawScore();
        this.drawLives();
        this.drawName();
    }

    drawLives() {
        if (this.lives) {
            let divLives = document.getElementsByClassName("lives")[0];
            divLives.innerHTML = '';
            for (let i = 0; i < this.lives; i++) {
                let live = document.createElement('img', );
                live.setAttribute('src', 'half-heart.png');
                divLives.appendChild(live);
            }
        } else {
            stop(idTimer);
            for (let key in localStorage) {
                if (localStorage.length <= 5) {
                    break;
                }
                localStorage.removeItem(key);
            }
            localStorage.setItem(this.name, [this.level, this.score].join(' '))
            drawTable();
            this.dropStat();
        }
    }

    drawScore() {
        document.getElementById('score').innerHTML = String(this.score);
    }

    drawLevel() {
        let levelDigit = document.getElementById('level-digit');
        levelDigit.innerHTML = String(this.level);
    }

    drawName() {
        document.getElementById('name').innerHTML = this.name;
    }

    dropStat() {
        this.level = 1;
        this.lives = 5;
        this.score = 0;
        this.speed = 2;
        this.countOfEnemies = 1;
        this.enemies = [];
        this.figures = [];
        createEnemies();
        stop(idTimer);
        this.draw();
        drawBack();
        gun.draw();
    }
}

class Gun {
    constructor() {
        this.width = 50;
        this.height = 50;
        this.color = black;
        this.x = -15;
        this.y = 0;
    }
    draw() {
        context.fillStyle = this.color;
        context.rotate(angle);
        context.beginPath();
        context.rect(this.x, this.y, this.width, this.height);
        context.closePath();
        context.rotate(-angle);
        context.fill();
    }
}

class Bullet {
    constructor(offsetX, offsetY) {
        this.parameter = types[active.value]["parameter"];
        this.color = black;
        this.x = 0;
        this.y = 0;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }
    draw() {
        context.fillStyle = black;
        context.beginPath();
        context.arc(this.x, this.y, this.parameter, 0, 2 * Math.PI, false);
        context.closePath();
        context.fill();
    }
}

class Enemy {
    constructor() {
        this.color = Enemy.getRandomColor();
        this.parameter = Math.max(minParameter, Enemy.getRandomParameter() / player.level);
        [this.x, this.y] = Enemy.getRandomCoords();
    }

    static getRandomCoords() {
        let x = canvas.width + Math.floor(Math.random() * 100),
            y = Math.floor(Math.random() * canvas.height);
        return [x, y];
    }

    static getRandomColor() {
        let color = () => {return 110 + Math.floor(Math.random()*(170 - 110))};
        return 'rgb(' + '255' + ', ' + color() + ', ' + color() + ')';
    }

    static getRandomParameter() {
        return Math.floor(minParameter + Math.floor(Math.random() * maxParameter));
    }
}

class EnemyBall extends Enemy {
    draw() {
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x, this.y, this.parameter, 0, 2 * Math.PI, false);
        context.closePath();
        context.fill();
    }
}

class EnemySquare extends Enemy {
    draw() {
        context.fillStyle = this.color;
        context.beginPath();
        let [x, y, parameter] = [this.x, this.y, this.parameter];
        context.moveTo(x - parameter / 2, y - parameter / 2)
        context.lineTo(x + parameter / 2, y - parameter / 2)
        context.lineTo(x + parameter / 2, y + parameter / 2)
        context.lineTo(x - parameter / 2, y + parameter / 2)
        context.lineTo(x - parameter / 2, y - parameter / 2)
        context.closePath();
        context.fill();
    }
    getPoints() {
        let [x, y, parameter] = [this.x, this.y, this.parameter];
        let points = [
            [x + parameter / 2, y + parameter / 2],
            [x - parameter / 2, y - parameter / 2],
            [x + parameter / 2, y - parameter / 2],
            [x - parameter / 2, y + parameter / 2]
        ];
        return points;
    }
}

class EnemyTriangle extends Enemy {
    draw() {
        context.fillStyle = this.color;
        context.beginPath();
        let [x, y, parameter] = [this.x, this.y, this.parameter];
        context.moveTo(x - parameter, y + parameter);
        context.lineTo(x + parameter, y + parameter);
        context.lineTo(x, y - parameter);
        context.closePath();
        context.fill();
    }
    getPoints() {
        let [x, y, parameter] = [this.x, this.y, this.parameter];
        let points = [
            [x - parameter, y + parameter],
            [x + parameter, y + parameter],
            [x, y - parameter]
        ];
        return points;
    }
}

class EnemyHeart extends EnemySquare {
    constructor() {
        super();
        this.parameter = 25;
    }
    draw() {
        context.beginPath();
        heart.src = 'heart.png';
        context.drawImage(heart, this.x - this.parameter, this.y - this.parameter, 50, 50);
        context.closePath();
    }
}

class EnemySkull extends EnemySquare {
    constructor() {
        super();
        this.parameter = 25;
    }
    draw() {
        context.beginPath();
        skull.src = 'skull.png';
        context.drawImage(skull, this.x - this.parameter, this.y - this.parameter, 50, 50);
        context.closePath();
    }
}

let classesOfEnemies = [
    EnemyBall,
    EnemySquare,
    EnemyTriangle,
];

function getRandomEnemy() {
    let index = Math.floor(Math.random() * classesOfEnemies.length);
    return new classesOfEnemies[index]();
}

function drawBack() {
    context.save();
    context.fillStyle = white;
    context.beginPath();
    context.rect(0, 0, canvas.width, canvas.height);
    context.closePath();
    context.fill();
}

function drawTable() {
    stop(idTimer);
    document.getElementById('game').classList.add('disabled');
    document.getElementById('welcome').classList.add('disabled');
    document.getElementById('results').classList.remove('disabled');
    if (player) {
        document.getElementById('continue').classList.remove('disabled');
        document.getElementById('continue').value = "Continue as " + player.name;
    } else {
        document.getElementById('continue').classList.add('disabled');
    }
    let table = document.getElementById('table');
    table.innerHTML = '';
    let trTitle = document.createElement('tr');
    trTitle.style.backgroundColor = '#e7e7e7';
    for (let title of ['name', 'level', 'score']) {
        let tdTitle = document.createElement('td'),
            tdNode = document.createTextNode(title);
        tdTitle.appendChild(tdNode);
        trTitle.appendChild(tdTitle);
    }
    table.appendChild(trTitle);

    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            let tr = document.createElement('tr'),
                data = localStorage[key].split(' ');

            let playerNameTD = document.createElement('td'),
                playerNameTN = document.createTextNode(key);
            playerNameTD.appendChild(playerNameTN);
            tr.appendChild(playerNameTD);
            table.appendChild(tr);

            for (let element of data) {
                let td = document.createElement('td'),
                    tn = document.createTextNode(element);
                td.appendChild(tn);
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
    }
}

function createEnemies() {
    for (let i = 0; i < player.countOfEnemies; i++) {
        let enemy = getRandomEnemy();
        player.enemies.push(enemy);
        player.figures.push(enemy);
    }
    let heart = new EnemyHeart();
    player.enemies.push(heart);
    player.figures.push(heart);
    if (!(player.level % 5)) {
        let skull = new EnemySkull();
        player.figures.push(skull);
        player.enemies.push(skull);
    }
}

function init() {
    canvas = document.getElementById('canvas');
    active = document.getElementById('gun');
    if (canvas.getContext) {
        context = canvas.getContext('2d');
        context.transform(1, 0, 0, -1, 0, canvas.height);
        gun = new Gun();
        gun.draw();
    }
}

function newGame() {
    player = undefined;
    document.getElementById('results').classList.add('disabled');
    document.getElementById('welcome').classList.remove('disabled');
    gun.draw();
}

function restart() {
    player.dropStat();
}

function continueCurrent() {
    document.getElementById('results').classList.add('disabled');
    document.getElementById('game').classList.remove('disabled');
    player.draw();
}

function start() {
    document.getElementById('welcome').classList.add('disabled');
    document.getElementById('game').classList.remove('disabled');
    player = new Player(document.getElementById("playerName").value);
    player.draw();
    createEnemies();
}

function getEventCoords(event) {
    return [event.clientX - canvas.offsetLeft, event.clientY - canvas.height];
}

function mouseMove(event) {
    let [x, y] = getEventCoords(event);
    angle = -Math.acos(-y / Math.sqrt(Math.pow(y, 2) + Math.pow(x, 2)));
}

function mouseClick() {
    let shot = Date.now();
    if (shot - lastShot >= types[active.value]["reloadingTime"]) {
        stop(reloadingTimer);
        lastShot = shot;
        let offsetX = -Math.sin(angle) * canvas.width / 24;
        let offsetY = Math.cos(angle) * canvas.height / 24;
        bullet = new Bullet(offsetX, offsetY);
        player.figures.push(bullet);

        let t = types[active.value]["reloadingTime"] / 1000,
            diff = t / 10;
        reloadingTimer = setInterval(() => {
            if (t <= 0.1) {
                active.nextElementSibling.innerHTML = 'OK';
                stop(reloadingTimer);
                return;
            }
            t -= diff;
            active.nextElementSibling.innerHTML = String(t.toFixed(1));
        }, t * 100);
    }
}

function changeGun(event) {
    active = event.currentTarget;
}

function hypotenuse(k1, k2) {
    return Math.floor(Math.sqrt(Math.pow(k1, 2) + Math.pow(k2, 2)));
}

function inPoly(poly, x, y) {
    let check = 0;
    x = Math.floor(x);
    y = Math.floor(y);

    let xp = [], yp = [];
    for (let point of poly) {
        xp.push(point[0]);
        yp.push(point[1]);
    }
    let npol = xp.length;

    for (i = 0, j = npol - 1; i < npol;i++){
        if ((((yp[i]<=y) && (y<yp[j])) || ((yp[j]<=y) && (y<yp[i]))) &&
            (x > (xp[j] - xp[i]) * (y - yp[i]) / (yp[j] - yp[i]) + xp[i])) {
            check = !check
        }
        j = i;
    }
    return check;
}

function collision(bullet) {
    for (let i = 0; i < player.enemies.length; i++) {
        let enemy = player.enemies[i];
        if (enemy instanceof EnemyBall) {
            let k1 = bullet.x - enemy.x,
                k2 = bullet.y - enemy.y;
            let distance = hypotenuse(k1, k2);
            let sumOfRadius = enemy.parameter + bullet.parameter;
            if (distance <= sumOfRadius) {
                player.figures.splice(player.figures.indexOf(enemy), 1);
                player.figures.splice(player.figures.indexOf(bullet), 1);
                player.enemies.splice(i, 1);
                return true;
            }
        } else {
            let pointsOfPoly = enemy.getPoints();
            let distance = hypotenuse(pointsOfPoly[0][0] - bullet.x, pointsOfPoly[0][1] - bullet.x);
            for (let i = 0; i < pointsOfPoly.length; i++) {
                let tmp = hypotenuse(pointsOfPoly[i][0] - bullet.x, pointsOfPoly[i][1] - bullet.y);
                distance = tmp < distance ? tmp : distance;
            }
            if (bullet.parameter >= distance || inPoly(pointsOfPoly, bullet.x, bullet.y)) {
                if (enemy instanceof EnemyHeart) {
                    player.lives++;
                    player.lives = Math.min(maxLives, player.lives);
                    player.drawLives();
                }
                if (enemy instanceof EnemySkull) {
                    player.score += player.enemies.length;
                    for (let e of player.enemies) {
                        if (e instanceof EnemyHeart) {
                            player.lives++;
                            player.lives = Math.min(maxLives, player.lives);
                            player.drawLives();
                        }
                        player.figures.splice(player.figures.indexOf(e), 1);
                    }
                    player.enemies = [];
                    player.drawScore();
                }
                player.figures.splice(player.figures.indexOf(enemy), 1);
                player.figures.splice(player.figures.indexOf(bullet), 1);
                player.enemies.splice(i, 1);
                return true;
            }
        }
    }
    return false;
}

function move() {
    stop(idTimer);
    idTimer = setInterval(() => {
        drawBack();
        gun.draw();
        if (!player.enemies.length) {
            player.level++;
            createEnemies();
            player.countOfEnemies++;
            player.countOfEnemies = Math.min(maxCount, player.countOfEnemies);
            player.speed += 0.5;
            player.drawLevel();
        }
        for (let i = 0; i < player.figures.length; i) {
            if (player.figures[i] instanceof Bullet) {
                player.figures[i].x += player.figures[i].offsetX;
                player.figures[i].y += player.figures[i].offsetY;
                player.figures[i].offsetX = Math.max(0, player.figures[i].offsetX - resistance);
                player.figures[i].offsetY = Math.min(canvas.height, player.figures[i].offsetY + gravity);
                player.figures[i].draw();
                if (player.figures[i].x >= canvas.width || player.figures[i].y < 0) {
                    player.figures.splice(i, 1);
                } else if (collision(player.figures[i])) {
                    player.score++;
                    player.drawScore();
                    if (i) {
                        i--;
                    }
                } else {
                    i++;
                }
            }
            if (player.figures[i] instanceof Enemy) {
                player.figures[i].x -= Math.min(maxSpeed, player.speed);
                player.figures[i].draw();
                if (player.figures[i].x <= 0) {
                    player.figures.splice(i, 1);
                    player.enemies.splice(player.enemies.indexOf(player.figures[i]), 1);
                    player.lives--;
                    player.drawLives();
                } else {
                    i++;
                }
            }
        }
    }, 24)
}

function stop(timer) {
    clearInterval(timer);
}
