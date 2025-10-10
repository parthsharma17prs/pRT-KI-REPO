import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Image, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateTrackingToken, getCurrentLocation, calculateDistance } from '../lib/utils';
import { saveOfflineReport, isOnline } from '../lib/offline';

interface ReportIncidentProps {
  onBack: () => void;
}

const INCIDENT_TYPES = [
  { value: 'child_marriage', label: 'Child Marriage' },
  { value: 'domestic_violence', label: 'Domestic Violence' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'healthcare_denial', label: 'Healthcare Denial' },
  { value: 'other', label: 'Other' },
];

export default function ReportIncident({ onBack }: ReportIncidentProps) {
  const [incidentType, setIncidentType] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [contactPhone, setContactPhone] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [trackingToken, setTrackingToken] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    setLocationStatus('loading');
    const coords = await getCurrentLocation();
    if (coords) {
      setLocation(coords);
      setLocationStatus('success');
    } else {
      setLocationStatus('error');
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 3);
      setMediaFiles(files);
    }
  };

  const findNearestAuthority = async (lat: number, lon: number) => {
    const { data: authorities } = await supabase
      .from('authorities')
      .select('*')
      .eq('is_active', true);

    if (!authorities || authorities.length === 0) return null;

    let nearest = authorities[0];
    let minDistance = Infinity;

    authorities.forEach((auth) => {
      if (auth.latitude && auth.longitude) {
        const distance = calculateDistance(lat, lon, auth.latitude, auth.longitude);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = auth;
        }
      }
    });

    return nearest;
  };

  const determineSeverity = (type: string): string => {
    const severityMap: Record<string, string> = {
      child_marriage: 'critical',
      domestic_violence: 'high',
      harassment: 'medium',
      healthcare_denial: 'high',
      other: 'medium',
    };
    return severityMap[type] || 'medium';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!incidentType || !description || !location) {
      setError('Please fill in all required fields and enable location');
      return;
    }

    if (!isAnonymous && !contactPhone) {
      setError('Please provide a contact number or report anonymously');
      return;
    }

    setSubmitting(true);

    try {
      const token = generateTrackingToken();
      const severity = determineSeverity(incidentType);

      const reportData = {
        incident_type: incidentType,
        description,
        severity,
        latitude: location.latitude,
        longitude: location.longitude,
        is_anonymous: isAnonymous,
        contact_phone: isAnonymous ? null : contactPhone,
        tracking_token: token,
      };

      if (!isOnline()) {
        saveOfflineReport({
          type: 'incident',
          data: reportData,
          mediaFiles: [],
        });
        setTrackingToken(token);
        setSubmitted(true);
      } else {
        const nearestAuthority = await findNearestAuthority(location.latitude, location.longitude);

        const { error: insertError } = await supabase.from('incidents').insert([
          {
            ...reportData,
            assigned_authority_id: nearestAuthority?.id || null,
          },
        ]);

        if (insertError) throw insertError;

        setTrackingToken(token);
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Report Submitted Successfully</h2>
            <p className="text-slate-600 mb-6">
              Your report has been received and will be forwarded to the nearest authorities.
            </p>

            <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-6 mb-6">
              <p className="text-sm text-slate-600 mb-2">Your Tracking Token:</p>
              <p className="text-3xl font-bold text-slate-900 tracking-wider">{trackingToken}</p>
              <p className="text-sm text-slate-600 mt-2">
                Save this token to track your report status
              </p>
            </div>

            <button
              onClick={onBack}
              className="w-full bg-rose-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Home
      </button>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Report an Incident</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Incident Type *
            </label>
            <select
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              required
            >
              <option value="">Select incident type</option>
              {INCIDENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the incident in detail..."
              rows={5}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={getLocation}
                disabled={locationStatus === 'loading'}
                className="flex items-center px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {locationStatus === 'loading' ? (
                  <Loader className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <MapPin className="h-5 w-5 mr-2" />
                )}
                {locationStatus === 'loading' ? 'Getting Location...' : 'Get Current Location'}
              </button>
              {locationStatus === 'success' && (
                <span className="text-green-600 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-1" />
                  Location captured
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Upload Photos/Videos (Optional)
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleMediaChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
            {mediaFiles.length > 0 && (
              <p className="text-sm text-slate-600 mt-2">
                {mediaFiles.length} file(s) selected
              </p>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="mt-1 h-5 w-5 text-rose-600 border-slate-300 rounded focus:ring-rose-500"
              />
              <div>
                <span className="font-semibold text-slate-900">Report Anonymously</span>
                <p className="text-sm text-slate-600">
                  Your identity will not be shared with anyone
                </p>
              </div>
            </label>
          </div>

          {!isAnonymous && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Contact Phone Number *
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                required={!isAnonymous}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || locationStatus !== 'success'}
            className="w-full bg-rose-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {submitting ? (
              <>
                <Loader className="h-5 w-5 animate-spin mr-2" />
                Submitting Report...
              </>
            ) : (
              'Submit Report'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
