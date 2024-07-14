class ConfettiPiece {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 10 + 5;
    this.velocity = {
      x: Math.random() * 6 - 3,
      y: Math.random() * -15 - 10,
    };
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 10 - 5;
    this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
  }

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.velocity.y += 0.5; // gravity
    this.rotation += this.rotationSpeed;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

class ConfettiAnimation {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.confettiPieces = [];
    this.numberOfPieces = 200;
    this.animationDuration = 3000;
    this.messageElement = document.createElement("div");

    this.setupCanvas();
    this.setupMessageElement();
  }

  setupCanvas() {
    this.canvas.style.position = "fixed";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.pointerEvents = "none";
    this.canvas.style.zIndex = "9999";
    document.body.appendChild(this.canvas);
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
  }

  setupMessageElement() {
    this.messageElement.style.position = "fixed";
    this.messageElement.style.top = "50%";
    this.messageElement.style.left = "50%";
    this.messageElement.style.transform = "translate(-50%, -50%)";
    this.messageElement.style.fontSize = "32px";
    this.messageElement.style.fontWeight = "bold";
    this.messageElement.style.textAlign = "center";
    this.messageElement.style.zIndex = "10000";
    this.messageElement.style.textShadow = "2px 2px 4px rgba(0,0,0,0.5)";
    this.messageElement.style.opacity = "0";
    this.messageElement.style.transition = "opacity 0.5s";
    document.body.appendChild(this.messageElement);
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initConfetti() {
    this.confettiPieces = [];
    for (let i = 0; i < this.numberOfPieces; i++) {
      this.confettiPieces.push(
        new ConfettiPiece(Math.random() * this.canvas.width, -20)
      );
    }
  }

  animate(startTime) {
    const elapsedTime = Date.now() - startTime;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.confettiPieces.forEach((piece) => {
      piece.update();
      piece.draw(this.ctx);
    });

    if (elapsedTime < this.animationDuration) {
      requestAnimationFrame(() => this.animate(startTime));
    } else {
      this.canvas.style.display = "none";
      setTimeout(() => {
        this.messageElement.style.opacity = "0";
      }, 2000);
    }
  }

  triggerAnimation(message, color = "#ffffff") {
    this.messageElement.textContent = message;
    this.messageElement.style.color = color;
    this.canvas.style.display = "block";
    this.messageElement.style.opacity = "1";
    this.initConfetti();
    this.animate(Date.now());
  }
}

const confettiAnimation = new ConfettiAnimation();

function celebrateAchievement(achievementType, color) {
  let message;
  const name = window.username ? `${window.username}` : "You";
  switch (achievementType) {
    case "task":
      message = `Way to go, ${name}!\nYou completed a task!`;
      break;
    case "badge":
      message = `Congratulations, ${name}!\nYou earned a new badge!`;
      break;
    default:
      message = `Great job, ${name}!`;
  }
  confettiAnimation.triggerAnimation(message, color);
}

window.celebrateAchievement = celebrateAchievement;
