import { useState } from 'react';
import { Copy, Check, User, Mail, Key, ShieldAlert, BarChart3, Code } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const [copied, setCopied] = useState(false);

  const copyUserId = async () => {
    if (user?.id) {
      await navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <section className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="mt-2 text-gray-600">Your authenticated account details.</p>
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border-2 border-gray-300 bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-gray-700">
              <User className="h-4 w-4" />
              Name
            </div>
            <div className="mt-2 text-gray-900 font-semibold">{user?.name}</div>
          </div>
          <div className="rounded-lg border-2 border-gray-300 bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-gray-700">
              <Mail className="h-4 w-4" />
              Email
            </div>
            <div className="mt-2 text-gray-900 font-semibold">{user?.email}</div>
          </div>
          <div className="rounded-lg border-2 border-gray-300 bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-gray-700">
              <Key className="h-4 w-4" />
              User ID
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="font-mono text-sm text-gray-900">{user?.id}</div>
              <button
                type="button"
                onClick={copyUserId}
                className="flex items-center gap-2 rounded-lg border-2 border-gray-400 bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700 transition hover:bg-gray-200"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="rounded-lg border-2 border-gray-300 bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-gray-700">
              <ShieldAlert className="h-4 w-4" />
              Role
            </div>
            <div className="mt-2">
              <span className="inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-bold text-gray-700 capitalize">
                {role}
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Access Notes</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border-l-4 border-gray-400 bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-gray-700 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 font-medium">
                <span className="font-bold text-gray-900">Admins</span> can manage users, projects, tasks, and roles.
              </p>
            </div>
          </div>
          <div className="rounded-lg border-l-4 border-gray-400 bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <BarChart3 className="h-5 w-5 text-gray-700 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 font-medium">
                <span className="font-bold text-gray-900">Project managers</span> can manage projects and task assignment inside their scope.
              </p>
            </div>
          </div>
          <div className="rounded-lg border-l-4 border-gray-400 bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <Code className="h-5 w-5 text-gray-700 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 font-medium">
                <span className="font-bold text-gray-900">Developers</span> can only work on tasks assigned to them.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
