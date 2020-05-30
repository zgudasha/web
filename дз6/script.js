let canvas, context, idTimer, figures, speed = 2;

const minSize = 5, maxSize = 25, n = 150;

// получение розового цвета
function getColor() {
    let color = () => {return 110 + Math.floor(Math.random()*(170 - 110))};
    return 'rgb(' + '255' + ', ' + color() + ', ' + color() + ')';
}


// главный класс, от которого наследуются все фигуры
class Figure {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = getColor();
        this.size = Math.floor(minSize + Math.floor(Math.random() * maxSize));
        this.dir = Math.floor(Math.random() * 4);
    }
}

class Ball extends Figure {
    draw(context) {
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, 2 * Math.PI, false);
        context.closePath();
        context.fill();
    }
}

class Square extends Figure {
    draw(context) {
        context.fillStyle = this.color;
        context.beginPath();
        context.moveTo(this.x - this.size / 2, this.y - this.size / 2);
        context.lineTo(this.x + this.size / 2, this.y - this.size / 2);
        context.lineTo(this.x + this.size / 2, this.y + this.size / 2);
        context.lineTo(this.x - this.size / 2, this.y + this.size / 2);
        context.lineTo(this.x - this.size / 2, this.y - this.size / 2);
        context.closePath();
        context.fill();
    }
    getAngles() {
        let angles = [
            [this.x + this.size / 2, this.y + this.size / 2],
            [this.x - this.size / 2, this.y - this.size / 2],
            [this.x + this.size / 2, this.y - this.size / 2],
            [this.x - this.size / 2, this.y + this.size / 2]
        ];
        return angles;
    }
}

class Triangle extends Figure {
    draw(context) {
        context.fillStyle = this.color;
        context.beginPath();
        context.moveTo(this.x - this.size, this.y + this.size);
        context.lineTo(this.x + this.size, this.y + this.size);
        context.lineTo(this.x, this.y - this.size);
        context.closePath();
        context.fill();
    }
    getAngles() {
        let angles = [
            [this.x - this.size, this.y + this.size],
            [this.x + this.size, this.y + this.size],
            [this.x, this.y - this.size]
        ];
        return angles;
    }
}

function drawBack(context, w, h) {
    context.save();
    context.fillStyle = 'rgb(255, 226, 226)';
    context.fillRect(0, 0, w, h);
    context.restore();
}

// запускается во время загрузки страницы
function init() {
    canvas = document.getElementById('canvas');
    if (canvas.getContext) {
        context = canvas.getContext('2d');
        drawBack(context, canvas.width, canvas.height);
        figures = [];
        for (let i = 0; i < 10; i++) {
            let index = Math.floor(Math.random() * 3);
            let x = minSize + Math.floor(Math.random() * (canvas.width - (maxSize + minSize)));
            let y = minSize + Math.floor(Math.random() * (canvas.height - (maxSize + minSize)));
            let item = new [Ball, Triangle, Square][index](x, y);
            item.draw(context);
            figures.push(item);
        }
    }
}

// добавление фигур по клику
function goInput(event) {
    let index = Math.floor(Math.random() * 3);
    let item = new [Ball, Triangle, Square][index](event.clientX, event.clientY);
    item.draw(context);
    figures.push(item);
}

// изменение скорости
function changeSpeed(step) {
    if (speed <= 0) {
        clearInterval(idTimer);
        return;
    }
    if (speed >= 10) {
        return;
    }
    speed += step;
}

function hypotenuse(k1, k2) {
    return Math.floor(Math.sqrt(Math.pow(k1, 2) + Math.pow(k2, 2)));
}

// лежит ли точка в фигуре
function inPoly(poly, x, y) {
    check = 0;
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

// проверка всех столкновений
function collision(figure) {
    for (let i = 0; i < figures.length; i++) {
        if (figures[i] != figure) {
            let opponent = figures[i];
            if (opponent instanceof Ball && figure instanceof Ball) {
                let k1 = figure.x - opponent.x,
                    k2 = figure.y - opponent.y;
                let distance = hypotenuse(k1, k2);
                let sumOfRadius = opponent.size + figure.size;
                if (distance <= sumOfRadius) {
                    figures.splice(figures.indexOf(figure, 0), 1);
                    figures.splice(figures.indexOf(opponent, 0), 1);
                    return true;
                }
            } else if (
                !(opponent instanceof Ball) && !(figure instanceof Ball)
            ) {
                let [pointsFigure, pointsOpponent] = [figure.getAngles(), opponent.getAngles()];
                for (let point of pointsFigure) {
                    if (inPoly(pointsOpponent, point[0], point[1])) {
                        figures.splice(figures.indexOf(figure), 1);
                        figures.splice(figures.indexOf(opponent), 1);
                        return true;
                    }
                }
            } else {
                let ball = opponent,
                    poly = figure;
                if (figure instanceof Ball) {
                    [ball, poly] = [figure, opponent];
                }
                let pointsOfpoly = poly.getAngles();
                
                let distance = hypotenuse(pointsOfpoly[0][0] - ball.x, pointsOfpoly[0][1] - ball.y);
                for (let i = 0; i < pointsOfpoly.length; i++) {
                    let tmp = hypotenuse(pointsOfpoly[i][0] - ball.x, pointsOfpoly[i][1] - ball.y);
                    distance = tmp < distance ? tmp : distance;
                }
                if (ball.size >= distance || inPoly(pointsOfpoly, ball.x, ball.y)) {
                    figures.splice(figures.indexOf(poly), 1);
                    figures.splice(figures.indexOf(ball), 1);
                    return true;
                }
            }
        }
    }
}


function moveFigure(dir) {
    if (figures.length) {
        drawBack(context, canvas.width, canvas.height);
        for (let i = 0; i < figures.length;) {
            let x = figures[i].x, y = figures[i].y;
            
            if (dir == 4) {
                dir = Math.floor(Math.random() * 4);
            }
            
            if (dir == 0 || dir == undefined && figures[i].dir == 0) {
                x += Math.floor(Math.random() * 4) - 2;
                y += Math.floor(Math.random() * 2) - speed;
            } else if (dir == 1 || dir == undefined && figures[i].dir == 1) {
                x += Math.floor(Math.random() * 4) - 2;
                y += Math.floor(Math.random() * 2) + speed;
            } else if (dir == 2 || dir == undefined && figures[i].dir == 2) {
                x += Math.floor(Math.random() * 2) - speed;
                y += Math.floor(Math.random() * 4) - 2;
            } else if (dir == 3 || dir == undefined && figures[i].dir == 3) {
                x += Math.floor(Math.random() * 2) + speed;
                y += Math.floor(Math.random() * 4) - 2;
            }

            figures[i].x = x;
            figures[i].y = y;
            figures[i].size += 0.5;
            if (figures[i].size >= n) {
                figures.splice(i, 1);
                continue;
            }
            figures[i].draw(context);

            if (!collision(figures[i])) {
                if ((x > canvas.width) || (x < 0) || (y < 0) || (y > canvas.height)) {
                    figures.splice(i, 1);
                } else {
                    i++;
                }
            }
        }
    } else {
        drawBack(context, canvas.width, canvas.height);
        clearInterval(idTimer);
    }
}

// запуск движения
function move(dir) {
    clearInterval(idTimer);
    // выбираем напавление для начала движения для каждой фигуры
    for (let i = 0; dir == undefined && i < figures.length; i++) {
        figures[i].dir = Math.floor(Math.random() * 4);
    }
    // каждый 50мс запускается moveFigure
    idTimer = setInterval(moveFigure, 50, dir);
}