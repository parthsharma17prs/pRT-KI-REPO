interface OfflineReport {
  id: string;
  type: 'incident' | 'sos';
  data: any;
  mediaFiles: string[];
  timestamp: number;
}

const STORAGE_KEY = 'offline_reports';

export function saveOfflineReport(report: Omit<OfflineReport, 'id' | 'timestamp'>): void {
  const reports = getOfflineReports();
  const newReport: OfflineReport = {
    ...report,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  reports.push(newReport);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function getOfflineReports(): OfflineReport[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function removeOfflineReport(id: string): void {
  const reports = getOfflineReports();
  const filtered = reports.filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function clearOfflineReports(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function isOnline(): boolean {
  return navigator.onLine;
}

export function setupOnlineListener(callback: () => void): () => void {
  window.addEventListener('online', callback);
  return () => window.removeEventListener('online', callback);
}
