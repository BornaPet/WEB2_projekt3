const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//konstante koje se koriste u programu. Sve duljine i visine
const PADDLE_WIDTH = 120;
const PADDLE_HEIGHT = 20;
const BALL_RADIUS = 10;
const BRICK_ROWS = 5;
const BRICK_COLUMNS = 10;
const BRICK_WIDTH = canvas.width / BRICK_COLUMNS;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 2;
const BALL_SPEED = 8;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let bricks = [];
let gameOver = false;
let winGame = false;
let isMovingLeft = false;
let isMovingRight = false;

//kreiram objekte loptica i donja ploča kako bi sve bilo na jednom mjestu. Tu se mogu mijenjati parametri
let ball = {
    x: canvas.width / 2,
    y: canvas.height - 45,
    dx: 4 * (Math.random() > 0.5 ? 1 : -1),
    dy: -(Math.random() * 2 + Math.random() * 10),
    radius: BALL_RADIUS,
    speed: BALL_SPEED
};
normalizeBallSpeed()
let paddle = {
    x: (canvas.width - PADDLE_WIDTH) / 2,
    y: canvas.height - PADDLE_HEIGHT - 10,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dx: 9
};

//Funkcija koja kreira cigle. Koristim konstane pomoći kojih kreiram određeni droj cigli.
function createBricks() {
    bricks = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
        bricks[r] = [];
        for (let c = 0; c < BRICK_COLUMNS; c++) {
            bricks[r][c] = { x: 0, y: 0, visible: true };
        }
    }
}
createBricks();
/*
    Funkcija za iscrtavanje cigli. Cigle koje smo prethodno stvorili kao elemente liste u funkciji createBricks()
    sada iscrtavam na ekran. Koristim konstante za njihovu veličinu i mijenjam im boje, te dodajem tamno sivu sjenu.
    Svaka cigla je na početku vidljiva.
*/
function drawBricks() {
    bricks.forEach((row, r) => {
        row.forEach((brick, c) => {
            if (brick.visible) {
                const brickX = c * (BRICK_WIDTH + BRICK_PADDING);
                const brickY = r * (BRICK_HEIGHT + BRICK_PADDING);
                brick.x = brickX;
                brick.y = brickY;
                ctx.save();
                ctx.fillStyle = 'red';
                ctx.shadowColor = '#636363';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 3;
                ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
                ctx.restore();
            }
        });
    });
}

/*
    Funkcija u kojoj crtam lopticu.
 */
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'yellow';
    ctx.fill();
    ctx.closePath();
}

/*
    Funkcija kojom crtam palicu i sjenčam je.
 */
function drawPaddle() {
    const gradient = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.height);
    gradient.addColorStop(0, 'rgba(255, 0, 0, 1)');
    gradient.addColorStop(0.5, 'rgba(200, 0, 0, 1)');
    gradient.addColorStop(1, 'rgba(100, 0, 0, 1)');
    ctx.save();
    ctx.fillStyle = gradient;
    ctx.shadowColor = '#636363';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.restore();
}
/*
    Funkcija za ispis rezultata u gornji desni kraj. Rezultat se ispisuje jedan ispod drugoga, poravnati udesno.
 */
function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'right';

    const padding = 20;
    const lineHeight = 20;
    ctx.fillText(`Score: ${score}`, canvas.width - padding, padding);
    ctx.fillText(`High Score: ${highScore}`, canvas.width - padding, padding + lineHeight);
}

/*
    Narednih nekoliko funkcija služi za pokretanej palice.
    Dodao sam dva listenera koji provjeravaju pritisak i odpuštanje tipki 'a' i 'd' te time mijenjaju stanje micanja lijevo i desno.
    Također, ograničio sam kretanje palice samo na širinu ekrana.
    Kako bi dobio glatko kretanje palice iskoristion sam funkciju requestAnimationFrame() i clearRect().
    Svakim frameom poziva se funkcija i radi ponovno iscrtavanje plaice na ekranu i time sam postigao glatke kretnje.
    Izvođenje funkcije je ograničeno sa varijablama gameOver i winGame koje zaustavljaju igru.
 */
