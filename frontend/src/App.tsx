import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyPage from './pages/VerifyPage';
import ProtectedRoute from './components/common/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Routes */}
          <Route
            path="/verify"
            element={
              <ProtectedRoute>
                <VerifyPage />
              </ProtectedRoute>
            }
          />

          {/* Temporary placeholders - we'll build these next */}
          <Route path="/listings" element={<div>Listings Page (Coming Soon)</div>} />
          <Route path="/profile" element={<div>Profile Page (Coming Soon)</div>} />
          <Route path="/messages" element={<div>Messages Page (Coming Soon)</div>} />
          <Route path="/favorites" element={<div>Favorites Page (Coming Soon)</div>} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;