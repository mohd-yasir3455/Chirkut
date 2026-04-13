// src/components/CounterAnimation.jsx
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CounterAnimation = ({ count, isLoading = false }) => {
  const displayRef = useRef(null);

  useEffect(() => {
    if (!displayRef.current) return;

    const animateCount = () => {
      const element = displayRef.current;
      const currentValue = parseInt(element.textContent) || 0;
      
      if (currentValue === count) return;

      const duration = 500;
      const start = currentValue;
      const range = count - start;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuad = progress => 1 - (1 - progress) * (1 - progress);
        const current = Math.round(start + range * easeOutQuad(progress));
        
        element.textContent = current;

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    };

    animateCount();
  }, [count]);

  return (
    <div className="counter-container">
      <div className="counter-wrapper">
        <motion.div
          className="counter-display"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          <h1
            ref={displayRef}
            className="counter-number"
          >
            0
          </h1>
        </motion.div>
        
        <motion.p
          className="counter-label"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Thank You Moments
        </motion.p>
      </div>

      {isLoading && (
        <div className="spinner" />
      )}

      <style>{`
        .counter-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }

        .counter-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .counter-display {
          background: var(--gradient-soft);
          padding: 40px 60px;
          border-radius: 30px;
          box-shadow: 0 10px 40px rgba(255, 181, 216, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          min-width: 200px;
          text-align: center;
          animation: float 4s ease-in-out infinite;
        }

        .counter-number {
          margin: 0;
          color: white;
          font-size: clamp(32px, 8vw, 72px);
          font-weight: 700;
          letter-spacing: -2px;
          line-height: 1;
        }

        .counter-label {
          color: var(--text-secondary);
          font-size: 16px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @media (max-width: 640px) {
          .counter-display {
            padding: 30px 40px;
            min-width: auto;
          }

          .counter-number {
            font-size: 48px;
          }

          .counter-label {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default CounterAnimation;
