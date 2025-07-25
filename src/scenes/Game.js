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

        // Timer variables
        this.timer = 0;
        this.timerText = null;
        this.lastSpeedIncrease = 0;
        this.ballSpeedMultiplier = 1;

        // Paddle size change tracking
        this.leftPaddleSizeChanged = false;
        this.rightPaddleSizeChanged = false;

        this.paddleSpeed = 5; // Default paddle speed
        this.leftPaddleSpeed = 5;
        this.rightPaddleSpeed = 5;
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
        // Timer display
        this.timerText = this.add.text(WIDTH/2, 20, 'Time: 0', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

        // Speed display
        this.speedText = this.add.text(WIDTH/2, 60, 'Speed: 1.00x', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

        // Alert text for paddle size changes
        this.alertText = this.add.text(WIDTH/2, HEIGHT - 40, '', { fontSize: '32px', fill: '#ff0' }).setOrigin(0.5);
    }

    update(time, delta) {
        // Paddle movement using dynamic speed
        if (this.wasd.up.isDown && this.leftPaddle.y > 0) {
            this.leftPaddle.y -= this.leftPaddleSpeed;
        } else if (this.wasd.down.isDown && this.leftPaddle.y < HEIGHT) {
            this.leftPaddle.y += this.leftPaddleSpeed;
        }

        if (this.cursors.up.isDown && this.rightPaddle.y > 0) {
            this.rightPaddle.y -= this.rightPaddleSpeed;
        } else if (this.cursors.down.isDown && this.rightPaddle.y < HEIGHT) {
            this.rightPaddle.y += this.rightPaddleSpeed;
        }

        // Timer logic
        this.timer += delta / 1000;
        this.timerText.setText('Time: ' + Math.floor(this.timer));

        // Speed increase every 15 seconds
        if (Math.floor(this.timer / 15) > this.lastSpeedIncrease) {
            this.lastSpeedIncrease = Math.floor(this.timer / 15);
            this.increaseBallSpeed();
        }

        // Paddle size and speed change logic
        if (this.leftScore > 0 && this.leftScore % 2 === 0 && !this.leftPaddleSizeChanged) {
            this.changePaddleSize('left');
            this.changePaddleSpeed('left');
            this.leftPaddleSizeChanged = true;
        } else if (this.leftScore % 2 !== 0) {
            this.leftPaddleSizeChanged = false;
        }

        if (this.rightScore > 0 && this.rightScore % 2 === 0 && !this.rightPaddleSizeChanged) {
            this.changePaddleSize('right');
            this.changePaddleSpeed('right');
            this.rightPaddleSizeChanged = true;
        } else if (this.rightScore % 2 !== 0) {
            this.rightPaddleSizeChanged = false;
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

    increaseBallSpeed() {
        if (this.ballSpeedMultiplier >= 2) return; // Stop if already at or above 2x
        this.ballSpeedMultiplier *= 1.2;
        if (this.ballSpeedMultiplier > 2) this.ballSpeedMultiplier = 2; // Clamp to 2x
        this.speedText.setText('Speed: ' + this.ballSpeedMultiplier.toFixed(2) + 'x');
        if (this.ballInMotion) {
            this.ball.setVelocity(
                this.ball.body.velocity.x * 1.2,
                this.ball.body.velocity.y * 1.2
            );
        }
    }

    startBall() {
        if(!this.ballInMotion) {
            this.ball.setVelocity(300 * this.ballSpeedMultiplier, 300 * this.ballSpeedMultiplier);
            this.ballInMotion = true;
        }
    }

    hitPaddle() {
        
    }

    changePaddleSize(player) {
        // Randomly choose to lengthen or shorten
        const scaleChange = Phaser.Math.Between(0, 1) === 0 ? 1.2 : 0.8;
        let message = '';
        if (player === 'left') {
            this.leftPaddle.setScale(1, this.leftPaddle.scaleY * scaleChange);
            message = `Left paddle is now ${scaleChange > 1 ? 'longer' : 'shorter'}!`;
        } else {
            this.rightPaddle.setScale(1, this.rightPaddle.scaleY * scaleChange);
            message = `Right paddle is now ${scaleChange > 1 ? 'longer' : 'shorter'}!`;
        }
        this.alertText.setText(message + ` Speed: ${player === 'left' ? this.leftPaddleSpeed.toFixed(2) : this.rightPaddleSpeed.toFixed(2)}`);

        // Remove alert after 2 seconds
        this.time.delayedCall(2000, () => {
            this.alertText.setText('');
        });
    }

    changePaddleSpeed(player) {
        // Randomly choose to speed up or slow down
        const speedChange = Phaser.Math.Between(0, 1) === 0 ? 1.2 : 0.8;
        let message = '';
        if (player === 'left') {
            this.leftPaddleSpeed *= speedChange;
            message = `Left paddle is now ${speedChange > 1 ? 'faster' : 'slower'}!`;
        } else {
            this.rightPaddleSpeed *= speedChange;
            message = `Right paddle is now ${speedChange > 1 ? 'faster' : 'slower'}!`;
        }
        // Clamp paddle speed to reasonable values
        this.leftPaddleSpeed = Phaser.Math.Clamp(this.leftPaddleSpeed, 2, 15);
        this.rightPaddleSpeed = Phaser.Math.Clamp(this.rightPaddleSpeed, 2, 15);

        this.alertText.setText(message + ` Speed: ${player === 'left' ? this.leftPaddleSpeed.toFixed(2) : this.rightPaddleSpeed.toFixed(2)}`);

        // Remove alert after 2 seconds
        this.time.delayedCall(2000, () => {
            this.alertText.setText('');
        });
    }

    resetBall() {
        this.ball.setPosition(WIDTH/2, 384);
        this.ball.setVelocity(0, 0);
        this.ballInMotion = false;

        // Reset paddles to center positions
        this.leftPaddle.setPosition(50, 384);
        this.rightPaddle.setPosition(974, 384);

        // Reset speed based on score
        if (this.leftScore >= 20 || this.rightScore >= 20) {
            this.ballSpeedMultiplier = 2;
        } else if (this.leftScore >= 10 || this.rightScore >= 10) {
            this.ballSpeedMultiplier = 1.5;
        } else {
            this.ballSpeedMultiplier = 1;
        }
        this.speedText.setText('Speed: ' + this.ballSpeedMultiplier.toFixed(2) + 'x');
        // Do NOT set alertText for ball speed reset
    }
}