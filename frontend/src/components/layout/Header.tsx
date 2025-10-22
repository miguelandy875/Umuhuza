import { Link } from "react-router-dom";
import { Home, User, LogOut, Menu, X, Plus } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { messagesApi } from "../../api/messages";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { data: unreadCount } = useQuery({
    queryKey: ["unread-count"],
    queryFn: messagesApi.getUnreadCount,
    enabled: isAuthenticated,
    refetchInterval: 10000, // Check every 10 seconds
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Home className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">
              {import.meta.env.VITE_SITE_NAME}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/listings"
              className="text-gray-700 hover:text-primary-600"
            >
              Browse Listings
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/listings/create"
                  className="flex items-center gap-1 text-gray-700 hover:text-primary-600"
                >
                  <Plus className="w-4 h-4" />
                  Post Listing
                </Link>
                <Link
                  to="/messages"
                  className="text-gray-700 hover:text-primary-600 relative"
                >
                  Messages
                  {unreadCount && unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/favorites"
                  className="text-gray-700 hover:text-primary-600"
                >
                  Favorites
                </Link>
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 text-gray-700 hover:text-primary-600"
                  >
                    <User className="w-5 h-5" />
                    <span>{user?.user_firstname}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-600 flex items-center gap-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600"
                >
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-4">
              <Link
                to="/listings"
                className="text-gray-700 hover:text-primary-600"
              >
                Browse Listings
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/listings/create"
                    className="text-gray-700 hover:text-primary-600"
                  >
                    Post Listing
                  </Link>
                  <Link
                    to="/messages"
                    className="text-gray-700 hover:text-primary-600"
                  >
                    Messages
                  </Link>
                  <Link
                    to="/favorites"
                    className="text-gray-700 hover:text-primary-600"
                  >
                    Favorites
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-primary-600"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left text-red-600 hover:text-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-primary-600"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary inline-block text-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
