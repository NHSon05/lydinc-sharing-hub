import { redirect } from 'next/navigation';
import Link from 'next/link';

import { auth } from '@/auth';
import { LogoutButton } from '@/components/auth/LogoutButton';

type NavLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user;
  const isAdmin = user.role === 'ADMIN';

  const navLinks: NavLink[] = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
    },
    {
      href: '/projects',
      label: 'Dự án',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
    },
    {
      href: '/tasks',
      label: 'Nhiệm vụ',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      href: '/departments',
      label: 'Phòng ban',
      adminOnly: true,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      href: '/users',
      label: 'Thành viên',
      adminOnly: true,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  const filteredLinks = navLinks.filter((link) => !link.adminOnly || isAdmin);

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-500/10 border-red-500/20 text-red-400';
      case 'MANAGER':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      default:
        return 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400';
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900/40 backdrop-blur-md flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          {/* Logo Brand */}
          <div className="h-16 flex items-center px-6 border-b border-zinc-800">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-xl font-extrabold tracking-wider bg-linear-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                LYDINC <span className="bg-linear-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">TaskHub</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {filteredLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all duration-200 text-sm font-medium"
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* User Mini Profile in Sidebar Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-bold text-purple-400">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-zinc-200 truncate">{user.name}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-800 bg-zinc-900/20 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Icon (Placeholder/Actionable) */}
            <button className="md:hidden text-zinc-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden md:block">
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize tracking-wider bg-zinc-800/40 border-zinc-700/60 text-zinc-400">
                Làm việc hiệu quả
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wider ${getRoleBadgeClass(user.role)}`}>
              {user.role}
            </span>
            <LogoutButton />
          </div>
        </header>

        {/* Children/Main view */}
        <main className="flex-1 overflow-y-auto bg-zinc-950 p-6 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
