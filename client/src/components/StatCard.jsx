import { TrendingUp, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function StatCard({ label, value, tone = 'slate' }) {
  const tones = {
    slate: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      label: 'text-blue-600',
      value: 'text-blue-900',
      icon: TrendingUp
    },
    sky: {
      bg: 'bg-cyan-50',
      border: 'border-cyan-200',
      label: 'text-cyan-600',
      value: 'text-cyan-900',
      icon: TrendingUp
    },
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      label: 'text-emerald-600',
      value: 'text-emerald-900',
      icon: CheckCircle
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      label: 'text-amber-600',
      value: 'text-amber-900',
      icon: Clock
    },
    rose: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      label: 'text-rose-600',
      value: 'text-rose-900',
      icon: AlertCircle
    }
  };

  const tone_config = tones[tone];
  const Icon = tone_config.icon;

  return (
    <div className={`rounded-lg border-2 ${tone_config.bg} ${tone_config.border} p-6 shadow-sm transition hover:shadow-md`}>
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
