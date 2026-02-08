import { useEffect, useRef } from "react";

class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset();
  }

  reset() {
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.size = Math.random() * 3 + 1;
    this.speedX = (Math.random() - 0.5) * 0.8;
    this.speedY = (Math.random() - 0.5) * 0.8;
    this.opacity = Math.random() * 0.15 + 0.05;
    this.hue = 350 + Math.random() * 20; // Red spectrum for Velvet theme
    this.pulsePhase = Math.random() * Math.PI * 2;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    // Wrap around edges
    if (this.x < -10) this.x = this.canvas.width + 10;
    if (this.x > this.canvas.width + 10) this.x = -10;
    if (this.y < -10) this.y = this.canvas.height + 10;
    if (this.y > this.canvas.height + 10) this.y = -10;

    this.pulsePhase += 0.02;
  }

  draw(ctx) {
    const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;
    const currentOpacity = this.opacity * pulse;

    // Outer glow
    const gradient = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.size * 3,
    );
    gradient.addColorStop(
      0,
      `hsla(${this.hue}, 70%, 50%, ${currentOpacity * 0.8})`,
    );
    gradient.addColorStop(
      0.5,
      `hsla(${this.hue}, 70%, 50%, ${currentOpacity * 0.3})`,
    );
    gradient.addColorStop(1, `hsla(${this.hue}, 70%, 50%, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
    ctx.fill();

    // Core particle
    ctx.fillStyle = `hsla(${this.hue}, 80%, 60%, ${currentOpacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * pulse, 0, Math.PI * 2);
    ctx.fill();
  }
}

function CosmicBackground() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationIdRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function init() {
      resizeCanvas();
      particlesRef.current = [];
      for (let i = 0; i < 100; i++) {
        particlesRef.current.push(new Particle(canvas));
      }
    }

    function animate() {
      // Create beautiful gradient background
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height,
      );
      gradient.addColorStop(0, "#08090c");
      gradient.addColorStop(0.5, "#0f1014");
      gradient.addColorStop(1, "#08090c");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add large radial glows
      const glow1 = ctx.createRadialGradient(
        canvas.width * 0.2,
        canvas.height * 0.2,
        0,
        canvas.width * 0.2,
        canvas.height * 0.2,
        canvas.width * 0.5,
      );
      glow1.addColorStop(0, "rgba(223, 57, 57, 0.15)");
      glow1.addColorStop(0.5, "rgba(223, 57, 57, 0.05)");
      glow1.addColorStop(1, "rgba(223, 57, 57, 0)");
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const glow2 = ctx.createRadialGradient(
        canvas.width * 0.8,
        canvas.height * 0.7,
        0,
        canvas.width * 0.8,
        canvas.height * 0.7,
        canvas.width * 0.4,
      );
      glow2.addColorStop(0, "rgba(223, 57, 57, 0.1)");
      glow2.addColorStop(0.5, "rgba(223, 57, 57, 0.04)");
      glow2.addColorStop(1, "rgba(223, 57, 57, 0)");
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw and update particles
      particlesRef.current.forEach((particle) => {
        particle.update();
        particle.draw(ctx);
      });

      // Draw elegant connection lines
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 180) {
            const opacity = (1 - distance / 180) * 0.08;
            const gradient = ctx.createLinearGradient(
              particles[i].x,
              particles[i].y,
              particles[j].x,
              particles[j].y,
            );
            gradient.addColorStop(0, `rgba(223, 57, 57, ${opacity})`);
            gradient.addColorStop(0.5, `rgba(223, 57, 57, ${opacity * 1.5})`);
            gradient.addColorStop(1, `rgba(223, 57, 57, ${opacity})`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationIdRef.current = requestAnimationFrame(animate);
    }

    // Initialize and start animation
    init();
    animate();

    // Handle window resize
    const handleResize = () => {
      resizeCanvas();
      init();
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -3,
        pointerEvents: "none",
      }}
    />
  );
}

export default CosmicBackground;
