// JAVASCRIPT CODE //
// TEST MODULE

//DRAW CANVAS
const cvs = document.getElementById("bird");
const ctx = cvs.getContext("2d");

//GAME VARS AND CONST
let frames = 0;
const DEGREE = Math.PI / 180;

//LOAD SPRITE IMAGE
const sprite = new Image();
sprite.src = "img/sprite.png";

// LOAD SOUNDS
const SCORE_S = new Audio();
SCORE_S.src = "audio/sfx_point.wav";

const FLAP_S = new Audio();
FLAP_S.src = "audio/sfx_flap.wav";

const HIT_S = new Audio();
HIT_S.src = "audio/sfx_hit.wav";

const SWOOSHING_S = new Audio();
SWOOSHING_S.src = "audio/sfx_swooshing.wav";

const DIE_S = new Audio();
DIE_S.src = "audio/sfx_die.wav";

//GAME STATE && STATE CONTROL
const state = {
    current: 0,
    getReady: 0,
    game: 1,
    over: 2,
    stateControl: function (evt) {
        switch (state.current) {
            case state.getReady:
                state.current = state.game;
                SWOOSHING_S.play();
                break;
            case state.game:
                bird.flap();
                FLAP_S.play();
                break;
            case state.over:
                let rect = cvs.getBoundingClientRect();
                let clickX = evt.clientX - rect.left;
                let clickY = evt.clientY - rect.top;
    
                //console.log(`clickX ${clickX} clickY ${clickY}`);
                if (clickX >= startBtn.x &&
                    clickX <= startBtn.x + startBtn.w &&
                    clickY >= startBtn.y &&
                    clickY <= startBtn.y + startBtn.h) {
                    bird.speedReset();
                    pipes.reset();
                    score.reset();
                    state.current = state.getReady;
                }
                break;
        }
    }
}

// START BUTTON CO-ORD
const startBtn = {
    x: 120,
    y: 272,
    w: 83,
    h: 29
}

//CONTROL THE GAME
// CLICK ON CANVAS EVENT
cvs.addEventListener('click', (evt) => {
    state.stateControl(evt);
})
// PRESS ANY KEY ON KEYBOARD
window.addEventListener('keydown', (evt) => {
    state.stateControl(evt);
})

// BACKGROUND
const bg = {
    sX: 0,
    sY: 0,
    w: 275,
    h: 226,
    x: 0,
    y: cvs.height - 226,

    draw: function () {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);

        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    }
}

// FOREGROUND
const fg = {
    sX: 276,
    sY: 0,
    w: 224,
    h: 112,
    x: 0,
    y: cvs.height - 112,

    //delta X -> create illusion for the bird moving forward with 2px/frame
    dx: 2,

    draw: function () {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);

        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    },

    update: function () {
        if (state.current == state.game) {
            this.x = (this.x - this.dx) % (this.w / 2);
        }
    }
}
// BIRD
const bird = {
    animation: [{
            sX: 276,
            sY: 112
        },
        {
            sX: 276,
            sY: 139
        },
        {
            sX: 276,
            sY: 164
        },
        {
            sX: 276,
            sY: 139
        }
    ],
    x: 50,
    y: 150,
    w: 34,
    h: 26,

    radius: 12,

    frame: 0,

    // Natural element
    gravity: 0.25,
    jump: 4.6,
    speed: 0,
    rotation: 0,

    draw: function () {
        let bird = this.animation[this.frame];

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, -this.w / 2, -this.h / 2, this.w, this.h);
        ctx.restore();
    },

    flap: function () {
        this.speed = -this.jump;
        // IF BIRD FLY ABOVE THE CANVAS
        if (this.y + this.radius <= 10) {
            this.speed = this.gravity;
        }
    },

    update: function () {
        // SET PERIOD OF FLAP FOR BIRD. HIGHER -> FLAP SLOWER
        // IF THE GAME STATE IS GET READY STATE, THE BIRD MUST FLAP SLOWLY
        this.period = state.current == state.getReady ? 10 : 5;
        // WE INCREASE THE FRAME BY 1, EACH PERIOD      
        this.frame += frames % this.period == 0 ? 1 : 0;
        // FRAME GOES FROM 0 TO 3, THEN GO BACK TO 0 AGAIN, BECAUSE THE FRAME < ANIMATION LENGTH = 4
        this.frame = this.frame % this.animation.length;

        if (state.current == state.getReady) {
            this.y = 150; // RESET POSITION OF THE BIRD AFTER GAME OVER
            this.rotation = 0 * DEGREE;
        } else {
            this.speed += this.gravity;
            this.y += this.speed;

            // DIE IF HIT THE GROUND
            if (this.y + this.h / 2 >= cvs.height - fg.h) {
                this.y = cvs.height - fg.h - this.h / 2;
                if (state.current == state.game) {
                    state.current = state.over;
                    DIE_S.play();
                }
            }

            // IF THE SPEED IS GREATER THAN THE JUMP MEANS THE BIRD IS FALLING DOWN
            if (this.speed >= this.jump) {
                this.rotation = 90 * DEGREE;
                this.frame = 1;
            } else {
                this.rotation = -25 * DEGREE;
            }
        }
    },
    // RESET FUNCTION
    speedReset: function () {
        this.speed = 0;
    }

}
// GET READY MESSAGE
const getReady = {
    sX: 0,
    sY: 228,
    w: 173,
    h: 152,
    x: cvs.width / 2 - 173 / 2,
    y: 100,
    //draw function:
    draw: function () {
        if (state.current == state.getReady) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }

}
// GAME OVER MESSAGE
const gameOver = {
    sX: 175,
    sY: 228,
    w: 225,
    h: 202,
    x: cvs.width / 2 - 225 / 2,
    y: 100,

    draw: function () {
        if (state.current == state.over) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);

        }
    }
}
// PIPES
const pipes = {
    position: [],

    top: {
        sX: 553,
        sY: 0
    },
    bottom: {
        sX: 502,
        sY: 0,
    },

    w: 53,
    h: 400,
    gap: 85,
    maxYPos: -150,
    dx: 2,

    draw: function () {
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;

            //top pipe
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);
            //bottom pipe
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);

        }
    },

    update: function () {
        if (state.current !== state.game) return;

        if (frames % 100 == 0) {
            this.position.push({
                x: cvs.width,
                y: this.maxYPos * (Math.random() + 1)
            });
        }

        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            let bottomYPos = p.y + this.h + this.gap;

            // COLLISION DETECTION
            // BIRD BORDER
            let border = {
                right: bird.x + bird.radius, // CENTER + RADIUS
                left: bird.x - bird.radius,
                top: bird.y + bird.radius,
                bottom: bird.y - bird.radius
            }

            // DIE IF HIT THE PIPES
            // TOP PIPE
            if (border.right > p.x &&
                border.left < p.x + this.w &&
                border.top > bird.y &&
                border.bottom < p.y + this.h) {
                HIT_S.play();
                state.current = state.over;

            }

            // BOTTOM PIPE
            if (border.right > p.x &&
                border.left < p.x + this.w &&
                border.top > bottomYPos &&
                border.bottom < bottomYPos + this.h) {
                HIT_S.play();
                state.current = state.over;
            }

            // MOVE THE PIPES TO THE LEFT
            p.x -= this.dx;

            // REMOVE THE PIPE WHICH IS OUT OF CANVAS
            if (p.x + this.w <= 0) {
                this.position.shift();

                //Increase the score
                score.value += 1;
                SCORE_S.play();
                //Compare the best score with current score while playing
                score.best = Math.max(score.best, score.value);
                localStorage.setItem("best", score.best);
            }
        }
    },
    // RESET FUNCTION
    reset: function () {
        this.position = [];
    }


}

