import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

/** Mobile app shell: scrollable content + fixed bottom tab bar. */
export default function Layout() {
  return (
    <div className="app-shell">
      <main className="app-main"><Outlet /></main>
      <BottomNav />
    </div>
  );
}
