import { Link } from 'react-router-dom';
import { Home, Mail, Phone, Facebook, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Home className="w-6 h-6 text-primary-500" />
              <span className="text-xl font-bold text-white">Umuhuza</span>
            </div>
            <p className="text-sm">
              Connecting buyers and sellers of real estate and vehicles in Burundi. 
              No middlemen, just direct deals.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/listings" className="hover:text-primary-500">Browse Listings</Link></li>
              <li><Link to="/about" className="hover:text-primary-500">About Us</Link></li>
              <li><Link to="/how-it-works" className="hover:text-primary-500">How It Works</Link></li>
              <li><Link to="/pricing" className="hover:text-primary-500">Pricing</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/faq" className="hover:text-primary-500">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-primary-500">Contact Us</Link></li>
              <li><Link to="/privacy" className="hover:text-primary-500">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary-500">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:support@umuhuza.com" className="hover:text-primary-500">
                  support@umuhuza.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+257 79 123 456</span>
              </li>
            </ul>
            <div className="flex items-center gap-4 mt-4">
              <a href="#" className="hover:text-primary-500"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-primary-500"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-primary-500"><Instagram className="w-5 h-5" /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Umuhuza. All rights reserved. Made with ❤️ in Burundi 🇧🇮</p>
        </div>
      </div>
    </footer>
  );
}