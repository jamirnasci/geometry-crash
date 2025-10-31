import Phaser from 'phaser'

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' })
    }
    preload() {
        const g = this.add.graphics();
        g.fillStyle(0x00ff00, 1);
        g.fillCircle(32, 32, 32);
        g.generateTexture('circle', 64, 64);
        g.clear();
        this.load.image('app-logo', 'img/app-logo.png')
        this.load.image('square', 'img/square.png');
        this.load.image('rectangle', 'img/rectangle.png');
    }
    create() {
        const screenWidth = window.innerWidth
        const screenHeight = window.innerHeight

        this.matter.world.setBounds(0, 0, screenWidth, screenHeight)

        this.appLogo = this.add.image(screenWidth / 2, 100, 'app-logo')
            .setScale(0.2)
            .setDepth(1)

        this.playBtn = this.add.rectangle(screenWidth / 2, screenHeight / 2, 300, 60, 0x8800ff, 1)
            .setRounded(20)
            .setInteractive()
            .setDepth(1)
            .setStrokeStyle(4, 0x330055, 1)
            .on('pointerdown', () => {
                this.scene.start('MainScene')
            })
        this.playTxt = this.add.text(screenWidth / 2, (screenHeight / 2), 'PLAY', {
            padding: 20,
            fontSize: '40px',
            fixedWidth: 300,
            align: 'center',
            fontFamily: 'Arial Narrow'
        }).setStroke('#000', 4)
            .setDepth(1)
        this.playTxt.x -= this.playTxt.width / 2
        this.playTxt.y -= this.playTxt.height / 2

        this.shopBtn = this.add.rectangle(screenWidth / 2, (screenHeight / 2) + 70, 300, 60, 0x8800ff, 1)
            .setRounded(20)
            .setInteractive()
            .setDepth(1)
            .setStrokeStyle(4, 0x330055, 1)
            .on('pointerdown', () => {
                
            })
        this.shopTxt = this.add.text(screenWidth / 2, (screenHeight / 2) + 70, 'SHOP', {
            padding: 20,
            fontSize: '40px',
            fixedWidth: 300,
            align: 'center',
            fontFamily: 'Arial Narrow'
        }).setStroke('#000', 4)
            .setDepth(1)
        this.shopTxt.x -= this.shopTxt.width / 2
        this.shopTxt.y -= this.shopTxt.height / 2

        this.exitBtn = this.add.rectangle(screenWidth / 2, (screenHeight / 2) + 140, 300, 60, 0xff0000, 1)
            .setRounded(20)
            .setInteractive()
            .setDepth(1)
            .setStrokeStyle(4, 0x550000, 1)
            .on('pointerdown', () => {
                
            })
        this.exitTxt = this.add.text(screenWidth / 2, (screenHeight / 2) + 140, 'EXIT', {
            padding: 20,
            fontSize: '40px',
            fixedWidth: 300,
            align: 'center',
            fontFamily: 'Arial Narrow'
        }).setStroke('#000', 4)
            .setDepth(1)
        this.exitTxt.x -= this.exitTxt.width / 2
        this.exitTxt.y -= this.exitTxt.height / 2

        const shapes = ['square', 'rectangle', 'circle']
        for (let i = 0; i < 30; i++) {
            const x = Math.floor(Math.random() * (window.innerWidth - 50))
            const y = 50
            const shapeIndex = Math.floor(Math.random() * (shapes.length))
            console.log(shapeIndex)
            setTimeout(() => {
                this.matter.add.image(x, y, shapes[shapeIndex])
            }, i * 100)
        }
    }
    update() {

    }
}