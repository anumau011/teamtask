import { TrendingUp, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function StatCard({ label, value, tone = 'slate' }) {
  const tones = {
    slate: {
      bg: 'bg-white',
      border: 'border-l-slate-400',
      label: 'text-gray-600',
      value: 'text-gray-950',
      icon: TrendingUp
    },
    sky: {
      bg: 'bg-white',
      border: 'border-l-sky-400',
      label: 'text-gray-600',
      value: 'text-gray-950',
      icon: TrendingUp
    },
    emerald: {
      bg: 'bg-white',
      border: 'border-l-emerald-400',
      label: 'text-gray-600',
      value: 'text-gray-950',
      icon: CheckCircle
    },
    amber: {
      bg: 'bg-white',
      border: 'border-l-amber-400',
      label: 'text-gray-600',
      value: 'text-gray-950',
      icon: Clock
    },
    rose: {
      bg: 'bg-white',
      border: 'border-l-rose-400',
      label: 'text-gray-600',
      value: 'text-gray-950',
      icon: AlertCircle
    }
  };

  const tone_config = tones[tone];
  const Icon = tone_config.icon;

  return (
    <div className={`rounded-lg border-2 border-gray-300 border-l-8 ${tone_config.bg} ${tone_config.border} p-6 shadow-sm transition hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className={`text-xs font-bold uppercase tracking-[0.2em] ${tone_config.label}`}>{label}</div>
          <div className={`mt-3 text-4xl font-bold ${tone_config.value}`}>{value}</div>
        </div>
        <Icon className={`h-8 w-8 ${tone_config.label} opacity-70`} />
      </div>
    </div>
  );
}
