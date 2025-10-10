import { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, MapPin, CheckCircle, Loader, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateTrackingToken, getCurrentLocation, calculateDistance } from '../lib/utils';
import { saveOfflineReport, isOnline } from '../lib/offline';

interface SOSButtonProps {
  onBack: () => void;
}

export default function SOSButton({ onBack }: SOSButtonProps) {
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);
  const [trackingToken, setTrackingToken] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [showCountdown, setShowCountdown] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showCountdown && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (showCountdown && countdown === 0) {
      activateSOS();
    }
    return () => clearTimeout(timer);
  }, [countdown, showCountdown]);

  const startCountdown = () => {
    setShowCountdown(true);
    setCountdown(5);
  };

  const cancelCountdown = () => {
    setShowCountdown(false);
    setCountdown(5);
  };

  const findNearestAuthority = async (lat: number, lon: number) => {
    const { data: authorities } = await supabase
      .from('authorities')
      .select('*')
      .eq('is_active', true)
      .eq('type', 'police');

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

  const activateSOS = async () => {
    setActivating(true);
    setShowCountdown(false);

    try {
      const location = await getCurrentLocation();
      if (!location) {
        alert('Unable to get your location. Please enable location services.');
        setActivating(false);
        return;
      }

      const token = generateTrackingToken();

      const sosData = {
        latitude: location.latitude,
        longitude: location.longitude,
        status: 'active',
        tracking_token: token,
      };

      if (!isOnline()) {
        saveOfflineReport({
          type: 'sos',
          data: sosData,
          mediaFiles: [],
        });
        setTrackingToken(token);
        setActivated(true);
      } else {
        const nearestAuthority = await findNearestAuthority(location.latitude, location.longitude);

        const { error } = await supabase.from('sos_alerts').insert([
          {
            ...sosData,
            assigned_authority_id: nearestAuthority?.id || null,
          },
        ]);

        if (error) throw error;

        setTrackingToken(token);
        setActivated(true);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to activate SOS. Please try again.');
    } finally {
      setActivating(false);
    }
  };

  if (activated) {
    return (
      <div className="max-w-2xl mx-auto animate-scale-in">
        <div className="bg-white rounded-xl p-8 shadow-2xl border border-slate-200 animate-scale-in">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">SOS Alert Activated</h2>
            <p className="text-slate-600 mb-6">
              Your emergency alert has been sent to nearby authorities with your live location.
            </p>

            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600 animate-pulse" />
              </div>
              <p className="text-sm text-red-800 mb-4">
                Help is on the way. Stay safe and stay where you are if possible.
              </p>
              <p className="text-sm text-slate-600 mb-2">Your Tracking Token:</p>
              <p className="text-2xl font-bold text-slate-900 tracking-wider">{trackingToken}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-semibold text-blue-900 mb-1">Emergency Helplines</p>
                  <p className="text-sm text-blue-800">Women Helpline: 1091</p>
                  <p className="text-sm text-blue-800">Women in Distress: 181</p>
                  <p className="text-sm text-blue-800">Police: 100</p>
                </div>
              </div>
            </div>

            <button
              onClick={onBack}
              className="w-full bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showCountdown) {
    return (
      <div className="max-w-2xl mx-auto animate-scale-in">
        <div className="bg-white rounded-xl p-8 shadow-2xl border border-slate-200 animate-scale-in">
          <div className="text-center">
            <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <span className="text-6xl font-bold text-red-600">{countdown}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Activating SOS...</h2>
            <p className="text-slate-600 mb-6">
              Your emergency alert will be sent in {countdown} seconds
            </p>
            <button
              onClick={cancelCountdown}
              className="w-full bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-700 transition-colors"
            >
              Cancel
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

      <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Silent SOS</h2>
          <p className="text-slate-600 mb-8">
            Press the button below to send an immediate emergency alert with your live location to nearby police and authorities.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-bold text-amber-900 mb-3">How Silent SOS Works:</h3>
            <ul className="space-y-2 text-amber-800 text-sm">
              <li className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Instantly shares your live GPS location</span>
              </li>
              <li className="flex items-start">
                <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Alerts are sent to the nearest police station</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Works silently without making any noise</span>
              </li>
              <li className="flex items-start">
                <Phone className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>You receive a tracking token to share with trusted contacts</span>
              </li>
            </ul>
          </div>

          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-semibold text-sm">
              Use this only in emergency situations. False alerts may result in legal action.
            </p>
          </div>

          <button
            onClick={startCountdown}
            disabled={activating}
            className="w-full bg-red-600 text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {activating ? (
              <>
                <Loader className="h-6 w-6 animate-spin mr-3" />
                Activating SOS...
              </>
            ) : (
              <>
                <AlertTriangle className="h-6 w-6 mr-3" />
                Activate Emergency SOS
              </>
            )}
          </button>

          <p className="text-xs text-slate-500 mt-4">
            A 5-second countdown will start before activating
          </p>
        </div>
      </div>
    </div>
  );
}
