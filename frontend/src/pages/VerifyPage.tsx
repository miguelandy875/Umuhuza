import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { CheckCircle, Mail, Phone, Edit2, ArrowRight } from 'lucide-react';

type VerificationStep = 'email' | 'phone' | 'complete';

interface EmailForm {
  email_code: string;
}

interface PhoneForm {
  phone_code: string;
}

interface EditEmailForm {
  email: string;
}

interface EditPhoneForm {
  phone_number: string;
}

export default function VerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuthStore();
  const [step, setStep] = useState<VerificationStep>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const emailForm = useForm<EmailForm>();
  const phoneForm = useForm<PhoneForm>();
  const editEmailForm = useForm<EditEmailForm>();
  const editPhoneForm = useForm<EditPhoneForm>();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Determine initial step
    if (user.email_verified && !user.phone_verified) {
      setStep('phone');
    } else if (user.email_verified && user.phone_verified) {
      setStep('complete');
    } else {
      setStep('email');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleVerifyEmail = async (data: EmailForm) => {
    setIsLoading(true);
    try {
      await authApi.verifyEmail(data.email_code);
      
      // Refresh user data
      const updatedUser = await authApi.getProfile();
      updateUser(updatedUser);
      
      toast.success('Email verified! 📧');
      
      // Move to phone verification
      setStep('phone');
      emailForm.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Invalid code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhone = async (data: PhoneForm) => {
    setIsLoading(true);
    try {
      const response = await authApi.verifyPhone(data.phone_code);
      
      // Refresh user data
      const updatedUser = await authApi.getProfile();
      updateUser(updatedUser);
      
      toast.success('Phone verified! 📱');
      
      if (response.is_fully_verified) {
        setStep('complete');
        toast.success('Account fully verified! 🎉', { duration: 3000 });
        
        // Redirect after 2 seconds
        setTimeout(() => {
          const from = (location.state as any)?.from || '/';
          navigate(from);
        }, 2000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Invalid code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmail = async (data: EditEmailForm) => {
    setIsLoading(true);
    try {
      const response = await authApi.updateEmail(data.email);
      
      // Refresh user data
      const updatedUser = await authApi.getProfile();
      updateUser(updatedUser);
      
      toast.success('Email updated! New code sent.');
      setIsEditingEmail(false);
      editEmailForm.reset();
      
      // Show code in dev mode
      if (response.code) {
        toast(`Dev code: ${response.code}`, { duration: 10000 });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePhone = async (data: EditPhoneForm) => {
    setIsLoading(true);
    try {
      const response = await authApi.updatePhone(data.phone_number);
      
      // Refresh user data
      const updatedUser = await authApi.getProfile();
      updateUser(updatedUser);
      
      toast.success('Phone updated! New code sent.');
      setIsEditingPhone(false);
      editPhoneForm.reset();
      
      // Show code in dev mode
      if (response.code) {
        toast(`Dev code: ${response.code}`, { duration: 10000 });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update phone');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async (type: 'email' | 'phone') => {
    try {
      await authApi.resendCode(type);
      toast.success(`Code resent to your ${type}`);
    } catch (error: any) {
      toast.error('Failed to resend code');
    }
  };

  const handleSkip = () => {
    const from = (location.state as any)?.from || '/';
    navigate(from);
    toast('You can verify later from your profile', { icon: 'ℹ️' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header - Stays the same */}
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-primary-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Verify Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 'email' && 'Step 1 of 2: Verify your email'}
            {step === 'phone' && 'Step 2 of 2: Verify your phone'}
            {step === 'complete' && 'Verification complete!'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-2">
          <div className={`h-2 w-20 rounded-full ${step !== 'email' ? 'bg-green-500' : 'bg-primary-600'}`} />
          <div className={`h-2 w-20 rounded-full ${step === 'complete' ? 'bg-green-500' : step === 'phone' ? 'bg-primary-600' : 'bg-gray-200'}`} />
        </div>

        {/* EMAIL VERIFICATION STEP */}
        {step === 'email' && (
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary-600" />
                  <h3 className="font-semibold">Email Verification</h3>
                </div>
              </div>

              {!isEditingEmail ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Code sent to: <span className="font-medium">{user.email}</span>
                    <button
                      onClick={() => setIsEditingEmail(true)}
                      className="ml-2 text-primary-600 hover:text-primary-700"
                    >
                      <Edit2 className="w-4 h-4 inline" />
                    </button>
                  </p>

                  <form onSubmit={emailForm.handleSubmit(handleVerifyEmail)} className="space-y-4">
                    <Input
                      label="Enter 6-digit code"
                      placeholder="000000"
                      maxLength={6}
                      autoFocus
                      error={emailForm.formState.errors.email_code?.message}
                      {...emailForm.register('email_code', { required: 'Code is required' })}
                    />

                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => handleResendCode('email')}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        Resend code
                      </button>
                      <Button type="submit" isLoading={isLoading}>
                        Verify Email
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <form onSubmit={editEmailForm.handleSubmit(handleUpdateEmail)} className="space-y-4">
                  <Input
                    label="New Email Address"
                    type="email"
                    defaultValue={user.email}
                    error={editEmailForm.formState.errors.email?.message}
                    {...editEmailForm.register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsEditingEmail(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading} fullWidth>
                      Update & Send Code
                    </Button>
                  </div>
                </form>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={handleSkip}
            >
              Skip for Now
            </Button>
          </div>
        )}

        {/* PHONE VERIFICATION STEP */}
        {step === 'phone' && (
          <div className="space-y-6">
            {/* Email Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800">
                Email verified successfully!
              </p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary-600" />
                  <h3 className="font-semibold">Phone Verification</h3>
                </div>
              </div>

              {!isEditingPhone ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Code sent to: <span className="font-medium">{user.phone_number}</span>
                    <button
                      onClick={() => setIsEditingPhone(true)}
                      className="ml-2 text-primary-600 hover:text-primary-700"
                    >
                      <Edit2 className="w-4 h-4 inline" />
                    </button>
                  </p>

                  <form onSubmit={phoneForm.handleSubmit(handleVerifyPhone)} className="space-y-4">
                    <Input
                      label="Enter 6-digit code"
                      placeholder="000000"
                      maxLength={6}
                      autoFocus
                      error={phoneForm.formState.errors.phone_code?.message}
                      {...phoneForm.register('phone_code', { required: 'Code is required' })}
                    />

                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => handleResendCode('phone')}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        Resend code
                      </button>
                      <Button type="submit" isLoading={isLoading}>
                        Verify Phone
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <form onSubmit={editPhoneForm.handleSubmit(handleUpdatePhone)} className="space-y-4">
                  <Input
                    label="New Phone Number"
                    type="tel"
                    placeholder="+25779123456"
                    defaultValue={user.phone_number}
                    error={editPhoneForm.formState.errors.phone_number?.message}
                    {...editPhoneForm.register('phone_number', {
                      required: 'Phone is required',
                      pattern: {
                        value: /^\+257[0-9]{8}$/,
                        message: 'Phone must start with +257 and have 8 digits'
                      }
                    })}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsEditingPhone(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading} fullWidth>
                      Update & Send Code
                    </Button>
                  </div>
                </form>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={handleSkip}
            >
              Skip for Now
            </Button>
          </div>
        )}

        {/* COMPLETE STEP */}
        {step === 'complete' && (
          <div className="space-y-6">
            <div className="card text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                All Set! 
                
              </h3>
              <p className="text-gray-600 mb-6">
                Your account is fully verified. You now have access to all features!
              </p>
              <Button
                onClick={() => {
                  const from = (location.state as any)?.from || '/';
                  navigate(from);
                }}
                fullWidth
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Info Box */}
        {step !== 'complete' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Why verify?</strong> Verified accounts get more responses, access to all features, and build trust with other users.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}