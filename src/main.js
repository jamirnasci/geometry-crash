import Phaser from 'phaser';
import { STRUCTS } from './structs';
import { MenuScene } from './scenes/menu';

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    this.load.image('square', 'img/square.png');
    this.load.image('rectangle', 'img/rectangle.png');
    this.load.image('ground', 'img/ground.png');
    this.load.image('cannon', 'img/cannon.png');
    this.load.image('bullet', 'img/bullet.png');
    this.load.image('wheel', 'img/wheel.png');
    this.load.image('up-arrow', 'img/up-arrow.png');
    this.load.image('down-arrow', 'img/down-arrow.png');
    this.load.image('left-arrow', 'img/left-arrow.png');
    this.load.image('right-arrow', 'img/right-arrow.png');
    this.load.image('fire-btn', 'img/fire-btn.png');
    this.load.image('forest', 'img/forest.png');
    this.load.image('pause-btn', 'img/pause-btn.png');
    this.load.audio('shoot', 'audio/shoot.mp3');
    this.load.audio('box-hit', 'audio/box-hit.mp3');
  }

  create() {
    // Configura o mundo físico
    this.matter.world.setBounds(0, 0, 1700, 900);
    // REMOVER: this.matter.world.update30Hz() → causa lag e bugs!
    this.cameras.main.setBounds(0, 0, 1700, 600, true)

    this.bg = this.add.image(0, 0, 'forest')
    this.bg.setOrigin(0)

    this.bullets = 5
    // Chão
    this.matter.add.image(850, window.innerHeight, 'ground', null, { isStatic: true })

    // Canhão (estático)
    this.cannon = this.matter.add.image(150, this.scale.height - 130, 'cannon', null, { isStatic: true }).setScale(0.3);
    this.wheel = this.matter.add.image(140, this.scale.height - 100, 'wheel', null, { isStatic: true }).setScale(0.2);

    //hud
    this.upArrow = this.add.image(50, window.innerHeight - 100, 'up-arrow')
      .setDepth(1)
      .setScale(0.2)
      .setScrollFactor(0)
      .setInteractive()
      .on('pointerdown', () => {
        this.upArrow.isPressed = true
      })
      .on('pointerout', () => {
        this.upArrow.isPressed = false
      })
    this.downArrow = this.add.image(50, window.innerHeight - 50, 'down-arrow')
      .setDepth(1)
      .setScale(0.2)
      .setScrollFactor(0)
      .setInteractive()
      .on('pointerdown', () => {
        this.downArrow.isPressed = true
      })
      .on('pointerout', () => {
        this.downArrow.isPressed = false
      })
    this.leftArrow = this.add.image(window.innerWidth - 100, window.innerHeight - 75, 'left-arrow')
      .setDepth(1)
      .setScale(0.2)
      .setScrollFactor(0)
      .setInteractive()
      .on('pointerdown', () => {
        this.leftArrow.isPressed = true
      })
      .on('pointerout', () => {
        this.leftArrow.isPressed = false
      })
    this.rightArrow = this.add.image(window.innerWidth - 50, window.innerHeight - 75, 'right-arrow')
      .setDepth(1)
      .setScale(0.2)
      .setScrollFactor(0)
      .setInteractive()
      .on('pointerdown', () => {
        this.rightArrow.isPressed = true
      })
      .on('pointerout', () => {
        this.rightArrow.isPressed = false
      })
    this.fireBtn = this.add.image(window.innerWidth - 75, window.innerHeight - 120, 'fire-btn')
      .setDepth(1)
      .setScale(0.2)
      .setScrollFactor(0)
      .setInteractive()
      .on('pointerdown', () => {
        this.cannonFire()
      })
      .on('pointerout', () => {
        this.fireBtn.isPressed = false
      })
    this.bulletsHud = this.add.text(20, 20, `💣 ${this.bullets}`, {
      padding: 5,
      fontSize: 30,
      fontFamily: 'Arial Narrow'
    })
      .setScrollFactor(0)
      .setStroke('#000', 4)
    this.pauseBtn = this.add.image(window.innerWidth - 75, 30, 'pause-btn')
      .setScale(0.2)
      .setInteractive()
      .setScrollFactor(0)
      .on('pointerdown', () => {       
        this.matter.world.pause()
        const pauseContainer = this.add.container(window.innerWidth / 2, window.innerHeight / 2)
          .setScrollFactor(0)          
          .setSize(300, 400)
        const pauseMenu = this.add.rectangle(0, 0, 300, 400, 0x0000, 0.7)
          .setRounded(20)
          .setScrollFactor(0)
        const continueBtn = this.add.rectangle(0, 0, 200, 50, 0x8800ff, 1)
          .setRounded(20)
          .setScrollFactor(0)   
          .setInteractive()
          .setStrokeStyle(4, 0x330055, 1)
          .on('pointerdown', () => {
            this.matter.world.resume()
            pauseContainer.destroy()
          })
        const continueTxt = this.add.text(0, 0, 'CONTINUE', {
          padding: 20,
          fontSize: '20px',
          fixedWidth: 300,
          align: 'center',
          fontFamily: 'Arial Narrow'
        }).setStroke('#000', 4)
        .setScrollFactor(0)   

        continueTxt.x -= continueTxt.width / 2
        continueTxt.y -= continueTxt.height / 2

        const exitBtn = this.add.rectangle(0, 60, 200, 50, 0xff0000, 1)
          .setRounded(20)
          .setInteractive()
          .setScrollFactor(0)   
          .setStrokeStyle(4, 0x550000, 1)
          .on('pointerdown', () => {
            this.scene.start('MenuScene')
          })
        const exitTxt = this.add.text(0, 60, 'EXIT', {
          padding: 20,
          fontSize: '20px',
          fixedWidth: 300,
          align: 'center',
          fontFamily: 'Arial Narrow'
        }).setStroke('#000', 4)
        .setScrollFactor(0)   

        exitTxt.x -= exitTxt.width / 2
        exitTxt.y -= exitTxt.height / 2

        pauseContainer.add([
          pauseMenu,
          continueBtn,
          continueTxt,
          exitBtn,
          exitTxt
        ]);        
      })

    this.objects = [];

    // Cria blocos quadrados
    STRUCTS[2].forEach(item => {
      const square = this.matter.add.image(item.x, item.y, item.key, null, {
        restitution: 0.05,
        friction: 0.5,
        frictionStatic: 0.5,
        density: 0.1,
        chamfer: { radius: 0 },
        label: 'shape',
        isStatic: false
      }).setMass(4)
      this.objects.push(square);
    });

    this.lastAudioHitTime = 0
    // Colisão: bala atinge bloco ou retângulo
    this.matter.world.on('collisionstart', (event) => {
      event.pairs.forEach(pair => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;
        const gameObjectA = bodyA.gameObject;
        const gameObjectB = bodyB.gameObject;

        if ((this.time.now - this.lastAudioHitTime) >= 100) {
          this.lastAudioHitTime = this.time.now
          this.sound.play('box-hit', {
            volume: 0.1
          })
        }

        if (!gameObjectA || !gameObjectB) return;

        const isBullet = gameObjectA.label === 'bullet' || gameObjectB.label === 'bullet';
        const isTarget = ['square', 'rectangle'].includes(gameObjectA.label) || ['square', 'rectangle'].includes(gameObjectB.label);

        if (isBullet && isTarget) {
          const bullet = gameObjectA.label === 'bullet' ? gameObjectA : gameObjectB;
          const target = bullet === gameObjectA ? gameObjectB : gameObjectA;

          // Aplica impulso ao alvo
          const force = 0.05;
          this.matter.body.applyForce(target.body, target.body.position, {
            x: (target.x - bullet.x) * force,
            y: (target.y - bullet.y) * force - 0.02 // leve empurrão pra cima
          });

          // Gira o alvo
          target.setAngularVelocity(Phaser.Math.FloatBetween(0.1, 0.3) * (Math.random() > 0.5 ? 1 : -1));

          // Remove a bala
          bullet.destroy();
        }
      });
    });

    this.keyboard = this.input.keyboard.createCursorKeys()
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
  }

  update() {
    // REMOVER todo o setTimeout e manipulação manual de rotação!
    // O Matter.js já cuida da física naturalmente.

    // Opcional: remover objetos que caíram da tela
    this.objects = this.objects.filter(obj => {
      if (obj.y > 700) {
        obj.destroy();
        return false;
      }
      return true;
    });

    const rotationSpeed = 0.05
    if (this.keyboard.up.isDown || this.upArrow.isPressed) {
      if (Math.abs(this.cannon.rotation) < 0.9) {
        this.cannon.rotation -= rotationSpeed
      }
    } else if (this.keyboard.down.isDown || this.downArrow.isPressed) {
      if (Math.abs(this.cannon.rotation) > 0) {
        this.cannon.rotation += rotationSpeed
      }
    }
    if (this.keyboard.left.isDown || this.leftArrow.isPressed) {
      this.cameras.main.scrollX -= 10
    }
    if (this.keyboard.right.isDown || this.rightArrow.isPressed) {
      this.cameras.main.scrollX += 10
    }
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.cannonFire()
    }
  }
  cannonFire() {
    if (this.bullets <= 0) {
      return
    }
    const angle = this.cannon.rotation;
    const speed = 20;
    const barrelLength = 50;  // Comprimento do cano

    // POSIÇÃO DA PONTA DO CANO
    const bulletX = this.cannon.x + Math.cos(angle) * barrelLength;
    const bulletY = this.cannon.y + Math.sin(angle) * barrelLength;

    this.sound.play('shoot',)
    const bullet = this.matter.add.image(bulletX, bulletY, 'bullet', null, {
      shape: 'circle',
      restitution: 0.6,
      friction: 0.01,
      density: 0.003,
      label: 'bullet',
      frictionAir: 0.01,
    })
    this.cameras.main.startFollow(bullet, false, 0.1, 0.1)
    // VELOCIDADE NA DIREÇÃO DO CANHÃO
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    bullet.setVelocity(vx, vy);
    bullet.setAngularVelocity(0.01);
    this.time.delayedCall(2000, () => {
      this.cameras.main.stopFollow()
    })
    this.bullets -= 1
    this.bulletsHud.setText(`💣 ${this.bullets}`)
  }
}

// Configuração do jogo
const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#87CEEB',
  pixelArt: false,
  physics: {
    default: 'matter',
    matter: {
      gravity: { x: 0, y: 0.5 },
      debug: false,
      enableSleeping: false
    }
  },
  scene: [MenuScene, MainScene]
});