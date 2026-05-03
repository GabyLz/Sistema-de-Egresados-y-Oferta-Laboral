import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon?: string;
  trend?: string;
  color?: 'primary' | 'success' | 'warning' | 'error';
  onClick?: () => void;
}

export default function KpiCard({ title, value, icon = '📊', trend, color = 'primary', onClick }: KpiCardProps) {
  const colorMap = {
    primary: 'var(--accent)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    error: 'var(--error)',
  };

  return (
    <div className={`kpi-card ${onClick ? 'clickable' : ''}`} onClick={onClick}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-label">{title}</div>
      <div className="kpi-value" style={{ color: colorMap[color] }}>
        {value}
      </div>
      {trend !== undefined && (
        <div className="kpi-trend" style={{ color: trend.startsWith('+') ? 'var(--success)' : 'var(--error)' }}>
          {trend}
        </div>
      )}
    </div>
  );
}
