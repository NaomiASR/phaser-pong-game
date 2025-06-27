import { Scene } from 'phaser';

const WIDTH = 1024;
const HEIGHT = 768;

export class Game extends Scene {
    constructor() {
        super('Game');
        // Initialise necessary variables
        this.ball = null;
        this.leftPaddle = null;
        this.rightPaddle = null;
        this.ballInMotion = false;
        this.wasd = null;
        this.cursors = null;
        this.leftScore = 0;
        this.rightScore = 0;
        this.leftScoretext = null;
        this.rightScoretext = null;
    }

    preload() {
        // Load necessary assets from the assets directory
        this.load.image('background', 'assets/background.png');
        this.load.image('ball', 'assets/ball.png');
        this.load.image('paddle', 'assets/paddle.png');
    }

    create() {
        // Add background, ball, and paddles to the scene
        this.add.image(WIDTH/2, HEIGHT/2, 'background').setScale(0.8, 0.8);
        this.ball = this.physics.add.image(WIDTH/2, HEIGHT/2, 'ball').setScale(0.05, 0.05).refreshBody();
        this.leftPaddle = this.physics.add.image(50, 384, "paddle");
        this.leftPaddle.setImmovable(true);
        this.rightPaddle = this.physics.add.image(974, 384, "paddle");
        this.rightPaddle.setImmovable(true);

        this.physics.add.collider(this.ball,this.leftPaddle,this.hitPaddle,null,this);
        this.physics.add.collider(this.ball,this.rightPaddle,this.hitPaddle,null,this);
        
        this.ball.setCollideWorldBounds(true);
        this.ball.setBounce(1,1);

        this.input.keyboard.on('keydown-SPACE',this.startBall,this);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S
        });

        this.leftScoretext = this.add.text(100,50,'0', {fontSize: '50px'});
        this.rightScoretext = this.add.text(924,50,'0', {fontSize: '50px'});
    }

    update() {
        if (this.wasd.up.isDown && this.leftPaddle.y > 0) {
            this.leftPaddle.y -= 5;
        } else if (this.wasd.down.isDown && this.leftPaddle.y < HEIGHT) {
            this.leftPaddle.y += 5;
        }

        if (this.cursors.up.isDown && this.rightPaddle.y > 0) {
            this.rightPaddle.y -= 5;
        } else if (this.cursors.down.isDown && this.rightPaddle.y < HEIGHT) {
            this.rightPaddle.y += 5;
        }

        const margin = 30;
        if (this.ball.x < margin) {
            this.rightScore += 1;
            this.rightScoretext.setText(this.rightScore);
            this.resetBall();
        } else if (this.ball.x > WIDTH - margin) {
            this.leftScore += 1;
            this.leftScoretext.setText(this.leftScore);
            this.resetBall();
        }
    }


    startBall() {
        if(!this.ballInMotion) {
            this.ball.setVelocity(200,200);
            this.ballInMotion = true;
        }
    }

    hitPaddle(ball,paddle) {
        let VelocityFactor = 1.3;
        let NewVelocityY = ball.body.velocity.y * VelocityFactor;
        let NewVelocityX = ball.body.velocity.x * VelocityFactor;

        let angleDeviationInDeg = Phaser.Math.Between(-30,30);
        let angleDeviationInRad = Phaser.Math.DegToRad(angleDeviationInDeg);
        let newVelocity = new Phaser.Math.Vector2(NewVelocityX,NewVelocityY).rotate(angleDeviationInRad);
        ball.setVelocity(newVelocity.x,newVelocity.y);
    }

    resetBall() {
        this.ball.setPosition(WIDTH/2,384);
        this.ball.setVelocity(0,0);
        this.ballInMotion = false;
        this.startBall()
    }
}