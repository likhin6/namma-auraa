
interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export default function Logo({ className = '', variant = 'dark' }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="NAMMA AURAA"
      className={`block h-auto w-full object-contain ${variant === 'light' ? 'brightness-0 invert' : ''} ${className}`}
    />
  );
}
