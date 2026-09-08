import { Link } from 'react-router-dom';

export function Logo({ className = '', variant = 'dark' }: { className?: string; variant?: 'dark' | 'light' }) {
  const textColor = variant === 'dark' ? 'text-neutral-900' : 'text-white';
  const dotColor = 'text-packtoday-500';

  return (
    <Link to="/" className={`inline-flex items-center gap-2 font-extrabold tracking-tight ${textColor} ${className}`}>
      <span className="text-2xl leading-none">
        Pack<span className={dotColor}>Today</span>
      </span>
      <span className={`inline-block w-1.5 h-1.5 rounded-full bg-packtoday-500 ${dotColor}`} />
    </Link>
  );
}
