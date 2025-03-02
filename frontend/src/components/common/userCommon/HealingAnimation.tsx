import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  velocity: { x: number; y: number };
  scale: number;
  phase: number;
  rotation: number;
  rotationSpeed: number;
}

const HealingAnimation: React.FC<{ isActive?: boolean }> = ({ isActive = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrameId = useRef<number>();
  const lastTime = useRef<number>(0);

  // Adjust these values for a more prominent effect
  const emissionRate = 0.2; 
  const maxParticles = 80;
  const upwardSpeed = -2; // Base upward velocity

  // Use state to ensure the canvas starts at full viewport size
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const updateCanvasSize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create a linear gradient for the green color transitions
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#00ff88'); // bright green
    gradient.addColorStop(0.5, '#39ff14'); // neon green
    gradient.addColorStop(1, '#aaffaa'); // softer green

    // Create particle with two vertical pathways: left and right
    const createParticle = (): Particle => {
      let xPos: number;
      if (Math.random() < 0.5) {
        // Left column: 5% to 20% of canvas width
        xPos = canvas.width * 0.05 + Math.random() * (canvas.width * 0.15);
      } else {
        // Right column: 80% to 95% of canvas width
        xPos = canvas.width * 0.8 + Math.random() * (canvas.width * 0.15);
      }
      return {
        x: xPos,
        y: canvas.height + 40, // start below the bottom edge
        size: 15 + Math.random() * 30, // increased size range for variety
        opacity: 0.8 + Math.random() * 0.2,
        velocity: {
          x: 0, // primarily vertical motion
          y: upwardSpeed - Math.random() * 2,
        },
        scale: 1,
        phase: Math.random() * Math.PI * 2,
        rotation: Math.random() * 360,
        rotationSpeed: -2 + Math.random() * 4,
      };
    };

    let emissionAccumulator = 0;

    const animate = (timestamp: number) => {
      const deltaTime = (timestamp - lastTime.current) / 16; // ~60 FPS
      lastTime.current = timestamp;

      // Clear the canvas and fill with black
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Optional: a subtle aura at the bottom center
      const auraRadius = 120;
      const auraX = canvas.width / 2;
      const auraY = canvas.height - 50;
      const auraGradient = ctx.createRadialGradient(
        auraX,
        auraY,
        0,
        auraX,
        auraY,
        auraRadius
      );
      auraGradient.addColorStop(0, 'rgba(57,255,20,0.25)');
      auraGradient.addColorStop(0.8, 'rgba(57,255,20,0.05)');
      auraGradient.addColorStop(1, 'rgba(57,255,20,0)');
      ctx.fillStyle = auraGradient;
      ctx.beginPath();
      ctx.arc(auraX, auraY, auraRadius, 0, Math.PI * 2);
      ctx.fill();

      // Emit new particles until reaching the maximum
      emissionAccumulator += emissionRate * deltaTime;
      while (emissionAccumulator >= 1 && particles.current.length < maxParticles) {
        particles.current.push(createParticle());
        emissionAccumulator -= 1;
      }

      // Update and draw each particle
      particles.current = particles.current.filter((particle) => {
        particle.phase += 0.03;
        particle.scale = 1 + 0.1 * Math.sin(particle.phase);
        particle.y += particle.velocity.y;
        particle.rotation += particle.rotationSpeed;

        // Remove if particle goes off the top of the canvas
        if (particle.y < -100) return false;

        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.scale(particle.scale, particle.scale);
        ctx.rotate((particle.rotation * Math.PI) / 180);

        // Draw a radial glow for a soft halo effect
        const glowRadius = particle.size * 1.2;
        const radialGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
        radialGradient.addColorStop(0, 'rgba(57,255,20,0.4)');
        radialGradient.addColorStop(1, 'rgba(57,255,20,0)');
        ctx.fillStyle = radialGradient;
        ctx.beginPath();
        ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Draw the main plus sign shape
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = gradient;
        const armLength = particle.size;
        const armWidth = particle.size * 0.3;
        ctx.fillRect(-armLength / 2, -armWidth / 2, armLength, armWidth);
        ctx.fillRect(-armWidth / 2, -armLength / 2, armWidth, armLength);

        // Draw a white core for extra contrast
        ctx.fillStyle = 'white';
        ctx.globalAlpha = particle.opacity * 0.8;
        const coreArmLength = armLength * 0.5;
        const coreArmWidth = armWidth * 0.5;
        ctx.fillRect(-coreArmLength / 2, -coreArmWidth / 2, coreArmLength, coreArmWidth);
        ctx.fillRect(-coreArmWidth / 2, -coreArmLength / 2, coreArmWidth, coreArmLength);

        ctx.restore();
        return true;
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className="fixed inset-0 z-20 pointer-events-none bg-black"
    />
  );
};

export default HealingAnimation;
function updateCanvasSize(this: Window, _ev: UIEvent) {
    throw new Error('Function not implemented.');
}

