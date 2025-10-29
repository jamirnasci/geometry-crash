import Phaser from 'phaser';

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
  }

  create() {
    // Configura o mundo físico
    this.matter.world.setBounds(0, 0, 1700, 600);
    // REMOVER: this.matter.world.update30Hz() → causa lag e bugs!
    this.cameras.main.setBounds(0, 0, 1700, 600, true)
    // Chão
    this.matter.add.image(850, 550, 'ground', null, { isStatic: true })
    
    // Canhão (estático)
    this.cannon = this.matter.add.image(150, 447, 'cannon', null, { isStatic: true }).setScale(0.3);
    this.wheel = this.matter.add.image(140, 473, 'wheel', null, { isStatic: true }).setScale(0.2);    

    // Posições dos blocos (estrutura de castelo)
    const positions = [
      { x: 900, y: 532 },
      { x: 900, y: 500 },
      { x: 900, y: 468 },
      { x: 900, y: 436 },
      { x: 1080, y: 532 },
      { x: 1080, y: 500 },
      { x: 1080, y: 468 },
      { x: 1080, y: 436 },
      
      { x: 900, y: 230 },
      { x: 900, y: 230 },
      { x: 900, y: 230 },
      { x: 900, y: 230 },
      { x: 1080, y: 230 },
      { x: 1080, y: 298 },
      { x: 1080, y: 266 },
      { x: 1080, y: 234 },
    ];

    this.objects = [];

    // Cria blocos quadrados
    positions.forEach(pos => {
      const square = this.matter.add.image(pos.x, pos.y, 'square', null, {
        restitution: 0.1,
        friction: 0.3,
        frictionStatic: 0.5,
        density: 0.01,
        chamfer: { radius: 2 },
        label: 'square'
      })
      this.objects.push(square);
    });


    // Retângulo no topo (alvo principal)
    const rectangle = this.matter.add.image(990, 400, 'rectangle', null, {
      restitution: 0.1,
      friction: 0.05,
      frictionStatic: 0.8,
      density: 0.001,
      label: 'rectangle',
    })
    const rectangle2 = this.matter.add.image(990, 150, 'rectangle', null, {
      restitution: 0.1,
      friction: 0.05,
      frictionStatic: 0.8,
      density: 0.0001,
      label: 'rectangle',
    })
    this.objects.push(rectangle);

    // Colisão: bala atinge bloco ou retângulo
    this.matter.world.on('collisionstart', (event) => {
      event.pairs.forEach(pair => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;
        const gameObjectA = bodyA.gameObject;
        const gameObjectB = bodyB.gameObject;

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
    if (this.keyboard.up.isDown) {
      if (Math.abs(this.cannon.rotation) < 0.9) {
        this.cannon.rotation -= rotationSpeed
      }
    } else if (this.keyboard.down.isDown) {
      if (Math.abs(this.cannon.rotation) > 0) {
        this.cannon.rotation += rotationSpeed
      }
    }
    if(this.keyboard.left.isDown){
      this.cameras.main.scrollX -= 5
    }
    if(this.keyboard.right.isDown){
      this.cameras.main.scrollX += 5
    }
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      const angle = this.cannon.rotation;
      const speed = 20;
      const barrelLength = 50;  // Comprimento do cano

      // POSIÇÃO DA PONTA DO CANO
      const bulletX = this.cannon.x + Math.cos(angle) * barrelLength;
      const bulletY = this.cannon.y + Math.sin(angle) * barrelLength;
      
      const bullet = this.matter.add.image(bulletX, bulletY, 'bullet', null, {
        shape: 'circle',
        restitution: 0.6,
        friction: 0.01,
        density: 0.1,
        label: 'bullet',
        frictionAir: 0.01,
      })
      this.cameras.main.startFollow(bullet)
      // VELOCIDADE NA DIREÇÃO DO CANHÃO
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      bullet.setVelocity(vx, vy);
      bullet.setAngularVelocity(0.01);
      this.time.delayedCall(2000, ()=>{
        this.cameras.main.stopFollow()
      })
    }
  }
}

// Configuração do jogo
const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'matter',
    matter: {
      gravity: { x: 0, y: 1 },
      debug: false, // Desative em produção
      enableSleeping: true
    }
  },
  scene: MainScene
});