import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const useRequireVerification = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const checkVerification = (action: string = 'perform this action'): boolean => {
    if (!isAuthenticated) {
      toast.error('Please login first');
      navigate('/login');
      return false;
    }

    if (!user?.is_verified) {
      toast.error(`Please verify your account to ${action}`, {
        duration: 4000,
      });
      navigate('/verify');
      return false;
    }

    return true;
  };

  return { checkVerification, isVerified: user?.is_verified || false };
};