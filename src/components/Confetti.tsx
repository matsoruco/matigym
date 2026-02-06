import { useEffect } from 'react';

export const Confetti = () => {
  useEffect(() => {
    const colors = ['#445a14', '#586e26', '#778c43', '#96ac60', '#b7cd7f'];
    const confettiCount = 50;
    const confettiElements: HTMLElement[] = [];

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 3 + 's';
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
      document.body.appendChild(confetti);
      confettiElements.push(confetti);
    }

    return () => {
      confettiElements.forEach(el => el.remove());
    };
  }, []);

  return null;
};
