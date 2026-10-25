import { Card } from '@/components/ui/Card';

const colorMap = {
  primary: 'dashboard-icon-blue',
  accent: 'dashboard-icon-cyan',
  success: 'dashboard-icon-green',
  navy: 'dashboard-icon-slate',
  warning: 'dashboard-icon-orange',
};

export function DashboardCard({ label, value, icon: Icon, trend, color = 'primary' }) {
  return (
    <Card className="dashboard-stat-card relative min-h-44 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-600">{label}</p>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-800">{value}</p>
        </div>
        <div className={`dashboard-stat-icon flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${colorMap[color]}`}>
          <Icon className="h-7 w-7" />
        </div>
      </div>
      {trend && <span className="mt-3 inline-block text-xs font-semibold text-emerald-600">{trend}</span>}
    </Card>
  );
}
