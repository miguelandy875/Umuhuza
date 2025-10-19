import type { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import VerificationBanner from '../common/VerificationBanner';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <VerificationBanner />  {/* Add this line */}
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}