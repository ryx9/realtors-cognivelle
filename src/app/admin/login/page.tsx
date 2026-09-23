'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { RefreshCw, Shield, Briefcase, User, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { UserRole } from '@/types/database';

export default function AdminLoginPage() {
  const router = useRouter();
  const { signInWithPassword, signUp, signInAsDemoRole, isConfigured } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('admin@cognivellerealtors.com');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        const { error: signUpErr } = await signUp(email, password, {
          fullName: fullName || email.split('@')[0],
          role: selectedRole,
        });
        if (signUpErr) throw new Error(signUpErr);

        setSuccess(`Account registered as ${selectedRole.toUpperCase()}. Redirecting…`);
        setTimeout(() => {
          if (selectedRole === 'client') {
            router.push('/');
          } else {
            router.push('/admin');
          }
        }, 1000);
      } else {
        const { error: signInErr } = await signInWithPassword(email, password);
        if (signInErr) throw new Error(signInErr);
        router.push('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async (roleToUse: UserRole) => {
    setLoading(true);
    setError(null);
    try {
      await signInAsDemoRole(roleToUse);
      if (roleToUse === 'client') {
        router.push('/');
      } else {
        router.push('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-background border border-border px-4 py-2.5 text-xs font-medium text-foreground placeholder-muted focus:outline-none focus:border-foreground transition-colors';
  const labelClass = 'block text-[10px] font-bold tracking-widest uppercase text-muted mb-1';

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-background">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
            <span className="font-display italic text-sm font-bold text-accent tracking-wider px-2 py-0.5 border border-accent/40 group-hover:bg-accent group-hover:text-background transition-colors">
              CVR
            </span>
            <span className="font-sans font-extrabold tracking-[0.2em] text-sm text-foreground uppercase">
              Cognivelle Realtors
            </span>
          </Link>
          <p className="text-[10px] uppercase tracking-widest text-muted">
            Global Advisory &amp; Operations Portal
          </p>
        </div>

        <div className="border border-border bg-card p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
            <div>
              <h2 className="font-display text-2xl font-black uppercase text-foreground">
                {isSignUp ? 'Create Profile' : 'Authorized Access'}
              </h2>
              <p className="text-xs text-muted mt-0.5">
                {isConfigured ? 'Supabase Authentication & RBAC Active' : 'Sign in to access your portfolio console'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/30 text-accent flex items-center justify-center">
              {selectedRole === 'admin' ? <Shield className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
            </div>
          </div>

          {/* Quick Demo One-Click Access Cards */}
          <div className="mb-6 p-3.5 bg-background border border-border/80 rounded-sm">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-accent mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant One-Click Demo Personas:</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoSignIn('admin')}
                className="p-2 border border-border hover:border-amber-400 bg-card hover:bg-amber-500/5 text-center transition-all group"
              >
                <span className="block text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                  Admin
                </span>
                <span className="block text-[9px] text-muted group-hover:text-foreground">
                  Full Control
                </span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoSignIn('agent')}
                className="p-2 border border-border hover:border-cyan-400 bg-card hover:bg-cyan-500/5 text-center transition-all group"
              >
                <span className="block text-[10px] font-bold text-cyan-500 uppercase tracking-wider">
                  Advisor
                </span>
                <span className="block text-[9px] text-muted group-hover:text-foreground">
                  Elena Rostova
                </span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoSignIn('client')}
                className="p-2 border border-border hover:border-emerald-400 bg-card hover:bg-emerald-500/5 text-center transition-all group"
              >
                <span className="block text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                  Client
                </span>
                <span className="block text-[9px] text-muted group-hover:text-foreground">
                  VIP Buyer
                </span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 border border-red-300 bg-red-50 text-red-700 text-xs mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className={labelClass}>Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Elena Rostova"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Account Role</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('admin')}
                      className={`py-2 px-1 text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        selectedRole === 'admin'
                          ? 'bg-foreground text-background border-foreground'
                          : 'bg-background text-muted border-border hover:text-foreground'
                      }`}
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('agent')}
                      className={`py-2 px-1 text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        selectedRole === 'agent'
                          ? 'bg-foreground text-background border-foreground'
                          : 'bg-background text-muted border-border hover:text-foreground'
                      }`}
                    >
                      Advisor
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('client')}
                      className={`py-2 px-1 text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        selectedRole === 'client'
                          ? 'bg-foreground text-background border-foreground'
                          : 'bg-background text-muted border-border hover:text-foreground'
                      }`}
                    >
                      Client
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className={labelClass}>Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cognivellerealtors.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-foreground text-background font-bold text-xs tracking-widest uppercase hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Credentials…</span>
                </>
              ) : isSignUp ? (
                `Create ${selectedRole.toUpperCase()} Account`
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <div className="flex items-center justify-between text-xs px-1">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setSuccess(null);
            }}
            className="text-muted hover:text-foreground transition-colors font-medium"
          >
            {isSignUp ? 'Already registered? Sign In' : 'Need an account? Register Role'}
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-muted hover:text-foreground transition-colors font-medium"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Public Site</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

