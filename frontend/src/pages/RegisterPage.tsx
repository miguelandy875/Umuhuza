import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import type { RegisterData } from '../types';
import { UserPlus } from 'lucide-react';

const schema = yup.object({
  user_firstname: yup.string().required('First name is required'),
  user_lastname: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone_number: yup.string()
    .matches(/^\+257[0-9]{8}$/, 'Phone must start with +257 and have 8 digits')
    .required('Phone number is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  password_confirm: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm password'),
  verification_method: yup.string()
    .oneOf(['email', 'phone', 'both'])
    .required('Please select verification method'),
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      login(response.user, response.tokens);
      
      // Show different message based on verification method
      if (data.verification_method === 'both') {
        toast.success('Registration successful! Check your email and phone for verification codes.');
      } else if (data.verification_method === 'email') {
        toast.success('Registration successful! Check your email for verification code.');
      } else {
        toast.success('Registration successful! Check your phone for verification code.');
      }
      
      // Pass verification method to verify page
      navigate('/verify', { 
        state: { verification_method: data.verification_method }
      });
    } catch (error: any) {
      const errorData = error.response?.data;
      if (errorData) {
        Object.keys(errorData).forEach((key) => {
          const messages = errorData[key];
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(msg));
          } else {
            toast.error(messages);
          }
        });
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <UserPlus className="mx-auto h-12 w-12 text-primary-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                error={errors.user_firstname?.message}
                {...register('user_firstname')}
              />
              <Input
                label="Last Name"
                error={errors.user_lastname?.message}
                {...register('user_lastname')}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="+25779123456"
              error={errors.phone_number?.message}
              {...register('phone_number')}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              error={errors.password_confirm?.message}
              {...register('password_confirm')}
            />

            {/* Verification Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How would you like to verify your account?
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="email"
                    {...register('verification_method')}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-medium">Email Only</div>
                    <div className="text-sm text-gray-500">Verification code sent to email</div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="phone"
                    {...register('verification_method')}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-medium">Phone Only (SMS)</div>
                    <div className="text-sm text-gray-500">Verification code sent via SMS</div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="both"
                    defaultChecked
                    {...register('verification_method')}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-medium">Both (Recommended)</div>
                    <div className="text-sm text-gray-500">Verify via email and phone for maximum security</div>
                  </div>
                </label>
              </div>
              {errors.verification_method && (
                <p className="mt-1 text-sm text-red-600">{errors.verification_method.message}</p>
              )}
            </div>
          </div>
          {/* <Input
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              error={errors.password_confirm?.message}
              {...register('password_confirm')}
            />
          </div>

          

          <div className="flex items-start">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                Privacy Policy
              </Link>
            </label>
          </div> */}


          <Button type="submit" fullWidth isLoading={isLoading}>
            Create Account
          </Button>
        </form>
      </div>
    </div>
  );
}