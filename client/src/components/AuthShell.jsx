import { Shield, Lock } from 'lucide-react';

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen px-4 py-8 text-gray-900 md:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-lg lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative flex flex-col justify-between overflow-hidden border-b-2 border-gray-200 p-8 lg:border-b-0 lg:border-r-2">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50" />
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-lg border-2 border-blue-300 bg-blue-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-blue-700">
              <Shield className="h-4 w-4" />
              TaskTeam
            </div>
            <h1 className="mt-8 text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent md:text-6xl">
              Team work,
              <span className="block text-gray-700">without the drift.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-gray-600 md:text-lg">
              Manage projects, assign tasks, and keep each role focused on exactly what they can do.
            </p>
          </div>
          <div className="relative z-10 mt-12 grid gap-3 text-sm font-medium text-gray-700 md:grid-cols-3">
            <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 flex items-center gap-2">
              <Lock className="h-4 w-4 text-blue-600" />
              JWT auth
            </div>
            <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600" />
              Role controls
            </div>
            <div className="rounded-lg border-2 border-cyan-200 bg-cyan-50 p-4 flex items-center gap-2">
              <svg className="h-4 w-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2 1m2-1l-2-1m2 1v2.5" />
              </svg>
              Drag & drop
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md rounded-xl border-2 border-gray-200 bg-gradient-to-b from-gray-50 to-blue-50 p-6 shadow-lg md:p-8">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">{subtitle}</p>
              <h2 className="mt-2 text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{title}</h2>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
