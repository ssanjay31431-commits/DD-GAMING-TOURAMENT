import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import ParticleBackground from './components/ParticleBackground';
import ClickRippleEffect from './components/ClickRippleEffect';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import TournamentDetailModal from './components/TournamentDetailModal';
import RegisterModal from './components/RegisterModal';
import AudioWelcomeModal from './components/AudioWelcomeModal';
import WelcomeAnimationModal from './components/WelcomeAnimationModal';
import LoginSuccessTransitionModal from './components/LoginSuccessTransitionModal';

import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import Tournaments from './pages/Tournaments';
import Games from './pages/Games';
import Leaderboard from './pages/Leaderboard';
import Winners from './pages/Winners';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Live from './pages/Live';

const pageTransitionVariants = {
  initial: {
    opacity: 0,
    x: 30,
    scale: 0.98
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: {
    opacity: 0,
    x: -30,
    scale: 0.98,
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Frontend ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 max-w-xl mx-auto text-center space-y-4 my-20 bg-slate-900 border border-rose-500/40 rounded-3xl text-white shadow-2xl">
          <span className="text-4xl block">⚠️</span>
          <h2 className="font-heading font-black text-xl text-rose-300">DD GAMING APPLICATION NOTICE</h2>
          <p className="text-xs text-slate-300">A temporary display error occurred. Please click below to refresh and load the main website.</p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase shadow-lg"
          >
            Reload Website
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainContent() {
  const { activePage, isLoggedIn } = useApp();

  const renderPage = () => {
    // If route is /admin or ?admin=true, render Admin page directly
    if (window.location.pathname === '/admin' || window.location.search.includes('admin')) {
      return <Admin />;
    }

    if (activePage === 'login') {
      return <Login />;
    }

    switch (activePage) {
      case 'home':
      case 'rules':
        return <Home />;
      case 'how-it-works':
        return <HowItWorks />;
      case 'tournaments':
        return <Tournaments />;
      case 'games':
        return <Games />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'winners':
        return <Winners />;
      case 'live':
        return <Live />;
      case 'profile':
        return isLoggedIn ? <Profile initialTab="overview" /> : <Login />;
      case 'my-tournaments':
      case 'my-tickets':
        return isLoggedIn ? <Profile initialTab="myTournaments" /> : <Login />;
      case 'admin':
        return <Admin />;
      default:
        return <Home />;
    }
  };

  const currentKey = activePage || 'home';

  return (
    <div className="relative min-h-screen flex flex-col justify-between selection:bg-purple-500 selection:text-white overflow-x-hidden">
      <Navbar />
      
      <main className="flex-grow relative z-10 w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentKey}
            variants={pageTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />

      {/* Global Modals & Authentication Animations */}
      <ClickRippleEffect />
      <AudioWelcomeModal />
      <WelcomeAnimationModal />
      <LoginSuccessTransitionModal />
      <TournamentDetailModal />
      <RegisterModal />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ErrorBoundary>
        <ParticleBackground />
        <MainContent />
      </ErrorBoundary>
    </AppProvider>
  );
}
