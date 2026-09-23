'use client';

import AdminNav from '@/components/AdminNav';
import { useAuth } from '@/lib/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ShieldAlert, RefreshCw, ArrowLeft, LogOut, KeyRound } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, loading, signOut, signInAsDemoRole } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [loading, user, isLoginPage, router]);

  // If on login page, let it render directly
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-300">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
          <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
        </div>
        <p className="font-display font-bold text-sm tracking-widest uppercase text-white mb-1">
          Authenticating Session
        </p>
        <p className="text-xs text-slate-500">
          Verifying cryptographic credentials and operational role…
        </p>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null; // router.push will redirect
  }

  // Role check: Client accounts cannot access admin/advisor portals
  if (role === 'client') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full border border-slate-800 bg-slate-900/90 p-8 rounded-2xl shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center mb-5">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 inline-block mb-3">
            Access Restricted
          </span>

          <h2 className="text-xl font-bold text-white mb-2">
            Advisor or Admin Privileges Required
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            You are signed in as <span className="text-white font-semibold">{user.email}</span> with a{' '}
            <span className="text-amber-400 font-bold uppercase">Client</span> role. The administration portal is reserved for licensed real estate advisors and system administrators.
          </p>

          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2 text-left mb-4 p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Quick Switch Demo:</p>
                <button
                  type="button"
                  onClick={() => signInAsDemoRole('admin')}
                  className="mt-1 text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" />
                  Switch to Admin
                </button>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Advisor Demo:</p>
                <button
                  type="button"
                  onClick={() => signInAsDemoRole('agent')}
                  className="mt-1 text-xs text-cyan-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" />
                  Switch to Advisor
                </button>
              </div>
            </div>

            <Link
              href="/"
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Public Residences
            </Link>

            <button
              onClick={() => signOut()}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out of Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <AdminNav />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
