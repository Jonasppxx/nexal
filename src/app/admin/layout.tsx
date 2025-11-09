'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from '@/src/lib/auth-client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      console.log('No session found, redirecting to home');
      router.push('/');
      return;
    }

    const role = (session.user as any).role;
    console.log('Admin layout - Current role:', role);

    if (role !== 'admin') {
      if (!sessionChecked) {
        setSessionChecked(true);
        (async () => {
          try {
            const res = await fetch('/api/auth/get-session', { cache: 'no-store' });
            if (res.ok) {
              const json = await res.json();
              if (json?.user?.role === 'admin') {
                window.location.reload();
                return;
              }
            }
          } catch (e) {
            console.error('Error fetching session:', e);
          }
          console.error('Access denied: Not an admin');
          router.push('/');
        })();
        return;
      }
      router.push('/');
      return;
    }
  }, [session, isPending, router, sessionChecked]);

  if (isPending || !session) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if ((session.user as any).role !== 'admin' && sessionChecked) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-red-400">Access Denied</div>
      </div>
    );
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <p className="text-sm text-gray-400 mt-1">{session.user.email}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info & Sign out */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              {session.user.name?.[0]?.toUpperCase() || session.user.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session.user.name || 'Admin'}
              </p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
          <button
            onClick={async () => {
              await signOut();
              router.push('/');
            }}
            className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
