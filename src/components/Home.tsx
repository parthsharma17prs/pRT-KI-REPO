import { AlertTriangle, FileText, Search, Phone } from 'lucide-react';

interface HomeProps {
  onNavigate: (view: 'home' | 'report' | 'track' | 'sos') => void;
}

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-rose-600 to-rose-700 rounded-2xl p-8 text-white shadow-xl">
        <h2 className="text-3xl font-bold mb-3">Welcome to Suraksha</h2>
        <p className="text-rose-100 text-lg mb-6">
          Your safety is our priority. Report incidents safely and anonymously, or get immediate help with our Silent SOS feature.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('report')}
            className="bg-white text-rose-600 px-6 py-3 rounded-lg font-semibold hover:bg-rose-50 transition-all shadow-md hover:shadow-lg"
          >
            Report an Incident
          </button>
          <button
            onClick={() => onNavigate('track')}
            className="bg-rose-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-900 transition-all shadow-md hover:shadow-lg"
          >
            Track Your Report
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ActionCard
          icon={<AlertTriangle className="h-8 w-8 text-red-600" />}
          title="Silent SOS"
          description="Send an immediate emergency alert with your live location to nearby authorities without making noise"
          buttonText="Activate SOS"
          buttonClass="bg-red-600 hover:bg-red-700 text-white"
          onClick={() => onNavigate('sos')}
        />

        <ActionCard
          icon={<FileText className="h-8 w-8 text-blue-600" />}
          title="Report Incident"
          description="Safely report incidents like harassment, domestic violence, child marriage, or healthcare denial"
          buttonText="File Report"
          buttonClass="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => onNavigate('report')}
        />

        <ActionCard
          icon={<Search className="h-8 w-8 text-slate-600" />}
          title="Track Report"
          description="Check the status of your submitted report using your tracking token"
          buttonText="Track Status"
          buttonClass="bg-slate-600 hover:bg-slate-700 text-white"
          onClick={() => onNavigate('track')}
        />

        <ActionCard
          icon={<Phone className="h-8 w-8 text-green-600" />}
          title="Emergency Helplines"
          description="Access national and state women helpline numbers for immediate assistance"
          buttonText="View Helplines"
          buttonClass="bg-green-600 hover:bg-green-700 text-white"
          onClick={() => {
            alert('National Women Helpline: 1091\nWomen in Distress: 181\nChild Helpline: 1098');
          }}
        />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-4">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <Step
            number="1"
            title="Report"
            description="Submit an incident report with details, location, and optional media"
          />
          <Step
            number="2"
            title="Automatic Routing"
            description="Your report is instantly sent to nearby police squads and NGOs"
          />
          <Step
            number="3"
            title="Track & Respond"
            description="Monitor your report status and receive updates from authorities"
          />
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-amber-900 mb-2">Offline Mode Support</h3>
        <p className="text-amber-800">
          You can file reports even without internet connection. Your reports will be saved locally and automatically uploaded once you're back online.
        </p>
      </div>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
  buttonText,
  buttonClass,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  buttonClass: string;
  onClick: () => void;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 mb-4">{description}</p>
      <button
        onClick={onClick}
        className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${buttonClass}`}
      >
        {buttonText}
      </button>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-rose-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
        {number}
      </div>
      <h4 className="font-bold text-slate-900 mb-2">{title}</h4>
      <p className="text-slate-600 text-sm">{description}</p>
    </div>
  );
}
