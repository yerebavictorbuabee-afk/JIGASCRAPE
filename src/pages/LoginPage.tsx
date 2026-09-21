import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { Button } from '@/src/components/ui/Button.tsx';

export const LoginPage: React.FC = () => {
  const { login, useDemoSession, isLoading } = useAuth();
  const [email, setEmail] = useState('tariq@jigaway.com');
  const [password, setPassword] = useState('jigaway2026');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = await login(email, password);
    if (!result.success && result.error) {
      setErrorMessage(result.error);
    }
  };

  const handleDemoQuickLogin = () => {
    useDemoSession();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Jigaway Geometric Logo Mark */}
        <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center font-bold text-white shadow-lg mx-auto mb-4 tracking-tight text-lg">
          JW
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Jigaway Gulf Client Acquisition Hub
        </h2>
        <p className="mt-1.5 text-xs text-slate-400">
          Internal acquisition operating system • Restricted authorized access
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-200">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jigaway Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@jigaway.com"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-slate-800"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Workspace
            </Button>
          </form>

          {/* Demo Credentials Helper */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                  Phase 1 Demo Credentials
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-mono">Dev Mode</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Pre-configured with Jigaway operator session (Tariq Al-Mansoor). Click below to bypass or sign in instantly.
              </p>
              <button
                type="button"
                onClick={handleDemoQuickLogin}
                className="w-full text-center text-xs font-semibold text-red-600 hover:text-red-700 hover:underline pt-1"
              >
                Quick Enter with Demo Session →
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-4 text-center text-xs text-slate-500">
          Organization scoped to <span className="font-medium text-slate-400">Jigaway Gulf</span> • Supabase RLS Protected
        </p>
      </div>
    </div>
  );
};
