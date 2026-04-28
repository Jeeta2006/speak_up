import { Sector, SectorStyle, ReportStatus } from '../types';

export const DB_KEY = 'speakup_reports_v2';
export const API_BASE = '';

export function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${Math.max(0, seconds)}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getSectorStyle(cat: Sector): SectorStyle {
  switch (cat) {
    case 'Education':
      return { cls: 'pill-blue', text: '🎓 Education' };
    case 'Healthcare':
      return { cls: 'pill-green', text: '🏥 Healthcare' };
    case 'BBMP/Infra':
      return { cls: 'pill-amber', text: '🚧 BBMP/Infra' };
    case 'Police/Other':
      return { cls: 'pill-red', text: '👮 Police/Other' };
    default:
      return { cls: 'pill-red', text: '👮 Police/Other' };
  }
}

export function getStatusColor(status: ReportStatus): string {
  switch (status) {
    case 'Verified':
      return 'var(--green)';
    case 'Review':
      return 'var(--amber)';
    default:
      return 'var(--red)';
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

export function getOrCreateDeviceToken(): string {
  let token = localStorage.getItem('speakup_device_token');
  if (!token) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomStr = '';
    for (let i = 0; i < 8; i++) {
      randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    token = 'DEV-' + randomStr;
    localStorage.setItem('speakup_device_token', token);
  }
  return token;
}
