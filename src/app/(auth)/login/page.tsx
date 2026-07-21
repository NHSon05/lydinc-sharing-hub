'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    startTransition(async () => {
      try {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setErrorMessage('Email hoặc mật khẩu không chính xác.');
          return;
        }

        router.push(callbackUrl);
        router.refresh();
      } catch {
        setErrorMessage('Email hoặc mật khẩu không chính xác.');
      }
    });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-zinc-950 text-white selection:bg-purple-500 selection:text-white px-4">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 translate-y-1/2 w-100 h-100 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <main className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-md text-xs font-medium text-zinc-400 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            Internal Portal
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            LYDINC <span className="bg-linear-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">TaskHub</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-2">Đăng nhập tài khoản nội bộ</p>
        </div>

        <div className="p-8 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {errorMessage && (
              <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-medium flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="ten@lydinc.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/80 text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5" htmlFor="password">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/80 text-sm transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 w-full py-3 px-4 rounded-xl bg-white text-zinc-950 font-semibold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-6">
          Chỉ dành cho nhân sự được cấp quyền. Mọi hoạt động đều được ghi log.
        </p>
      </main>
    </div>
  );
}
