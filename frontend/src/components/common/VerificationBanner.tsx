import { AlertCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useState, useEffect } from 'react';

export default function VerificationBanner() {
  const { user } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed in this session
    const isDismissed = sessionStorage.getItem('verification_banner_dismissed');
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('verification_banner_dismissed', 'true');
  };

  if (!user || user.is_verified || dismissed) return null;

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-yellow-900">
                {!user.email_verified && !user.phone_verified && 'Verify your account to unlock all features'}
                {(user.email_verified && !user.phone_verified) && 'Complete phone verification to unlock messaging'}
                {(!user.email_verified && user.phone_verified) && 'Complete email verification for full access'}
              </p>
              <p className="text-xs text-yellow-700 hidden sm:block">
                Verified users can post listings, contact sellers, and save favorites
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              to="/verify"
              className="text-sm font-medium text-yellow-900 hover:text-yellow-700 whitespace-nowrap px-3 py-1 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              Verify Now
            </Link>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-yellow-100 rounded"
              title="Dismiss"
            >
              <X className="w-4 h-4 text-yellow-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}