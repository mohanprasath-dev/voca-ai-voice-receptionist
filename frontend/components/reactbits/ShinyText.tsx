'use client';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export const ShinyText = ({ text, disabled = false, speed = 5, className = '' }: ShinyTextProps) => {
  const animationDuration = `${speed}s`;

  return (
    <div
      className={`relative inline-block overflow-hidden bg-[linear-gradient(120deg,rgba(255,255,255,0)_40%,rgba(255,255,255,0.8)_50%,rgba(255,255,255,0)_60%)] bg-[length:200%_100%] bg-clip-text text-transparent ${disabled ? '' : 'animate-shine'} ${className}`}
      style={{ animationDuration }}
    >
      {text}
    </div>
  );
};
