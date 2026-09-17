import AppHeader from '../components/AppHeader';
import { EmptyState } from '../components/StateViews';

export default function NotFoundPage() {
  return (
    <>
      <AppHeader />
      <EmptyState icon="🧭" title="Page not found" message="The page you're looking for doesn't exist." actionLabel="Go home" actionTo="/" />
    </>
  );
}
