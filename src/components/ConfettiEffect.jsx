// src/components/ConfettiEffect.jsx
import React, { useEffect } from 'react';

const ConfettiEffect = ({ trigger, duration = 3000 }) => {
  const [showConfetti, setShowConfetti] = React.useState(false);

  useEffect(() => {
    if (trigger) {
      setShowConfetti(true);
      
      // Use the global confetti from CDN
      if (typeof confetti !== 'undefined') {
        confetti({
          particleCount: 150,
          spread: 360,
          duration: duration,
          disableForReducedMotion: true,
        });
      }
      
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [trigger, duration]);

  return null;
};

export default ConfettiEffect;