// SCORE
const score = {
    best: parseInt(localStorage.getItem("best")) || 0,
    value: 0,
    //DRAW MEDAL FOR THE ROUND

    medal: {
        paper: {
            x: 312,
            y: 112,
            w: 46,
            h: 44
        },
        silver: {
            x: 358,
            y: 112,
            w: 46,
            h: 44
        },
        bronze: {
            x: 358,
            y: 156,
            w: 46,
            h: 44
        },
        gold: {
            x: 312,
            y: 156,
            w: 46,
            h: 44
        }
    },

    draw: function () {
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";

        if (state.current == state.game) {
            ctx.lineWidth = 2;
            ctx.font = "35px Teko";
            ctx.fillText(this.value, cvs.width / 2, 50);
            ctx.strokeText(this.value, cvs.width, 50);
        } else if (state.current == state.over) {
            ctx.font = "25px Teko";
            ctx.fillText(this.value, 225, 193);
            ctx.strokeText(this.value, 225, 193);
            ctx.fillText(this.best, 225, 235);
            ctx.strokeText(this.best, 225, 235);

            if (this.value >= 0 && this.value < 10) {
                ctx.drawImage(sprite, this.medal.paper.x, this.medal.paper.y, this.medal.paper.w, this.medal.paper.h, 72, 186, this.medal.paper.w, this.medal.paper.h);
            } else if (this.value < 20) {
                ctx.drawImage(sprite, this.medal.bronze.x, this.medal.bronze.y, this.medal.bronze.w, this.medal.bronze.h, 72, 186, this.medal.bronze.w, this.medal.bronze.h);
            } else if (this.value < 30) {
                ctx.drawImage(sprite, this.medal.silver.x, this.medal.silver.y, this.medal.silver.w, this.medal.silver.h, 72, 186, this.medal.silver.w, this.medal.silver.h);
            } else {
                ctx.drawImage(sprite, this.medal.gold.x, this.medal.gold.y, this.medal.gold.w, this.medal.gold.h, 72, 186, this.medal.gold.w, this.medal.gold.h);
            }
        }
    },

    // RESET FUNCTION
    reset: function () {
        this.value = 0;
    }

}

// DRAW
function draw() {

    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    bg.draw();
    pipes.draw();
    fg.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
}

// UPDATE FUNCTION
function update() {
    bird.update();
    fg.update();
    pipes.update();
}

function loop() {
    // UPDATE THE VALUE EACH TIME FRAME CHANGES
    update();

    // DRAW THE CANVAS
    draw();
    //Track how many frames are drawn
    frames++;
    requestAnimationFrame(loop);
}

loop();