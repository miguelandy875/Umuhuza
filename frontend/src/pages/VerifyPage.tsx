import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { CheckCircle, Mail, Phone, AlertCircle } from 'lucide-react';

interface VerificationForm {
  email_code: string;
  phone_code: string;
}

export default function VerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<string>('both');

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<VerificationForm>();

  useEffect(() => {
    // Get verification method from navigation state
    const state = location.state as any;
    if (state?.verification_method) {
      setVerificationMethod(state.verification_method);
    }
  }, [location]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const shouldVerifyEmail = verificationMethod === 'email' || verificationMethod === 'both';
  const shouldVerifyPhone = verificationMethod === 'phone' || verificationMethod === 'both';

  const handleVerifyEmail = async (code: string) => {
    try {
      const response = await authApi.verifyEmail(code);
      toast.success('Email verified successfully!');
      
      // Refresh user data
      const updatedUser = await authApi.getProfile();
      updateUser(updatedUser);
      
      return response;
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Verification failed';
      toast.error(errorMsg);
      throw error;
    }
  };

  const handleVerifyPhone = async (code: string) => {
    try {
      const response = await authApi.verifyPhone(code);
      toast.success('Phone verified successfully!');
      
      // Refresh user data
      const updatedUser = await authApi.getProfile();
      updateUser(updatedUser);

      if (response.is_fully_verified) {
        toast.success('Account fully verified! 🎉');
        setTimeout(() => navigate('/'), 2000);
      }
      
      return response;
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Verification failed';
      toast.error(errorMsg);
      throw error;
    }
  };

  const onSubmit = async (data: VerificationForm) => {
    setIsLoading(true);
    
    try {
      // Verify email if needed and not already verified
      if (shouldVerifyEmail && !user.email_verified && data.email_code) {
        await handleVerifyEmail(data.email_code);
      }
      
      // Verify phone if needed and not already verified
      if (shouldVerifyPhone && !user.phone_verified && data.phone_code) {
        await handleVerifyPhone(data.phone_code);
      }
      
      // Check if we should navigate away
      if (user.email_verified || user.phone_verified) {
        setTimeout(() => navigate('/'), 1500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async (type: 'email' | 'phone') => {
    try {
      await authApi.resendCode(type);
      toast.success(`Verification code sent to your ${type}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to resend code');
    }
  };

  const handleSkip = () => {
    toast('You can verify your account later from your profile', { icon: 'ℹ️' });
    navigate('/');
  };

  const isFullyVerified = user.email_verified && user.phone_verified;
  const canSkip = !isFullyVerified;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-primary-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Verify Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {verificationMethod === 'both' && 'Verification codes sent to your email and phone'}
            {verificationMethod === 'email' && 'Verification code sent to your email'}
            {verificationMethod === 'phone' && 'Verification code sent to your phone'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Email Verification */}
          {shouldVerifyEmail && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold">Email Verification</h3>
                {user.email_verified && (
                  <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                )}
              </div>
              
              {!user.email_verified ? (
                <>
                  <Input
                    label={`Code sent to ${user.email}`}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    error={errors.email_code?.message}
                    {...register('email_code', {
                      required: shouldVerifyEmail && !user.email_verified ? 'Email code is required' : false
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => handleResendCode('email')}
                    className="text-sm text-primary-600 hover:text-primary-500 mt-2"
                  >
                    Resend code
                  </button>
                </>
              ) : (
                <p className="text-green-600 text-sm flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Email verified
                </p>
              )}
            </div>
          )}

          {/* Phone Verification */}
          {shouldVerifyPhone && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold">Phone Verification</h3>
                {user.phone_verified && (
                  <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                )}
              </div>
              
              {!user.phone_verified ? (
                <>
                  <Input
                    label={`Code sent to ${user.phone_number}`}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    error={errors.phone_code?.message}
                    {...register('phone_code', {
                      required: shouldVerifyPhone && !user.phone_verified ? 'Phone code is required' : false
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => handleResendCode('phone')}
                    className="text-sm text-primary-600 hover:text-primary-500 mt-2"
                  >
                    Resend code
                  </button>
                </>
              ) : (
                <p className="text-green-600 text-sm flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Phone verified
                </p>
              )}
            </div>
          )}

          {/* Info Box */}
          {!isFullyVerified && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Why verify?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Build trust with other users</li>
                  <li>Access all platform features</li>
                  <li>Increase response rate on listings</li>
                  <li>Get verified badge on profile</li>
                </ul>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isFullyVerified ? (
            <div className="space-y-3">
              <Button type="submit" fullWidth isLoading={isLoading}>
                Verify Account
              </Button>
              
              {canSkip && (
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={handleSkip}
                >
                  Skip for Now
                </Button>
              )}
            </div>
          ) : (
            <Button
              type="button"
              fullWidth
              onClick={() => navigate('/')}
            >
              Continue to Dashboard
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}