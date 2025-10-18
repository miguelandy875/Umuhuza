import { Link } from 'react-router-dom';
import { Search, Home, Car, Shield, Zap } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';

export default function HomePage() {
  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Dream Property or Vehicle
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Direct connections. No middlemen. Fair prices.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-2 flex gap-2">
              <input
                type="text"
                placeholder="Search for houses, cars, land..."
                className="flex-1 px-4 py-3 text-gray-900 outline-none rounded"
              />
              <Button className="whitespace-nowrap">
                <Search className="w-5 h-5" />
                Search
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/listings?category=1" className="btn-secondary">
                <Home className="w-5 h-5" />
                Real Estate
              </Link>
              <Link to="/listings?category=4" className="btn-secondary">
                <Car className="w-5 h-5" />
                Vehicles
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose Umuhuza?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Verified Users</h3>
            <p className="text-gray-600">
              All users are verified through email and phone. Trade with confidence.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <Zap className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Direct Contact</h3>
            <p className="text-gray-600">
              Message sellers directly. No middlemen taking commissions.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <Home className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Listing</h3>
            <p className="text-gray-600">
              Post your property or vehicle in minutes. Reach thousands of buyers.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of buyers and sellers on Burundi's fastest-growing marketplace
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register">
              <Button variant="primary" className="text-lg px-8 py-3">
                Sign Up Free
              </Button>
            </Link>
            <Link to="/listings">
              <Button variant="outline" className="text-lg px-8 py-3">
                Browse Listings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-primary-600 mb-2">1,000+</div>
            <div className="text-gray-600">Active Listings</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
            <div className="text-gray-600">Verified Users</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary-600 mb-2">100+</div>
            <div className="text-gray-600">Daily Visits</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary-600 mb-2">50+</div>
            <div className="text-gray-600">Deals Closed</div>
          </div>
        </div>
      </div>
    </Layout>
  );
}