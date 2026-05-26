// src/components/ConfettiEffect.jsx
import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

const ConfettiEffect = ({ trigger, duration = 3000 }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);

    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    if (!trigger) {
      return undefined;
    }

    setShowConfetti(true);

    const timer = window.setTimeout(() => {
      setShowConfetti(false);
    }, duration);

    return () => window.clearTimeout(timer);
  }, [trigger, duration]);

  if (!showConfetti) {
    return null;
  }

  return (
    <Confetti
      width={viewport.width}
      height={viewport.height}
      numberOfPieces={180}
      recycle={false}
      gravity={0.22}
      aria-label="Celebration confetti"
    />
  );
};

export default ConfettiEffect;
