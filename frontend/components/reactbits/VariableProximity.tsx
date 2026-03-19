'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface VariableProximityProps {
  label: string;
  fromFontVariationSettings?: string;
  toFontVariationSettings?: string;
  containerRef: React.RefObject<HTMLElement | null>;
  radius?: number;
  falloff?: 'linear' | 'exponential' | 'gaussian';
  className?: string;
  onClick?: () => void;
}

export const VariableProximity = ({
  label,
  fromFontVariationSettings = "'wght' 400",
  toFontVariationSettings = "'wght' 900",
  containerRef,
  radius = 100,
  falloff = 'linear',
  className = '',
  onClick,
}: VariableProximityProps) => {
  const words = label.split(' ');
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <span className={`inline-block ${className}`} onClick={onClick}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block whitespace-nowrap">
          {word.split('').map((letter, letterIndex) => {
            const index = words.slice(0, wordIndex).join('').length + wordIndex + letterIndex;
            return (
              <Letter
                key={index}
                letter={letter}
                mousePos={mousePos}
                fromFontVariationSettings={fromFontVariationSettings}
                toFontVariationSettings={toFontVariationSettings}
                radius={radius}
                falloff={falloff}
              />
            );
          })}
          {wordIndex < words.length - 1 && '\u00A0'}
        </span>
      ))}
    </span>
  );
};

interface LetterProps {
  letter: string;
  mousePos: { x: number; y: number };
  fromFontVariationSettings: string;
  toFontVariationSettings: string;
  radius: number;
  falloff: string;
}

const Letter = ({
  letter,
  mousePos,
  fromFontVariationSettings,
  toFontVariationSettings,
  radius,
  falloff,
}: LetterProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [settings, setSettings] = useState(fromFontVariationSettings);

  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.sqrt(Math.pow(mousePos.x - centerX, 2) + Math.pow(mousePos.y - centerY, 2));

    if (distance < radius) {
      const strength = 1 - distance / radius;
      // This is a simplification, ideally we interpolate between from and to settings
      setSettings(strength > 0.5 ? toFontVariationSettings : fromFontVariationSettings);
    } else {
      setSettings(fromFontVariationSettings);
    }
  }, [mousePos, radius, fromFontVariationSettings, toFontVariationSettings]);

  return (
    <span ref={ref} style={{ fontVariationSettings: settings }} className="inline-block">
      {letter}
    </span>
  );
};
