import { useEffect, useState } from 'react';

export default function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(getCountdown(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getCountdown(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  function getCountdown(date) {
    const diff = new Date(date).getTime() - Date.now();
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }

  return (
    <div className="countdown-grid" aria-live="polite">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="countdown-card">
          <div className="countdown-number">{String(value).padStart(2, '0')}</div>
          <div className="countdown-label">{unit}</div>
        </div>
      ))}
    </div>
  );
}
