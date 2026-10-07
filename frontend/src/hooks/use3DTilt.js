import { useRef, useEffect } from 'react';

/**
 * Hook to apply 3D Gyroscope/Tilt effect on mousemove matching app3d.js
 */
export function use3DTilt(maxTilt = 12, translateY = -8, scale = 1.02) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(${translateY}px) scale3d(${scale}, ${scale}, ${scale})`;
    };

    const handleMouseEnter = () => {
      el.style.transition = 'transform 0.1s ease-out';
    };

    const handleMouseLeave = () => {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)';
      el.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [maxTilt, translateY, scale]);

  return ref;
}
