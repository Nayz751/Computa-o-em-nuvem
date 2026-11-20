import { Link } from 'react-router-dom';

export function Logo({ light, size = 'md' }: { light?: boolean; size?: 'md' | 'lg' }) {
  return (
    <Link to="/" className={`logo logo--${size}${light ? ' logo--light' : ''}`} aria-label="TraceMark — página inicial">
      Trace<span className="accent">Mark</span>
    </Link>
  );
}
