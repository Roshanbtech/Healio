import React, { useEffect, useRef, useState } from 'react';

interface BaseParticle {
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

interface GreenPlusParticle extends BaseParticle {
  type: 'greenPlus';
}

interface RedWhitePlusParticle extends BaseParticle {
  type: 'redWhitePlus';
}

interface BubbleParticle extends BaseParticle {
  type: 'bubble';
  color: string;
}

type Particle = GreenPlusParticle | RedWhitePlusParticle | BubbleParticle;

const HealingAnimation: React.FC<{ isActive?: boolean }> = ({ isActive = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrameId = useRef<number>();
  const lastTime = useRef<number>(0);

  // Enhanced values for a premium healing effect with bubbling
  const emissionRate = 0.65; // Increased for more particles including bubbles
  const maxParticles = 140; // Increased to accommodate bubbles
  const upwardSpeed = -1.3; // Adjusted for smoother ascent
  
  // Mixed size distribution for visual hierarchy
  // Some smaller, some larger for depth
  const greenSizeSmall = 4;  // Smaller sizes for background particles
  const greenSizeLarge = 22; // Larger sizes for foreground particles
  const redSizeSmall = 3;    // Smaller sizes for background particles
  const redSizeLarge = 18;   // Larger sizes for foreground particles
  const bubbleSizeMin = 2;   // Very small bubbles
  const bubbleSizeMax = 10;  // Medium-sized bubbles

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

    // Enhanced gradient for modern premium look
    const greenGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    greenGradient.addColorStop(0, '#00ff88');  // bright green
    greenGradient.addColorStop(0.5, '#39ff14'); // vibrant neon green
    greenGradient.addColorStop(1, '#aaffaa');  // softer green

    // Function to get a random position with improved distribution
    const getRandomPosition = (): { x: number, y: number } => {
      // Create a more natural particle flow with gaussian-like distribution
      const centerBias = Math.pow(Math.random(), 1.5) * Math.sign(Math.random() - 0.5);
      const x = canvas.width / 2 + centerBias * (canvas.width * 0.45);
      
      // Varied starting heights for more natural emergence
      const y = canvas.height + Math.random() * 60;
      
      return { x, y };
    };

    // Function to get bubble positions (more spread out)
    const getBubblePosition = (): { x: number, y: number } => {
      // Wider distribution for bubbles to create bubbling effect from bottom
      const width = canvas.width * 0.7;
      const x = (canvas.width - width) / 2 + Math.random() * width;
      const y = canvas.height + Math.random() * 30;
      
      return { x, y };
    };

    // Get random green color for bubbles
    const getRandomGreenColor = (): string => {
      const r = Math.floor(Math.random() * 100);
      const g = 180 + Math.floor(Math.random() * 75);
      const b = Math.floor(Math.random() * 100);
      const a = 0.4 + Math.random() * 0.4;
      return `rgba(${r},${g},${b},${a})`;
    };

    // Create green plus particle with size variation
    const createGreenPlusParticle = (): GreenPlusParticle => {
      const pos = getRandomPosition();
      // 70% chance of smaller particle, 30% chance of larger particle
      const isSmall = Math.random() < 0.7;
      const size = isSmall 
        ? greenSizeSmall + Math.random() * 6 
        : greenSizeLarge - 5 + Math.random() * 5;
      
      return {
        type: 'greenPlus',
        x: pos.x,
        y: pos.y,
        size: size,
        opacity: 0.65 + Math.random() * 0.35,
        velocity: {
          x: -0.6 + Math.random() * 1.2,
          // Smaller particles move faster upward
          y: upwardSpeed - Math.random() * (isSmall ? 1.6 : 1.0),
        },
        scale: 1,
        phase: Math.random() * Math.PI * 2,
        rotation: Math.random() * 360,
        rotationSpeed: -1 + Math.random() * 2,
      };
    };

    // Create red/white plus particle with size variation
    const createRedWhitePlusParticle = (): RedWhitePlusParticle => {
      const pos = getRandomPosition();
      // 70% chance of smaller particle, 30% chance of larger particle
      const isSmall = Math.random() < 0.7;
      const size = isSmall 
        ? redSizeSmall + Math.random() * 5 
        : redSizeLarge - 4 + Math.random() * 4;
      
      return {
        type: 'redWhitePlus',
        x: pos.x,
        y: pos.y,
        size: size,
        opacity: 0.65 + Math.random() * 0.35,
        velocity: {
          x: -0.6 + Math.random() * 1.2,
          // Smaller particles move faster upward
          y: upwardSpeed - Math.random() * (isSmall ? 1.6 : 1.0),
        },
        scale: 1,
        phase: Math.random() * Math.PI * 2,
        rotation: Math.random() * 360,
        rotationSpeed: -1 + Math.random() * 2,
      };
    };

    // Create bubble particle for bubbling effect
    const createBubbleParticle = (): BubbleParticle => {
      const pos = getBubblePosition();
      return {
        type: 'bubble',
        x: pos.x,
        y: pos.y,
        size: bubbleSizeMin + Math.random() * (bubbleSizeMax - bubbleSizeMin),
        opacity: 0.3 + Math.random() * 0.4,
        velocity: {
          x: -0.3 + Math.random() * 0.6, // Slight horizontal drift
          y: -0.8 - Math.random() * 1.2, // Slower upward movement for bubbles
        },
        scale: 1,
        phase: Math.random() * Math.PI * 2,
        rotation: 0, // Bubbles don't rotate
        rotationSpeed: 0,
        color: getRandomGreenColor(),
      };
    };

    let emissionAccumulator = 0;

    const animate = (timestamp: number) => {
      const deltaTime = (timestamp - lastTime.current) / 16; // ~60 FPS
      lastTime.current = timestamp;

      // Clear the canvas and fill with deep black for premium contrast
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Enhanced aura effect at the bottom center
      const auraRadius = 220; // Increased radius
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
      auraGradient.addColorStop(0, 'rgba(130,255,130,0.18)'); // Slightly stronger center
      auraGradient.addColorStop(0.5, 'rgba(130,255,130,0.09)');
      auraGradient.addColorStop(1, 'rgba(130,255,130,0)');
      ctx.fillStyle = auraGradient;
      ctx.beginPath();
      ctx.arc(auraX, auraY, auraRadius, 0, Math.PI * 2);
      ctx.fill();

      // Emit new particles with balanced distribution
      emissionAccumulator += emissionRate * deltaTime;
      while (emissionAccumulator >= 1 && particles.current.length < maxParticles) {
        const rand = Math.random();
        // 45% chance for green plus, 25% chance for red/white plus, 30% chance for bubbles
        if (rand < 0.45) {
          particles.current.push(createGreenPlusParticle());
        } else if (rand < 0.7) {
          particles.current.push(createRedWhitePlusParticle());
        } else {
          particles.current.push(createBubbleParticle());
        }
        emissionAccumulator -= 1;
      }

      // Update and draw each particle with enhanced effects
      particles.current = particles.current.filter((particle) => {
        particle.phase += 0.035; // Slightly slower pulse
        
        // Bubbles have more pronounced pulsing
        if (particle.type === 'bubble') {
          particle.scale = 1 + 0.25 * Math.sin(particle.phase);
          
          // Add a slight wiggle to bubble paths
          particle.velocity.x += (Math.random() - 0.5) * 0.05;
          
          // Dampen horizontal velocity to prevent wild movement
          particle.velocity.x *= 0.98;
        } else {
          particle.scale = 1 + 0.18 * Math.sin(particle.phase);
        }
        
        particle.y += particle.velocity.y;
        particle.x += particle.velocity.x;
        
        if (particle.type !== 'bubble') {
          particle.rotation += particle.rotationSpeed;
        }
        
        // Fade out particles as they reach the top
        if (particle.y < canvas.height * 0.3) {
          particle.opacity *= 0.97;
        }

        // Remove if particle goes off the top or sides of the canvas, or becomes too transparent
        if (particle.y < -60 || particle.x < -60 || particle.x > canvas.width + 60 || particle.opacity < 0.1) return false;

        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.scale(particle.scale, particle.scale);
        
        if (particle.type !== 'bubble') {
          ctx.rotate((particle.rotation * Math.PI) / 180);
        }

        if (particle.type === 'greenPlus') {
          // Enhanced glow effect for green plus
          const glowRadius = particle.size * 2;
          const radialGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
          radialGradient.addColorStop(0, `rgba(57,255,20,${0.5 * particle.opacity})`);
          radialGradient.addColorStop(1, 'rgba(57,255,20,0)');
          ctx.fillStyle = radialGradient;
          ctx.beginPath();
          ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
          ctx.fill();

          // Draw the main plus sign shape with improved proportions
          ctx.globalAlpha = particle.opacity;
          ctx.fillStyle = greenGradient;
          const armLength = particle.size * 1.1; // Slightly longer arms
          const armWidth = particle.size * 0.4; // Slightly wider arms
          ctx.fillRect(-armLength / 2, -armWidth / 2, armLength, armWidth);
          ctx.fillRect(-armWidth / 2, -armLength / 2, armWidth, armLength);

          // Enhanced white core for extra premium look
          ctx.fillStyle = 'white';
          ctx.globalAlpha = particle.opacity * 0.9;
          const coreArmLength = armLength * 0.45;
          const coreArmWidth = armWidth * 0.45;
          ctx.fillRect(-coreArmLength / 2, -coreArmWidth / 2, coreArmLength, coreArmWidth);
          ctx.fillRect(-coreArmWidth / 2, -coreArmLength / 2, coreArmWidth, coreArmLength);
        } else if (particle.type === 'redWhitePlus') {
          // Enhanced glow for red/white plus
          const glowRadius = particle.size * 2;
          const radialGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
          radialGradient.addColorStop(0, `rgba(255,50,50,${0.4 * particle.opacity})`);
          radialGradient.addColorStop(1, 'rgba(255,50,50,0)');
          ctx.fillStyle = radialGradient;
          ctx.beginPath();
          ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw the white background with improved proportions
          ctx.globalAlpha = particle.opacity;
          const armLength = particle.size * 1.1; // Slightly longer arms
          const armWidth = particle.size * 0.4; // Slightly wider arms
          
          // White plus background with slight shadow for depth
          ctx.shadowColor = 'rgba(255,0,0,0.4)';
          ctx.shadowBlur = 3;
          ctx.fillStyle = 'white';
          ctx.fillRect(-armLength / 2, -armWidth / 2, armLength, armWidth);
          ctx.fillRect(-armWidth / 2, -armLength / 2, armWidth, armLength);
          ctx.shadowBlur = 0;
          
          // Thicker red border for premium look
          ctx.strokeStyle = 'red';
          ctx.lineWidth = particle.size * 0.15;
          ctx.beginPath();
          // Horizontal line
          ctx.moveTo(-armLength / 2, -armWidth / 2 + armWidth / 2);
          ctx.lineTo(armLength / 2, -armWidth / 2 + armWidth / 2);
          // Vertical line
          ctx.moveTo(-armWidth / 2 + armWidth / 2, -armLength / 2);
          ctx.lineTo(-armWidth / 2 + armWidth / 2, armLength / 2);
          ctx.stroke();
          
          // Enhanced red center dot
          ctx.fillStyle = 'red';
          ctx.beginPath();
          ctx.arc(0, 0, particle.size * 0.18, 0, Math.PI * 2);
          ctx.fill();
        } else if (particle.type === 'bubble') {
          // Draw bubble
          ctx.globalAlpha = particle.opacity;
          
          // Outer glow for bubble
          const glowRadius = particle.size * 1.5;
          const radialGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
          radialGradient.addColorStop(0, particle.color);
          radialGradient.addColorStop(1, 'rgba(100,255,100,0)');
          ctx.fillStyle = radialGradient;
          ctx.beginPath();
          ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
          ctx.fill();
          
          // Main bubble
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Highlight to give 3D bubble effect
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.beginPath();
          const highlightSize = particle.size * 0.4;
          const offsetX = -particle.size * 0.2;
          const offsetY = -particle.size * 0.2;
          ctx.arc(offsetX, offsetY, highlightSize, 0, Math.PI * 2);
          ctx.fill();
        }

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