document.addEventListener('keydown', (e) => {
    if (e.key === 'd') {
        isMovingRight = true;
    } else if (e.key === 'a') {
        isMovingLeft = true;
    }
});
document.addEventListener('keyup', (e) => {
    if (e.key === 'd') {
        isMovingRight = false;
    } else if (e.key === 'a') {
        isMovingLeft = false;
    }
});

function updatePaddle() {
    if (isMovingRight) {
        paddle.x += paddle.dx;
    }
    if (isMovingLeft) {
        paddle.x -= paddle.dx;
    }

    if (paddle.x < 0) {
        paddle.x = 0;
    } else if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updatePaddle();
    drawPaddle();

    if(!gameOver && !winGame) {
        requestAnimationFrame(gameLoop);

    }
}
gameLoop();

/*
    Unutar ove funkcije napravio sam kretanje loptice.
    Kretnje se izvršavaju tako da se loptica odbija po istim kutom ako pogodi u neki element(cigle, palica) ili zid
    Također, ako loptica pogodi u donji dio ekrana aktivira se varijabla gameOver koja završava igru
 */
function moveBall() {

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx *= -1;
        normalizeBallSpeed()
    }
    if (ball.y - ball.radius < 0) {
        ball.dy *= -1;
        normalizeBallSpeed()
    }

    if (ball.y + ball.radius > canvas.height) {
        gameOver = true;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
        }
    }
}
function normalizeBallSpeed() {
    const magnitude = Math.sqrt(ball.dx ** 2 + ball.dy ** 2); // Trenutna brzina
    ball.dx = (ball.dx / magnitude) * ball.speed; // Normaliziraj dx
    ball.dy = (ball.dy / magnitude) * ball.speed; // Normaliziraj dy
}
/*
    Funkcija kojom provjeravam je li loptica pogodila u ciglu i ima li još cigli na ekranu.
    Ako loptica pogodi ciglu, okrećem joj putanju prema dolje, ciglu stavljam na nevidljivo i povećavam rezultat.
    Ako su sve cigle uništene okida se zastavica kojom zaustavljam igru sa natpisom YOU WIN
 */
function collisionDetection() {
    let allBricksInvisible = true;
    bricks.forEach((row) => {
        row.forEach((brick) => {
            if (brick.visible) {
                allBricksInvisible = false;
                if (
                    ball.x > brick.x &&
                    ball.x < brick.x + BRICK_WIDTH &&
                    ball.y > brick.y &&
                    ball.y < brick.y + BRICK_HEIGHT
                ) {
                    ball.dy *= -1;
                    brick.visible = false;
                    score++;
                }
            }
        });
    });
    if(allBricksInvisible) {
        winGame = true;
    }
    if (
        ball.dy > 0 &&
        ball.x > paddle.x  &&
        ball.x < paddle.x + paddle.width &&
        ball.y + ball.radius > paddle.y
    ) {
        ball.dy = -Math.abs(ball.dy);
        ball.y = paddle.y - ball.radius;
    }
}
/*
    Ovu funkciju koristim za iscrtavanje svega na ekranu. Ona poziva sve prethodne funkcije koje crtaju na ekran
    i iscrtava završne ekrane ovisno o varijablama gameOver i winGame.
 */
function draw() {
    if (gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '40px Arial';
        ctx.fillStyle = 'red';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);

        ctx.font = '20px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 50);
        return;
    } else if(winGame) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '40px Arial';
        ctx.fillStyle = 'green';
        ctx.textAlign = 'center';
        ctx.fillText('YOU WIN', canvas.width / 2, canvas.height / 2);

        ctx.font = '21px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 50);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    moveBall();
    collisionDetection();

    requestAnimationFrame(draw);
}
draw();

