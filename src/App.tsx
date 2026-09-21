/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider, useAuth } from '@/src/context/AuthContext.tsx';
import { AppShell } from '@/src/components/layout/AppShell.tsx';
import { LoginPage } from '@/src/pages/LoginPage.tsx';

const AppContent: React.FC = () => {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-bold text-white shadow-lg animate-pulse text-sm">
            JW
          </div>
          <p className="text-xs text-slate-400 font-medium">Loading Jigaway Acquisition Hub...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return <AppShell />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

