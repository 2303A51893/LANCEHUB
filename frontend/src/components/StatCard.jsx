import React from 'react';

export default function StatCard({ title, value, icon: Icon, change, trend = 'up', color = 'blue' }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100'
  };

  const iconStyle = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-lg border ${iconStyle}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        {change && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trend === 'up'
                ? 'bg-emerald-50 text-emerald-700'
                : trend === 'down'
                ? 'bg-rose-50 text-rose-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
