import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import Layout from '../components/layout/Layout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { ArrowLeft, Save, User as UserIcon } from 'lucide-react';

interface ProfileFormData {
  user_firstname: string;
  user_lastname: string;
  phone_number: string;
}

const schema = yup.object({
  user_firstname: yup.string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  user_lastname: yup.string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  phone_number: yup.string()
    .required('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),
});

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      user_firstname: user?.user_firstname || '',
      user_lastname: user?.user_lastname || '',
      phone_number: user?.phone_number || '',
    },
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      toast.success('Profile updated successfully!');
      setUser(data.user);
      navigate('/profile');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateMutation.mutate(data);
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UserIcon className="w-8 h-8 text-primary-600" />
            Edit Profile
          </h1>
          <p className="text-gray-600 mt-2">
            Update your personal information
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Profile Picture */}
          <div className="card space-y-6">
            <h2 className="text-xl font-semibold">Profile Picture</h2>

            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-3xl">
                {user.user_firstname[0]}{user.user_lastname[0]}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Profile pictures will be available in a future update.
                </p>
                <p className="text-sm text-gray-500">
                  For now, we display your initials as your profile picture.
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="card space-y-6">
            <h2 className="text-xl font-semibold">Personal Information</h2>

            <Input
              label="First Name *"
              placeholder="Enter your first name"
              error={errors.user_firstname?.message}
              {...register('user_firstname')}
            />

            <Input
              label="Last Name *"
              placeholder="Enter your last name"
              error={errors.user_lastname?.message}
              {...register('user_lastname')}
            />

            <Input
              label="Phone Number *"
              type="tel"
              placeholder="+25779123456"
              error={errors.phone_number?.message}
              {...register('phone_number')}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Changing your phone number will require re-verification.
              </p>
            </div>
          </div>

          {/* Account Information (Read-only) */}
          <div className="card space-y-6">
            <h2 className="text-xl font-semibold">Account Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="input bg-gray-100 cursor-not-allowed"
              />
              <p className="mt-1 text-sm text-gray-500">
                Email cannot be changed. Contact support if you need to update it.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Role
              </label>
              <input
                type="text"
                value={user.user_role.charAt(0).toUpperCase() + user.user_role.slice(1)}
                disabled
                className="input bg-gray-100 cursor-not-allowed capitalize"
              />
              <p className="mt-1 text-sm text-gray-500">
                Your role is automatically managed by the system.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={updateMutation.isPending}
              className="flex-1"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
