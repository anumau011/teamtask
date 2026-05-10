import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const navLinkClass = ({ isActive }) =>
  `px-4 py-2 text-sm font-medium transition border-b-2 ${
    isActive 
      ? 'text-blue-600 border-blue-600' 
      : 'text-gray-600 border-transparent hover:text-blue-600'
  }`;

export default function AppLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen text-gray-900">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-gradient-to-r from-white to-blue-50/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link to="/dashboard" className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Work<span className="text-orange-500">Sync</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-2">
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/tasks" className={navLinkClass}>
              Tasks
            </NavLink>
            {role !== 'developer' ? (
              <NavLink to="/projects" className={navLinkClass}>
                Projects
              </NavLink>
            ) : null}
            <NavLink to="/profile" className={navLinkClass}>
              Profile
            </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden text-right md:block">
              <div className="text-sm font-semibold text-gray-900">{user?.name}</div>
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-blue-600">{role}</div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border-2 border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}
