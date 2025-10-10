import { useState } from 'react';
import { ArrowLeft, Search, MapPin, Clock, AlertCircle, CheckCircle, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getIncidentTypeLabel, getSeverityColor, getStatusColor, formatDate } from '../lib/utils';

interface TrackReportProps {
  onBack: () => void;
}

type ReportData = {
  id: string;
  tracking_token: string;
  status: string;
  created_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
  incident_type?: string;
  description?: string;
  severity?: string;
  latitude: number;
  longitude: number;
  location_address: string | null;
  escalation_count?: number;
  assigned_authority?: {
    name: string;
    type: string;
    contact_number: string;
    address: string | null;
  };
};

export default function TrackReport({ onBack }: TrackReportProps) {
  const [trackingToken, setTrackingToken] = useState('');
  const [searching, setSearching] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [reportType, setReportType] = useState<'incident' | 'sos' | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setReportData(null);
    setReportType(null);

    if (!trackingToken.trim()) {
      setError('Please enter a tracking token');
      return;
    }

    setSearching(true);

    try {
      const { data: incident, error: incidentError } = await supabase
        .from('incidents')
        .select(
          `
          *,
          assigned_authority:authorities(name, type, contact_number, address)
        `
        )
        .eq('tracking_token', trackingToken.trim().toUpperCase())
        .maybeSingle();

      if (incident) {
        setReportData({
          ...incident,
          assigned_authority: incident.assigned_authority || undefined,
        });
        setReportType('incident');
        setSearching(false);
        return;
      }

      const { data: sos, error: sosError } = await supabase
        .from('sos_alerts')
        .select(
          `
          *,
          assigned_authority:authorities(name, type, contact_number, address)
        `
        )
        .eq('tracking_token', trackingToken.trim().toUpperCase())
        .maybeSingle();

      if (sos) {
        setReportData({
          ...sos,
          assigned_authority: sos.assigned_authority || undefined,
        });
        setReportType('sos');
        setSearching(false);
        return;
      }

      setError('No report found with this tracking token');
    } catch (err) {
      console.error(err);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Home
      </button>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Track Your Report</h2>

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Enter Your Tracking Token
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={trackingToken}
                onChange={(e) => setTrackingToken(e.target.value.toUpperCase())}
                placeholder="e.g. ABC12345"
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent uppercase tracking-wider font-mono"
                maxLength={8}
              />
              <button
                type="submit"
                disabled={searching}
                className="px-6 py-3 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {searching ? (
                  <>
                    <Search className="h-5 w-5 animate-spin" />
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>

      {reportData && (
        <div className="space-y-6 animate-slide-in-up">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-2xl transition-all duration-500">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {reportType === 'sos' ? 'SOS Alert' : 'Incident Report'}
                </h3>
                <p className="text-slate-600 text-sm">Token: {reportData.tracking_token}</p>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                  reportData.status
                )}`}
              >
                {reportData.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {reportType === 'incident' && (
              <>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Incident Type</p>
                    <p className="font-semibold text-slate-900">
                      {getIncidentTypeLabel(reportData.incident_type || '')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Severity</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getSeverityColor(
                        reportData.severity || 'medium'
                      )}`}
                    >
                      {(reportData.severity || 'medium').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-slate-600 mb-2">Description</p>
                  <p className="text-slate-900 bg-slate-50 p-4 rounded-lg">
                    {reportData.description}
                  </p>
                </div>
              </>
            )}

            <div className="space-y-4 mb-6">
              <TimelineItem
                icon={<Clock className="h-5 w-5" />}
                label="Reported"
                time={formatDate(reportData.created_at)}
                completed={true}
              />
              <TimelineItem
                icon={<CheckCircle className="h-5 w-5" />}
                label="Acknowledged"
                time={reportData.acknowledged_at ? formatDate(reportData.acknowledged_at) : 'Pending'}
                completed={!!reportData.acknowledged_at}
              />
              <TimelineItem
                icon={<CheckCircle className="h-5 w-5" />}
                label="Resolved"
                time={reportData.resolved_at ? formatDate(reportData.resolved_at) : 'Pending'}
                completed={!!reportData.resolved_at}
              />
            </div>

            {reportData.assigned_authority && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-900 mb-1">
                      Assigned to: {reportData.assigned_authority.name}
                    </p>
                    <p className="text-sm text-blue-800">
                      Contact: {reportData.assigned_authority.contact_number}
                    </p>
                    {reportData.assigned_authority.address && (
                      <p className="text-sm text-blue-800">
                        {reportData.assigned_authority.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {reportType === 'incident' && reportData.escalation_count && reportData.escalation_count > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-900 mb-1">
                      Report Escalated {reportData.escalation_count} time(s)
                    </p>
                    <p className="text-sm text-amber-800">
                      This report has been escalated to higher authorities due to urgency.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-2xl transition-all duration-500">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-slate-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-slate-900 mb-2">Incident Location</p>
                {reportData.location_address ? (
                  <p className="text-slate-600 mb-3">{reportData.location_address}</p>
                ) : (
                  <p className="text-slate-600 mb-3">
                    Lat: {reportData.latitude.toFixed(6)}, Lon: {reportData.longitude.toFixed(6)}
                  </p>
                )}
                <a
                  href={`https://www.google.com/maps?q=${reportData.latitude},${reportData.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-600 hover:text-rose-700 font-medium text-sm"
                >
                  View on Google Maps →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineItem({
  icon,
  label,
  time,
  completed,
}: {
  icon: React.ReactNode;
  label: string;
  time: string;
  completed: boolean;
}) {
  return (
    <div className="flex items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${
          completed ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
        }`}
      >
        {icon}
      </div>
      <div className="ml-4 flex-1">
        <p className={`font-semibold ${completed ? 'text-slate-900' : 'text-slate-500'}`}>
          {label}
        </p>
        <p className="text-sm text-slate-600">{time}</p>
      </div>
    </div>
  );
}
