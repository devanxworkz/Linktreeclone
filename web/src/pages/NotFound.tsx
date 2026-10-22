import { Link } from 'react-router-dom';
import { Button } from '../components/ui';
import { IconLogo } from '../components/icons';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 text-center">
      <span className="text-accent" style={{ fontSize: 40 }}><IconLogo /></span>
      <p className="mt-4 text-sm font-bold uppercase tracking-wide text-text-muted">404</p>
      <h1 className="mt-1 text-3xl font-extrabold">We couldn’t find that page</h1>
      <p className="mt-3 max-w-sm text-sm text-text-muted">
        The link may be broken, or the page may have been moved.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link to="/">
          <Button>Back home</Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="secondary">Go to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
