import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_TOURNAMENTS,
  GAMES_LIST,
  INITIAL_LEADERBOARD,
  INITIAL_WINNERS,
  INITIAL_FAQS,
  DEFAULT_USER_PROFILE
} from '../data/initialData';
import {
  playClickSound,
  playPoolCueHitSound,
  playTabSelectSound,
  playSuccessChimeSound,
  playCoinSound,
  playErrorSound,
  toggleSoundMute,
  setSoundEnabledState,
  isSoundEnabled
} from '../utils/soundEffects';
import {
  fetchTournamentsAPI,
  fetchUserNotificationsAPI,
  markNotificationReadAPI,
  clearAllNotificationsAPI,
  loginUserAPI,
  registerUserAPI,
  googleLoginAPI,
  submitRegistrationAPI,
  updateUserProfileAPI,
  fetchMyProfileAPI,
  fetchMyRegistrationsAPI,
  markWelcomeSeenAPI,
  adminCreateTournamentAPI,
  adminUpdateTournamentAPI,
  adminDeleteTournamentAPI,
  adminLiveUpdateTournamentAPI,
  adminVerifyResultsAPI,
  uploadWinnerQRAPI,
  adminMarkPrizePaidAPI,
  fetchAuditLogsAPI,
  adminDeleteAllDataAPI
} from '../utils/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Authentication State (Default to logged in for seamless access unless explicitly logged out)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const saved = localStorage.getItem('dd_logged_in');
    if (saved === 'false') return false;
    if (saved === null) {
      localStorage.setItem('dd_logged_in', 'true');
      return true;
    }
    return true;
  });

  // Navigation State (Persist active page across reloads)
  const [activePage, setActivePage] = useState(() => {
    const saved = localStorage.getItem('dd_active_page');
    return saved || 'home';
  });

  const [pageParam, setPageParam] = useState(null);
  const [userRole, setUserRole] = useState('player');
  const [welcomeAnimationUser, setWelcomeAnimationUser] = useState(null);

  // Sound State
  const [soundActive, setSoundActive] = useState(() => {
    const pref = localStorage.getItem('dd_audio_preference');
    if (pref === 'disabled') {
      setSoundEnabledState(false);
      return false;
    }
    return true;
  });

  const setSoundActiveState = (enabled) => {
    setSoundEnabledState(enabled);
    setSoundActive(enabled);
  };

  const toggleSound = () => {
    const nextState = toggleSoundMute();
    setSoundActive(nextState);
    localStorage.setItem('dd_audio_preference', nextState ? 'enabled' : 'disabled');
  };

  const [showAudioModal, setShowAudioModal] = useState(() => {
    const choice = localStorage.getItem('dd_audio_choice');
    return !choice;
  });

  // User Profile State (Declared before effects that reference it)
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('dd_user_profile_v4');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.email) {
        return parsed;
      }
    }
    return DEFAULT_USER_PROFILE;
  });

  // Notifications State & Polling
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    async function loadNotifications() {
      if (isLoggedIn && userProfile?.email) {
        const notifs = await fetchUserNotificationsAPI(userProfile.email);
        if (notifs && Array.isArray(notifs)) {
          const clearedIds = new Set(JSON.parse(localStorage.getItem('dd_cleared_notif_ids') || '[]'));
          const merged = notifs.map(n => ({
            ...n,
            isRead: n.isRead || clearedIds.has(n.id)
          }));
          setNotifications(merged);
        }
      }
    }
    loadNotifications();
    const interval = setInterval(loadNotifications, 4000);
    return () => clearInterval(interval);
  }, [isLoggedIn, userProfile?.email]);

  const markNotificationRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      const existingCleared = JSON.parse(localStorage.getItem('dd_cleared_notif_ids') || '[]');
      localStorage.setItem('dd_cleared_notif_ids', JSON.stringify([...existingCleared, id]));
    } catch (_) {}
    await markNotificationReadAPI(id);
  };

  const clearAllNotifications = async () => {
    const unreadNotifs = notifications.filter(n => !n.isRead);

    // 1. Mark all locally in React state immediately
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

    // 2. Persist cleared IDs in localStorage so background 4s polling never restores them
    try {
      const existingCleared = JSON.parse(localStorage.getItem('dd_cleared_notif_ids') || '[]');
      const newCleared = Array.from(new Set([...existingCleared, ...notifications.map(n => n.id)]));
      localStorage.setItem('dd_cleared_notif_ids', JSON.stringify(newCleared));
    } catch (_) {}

    // 3. Clear via backend notifications API
    await clearAllNotificationsAPI(userProfile?.email || '', unreadNotifs);

    showToast('All notifications cleared', 'info');
  };

  const unreadNotificationCount = notifications.filter(n => !n.isRead).length;

  // Tournaments Data Store
  const [tournaments, setTournaments] = useState(() => {
    return INITIAL_TOURNAMENTS;
  });

function getRegistrationStartDateTime(startDate, startTime) {
  if (!startDate) return null;
  if (typeof startDate === 'object' && startDate instanceof Date) {
    return startDate;
  }

  const dateParts = String(startDate).split('T')[0].split('-').map(Number);
  if (dateParts.length !== 3 || isNaN(dateParts[0])) {
    const fallback = new Date(startDate);
    return isNaN(fallback.getTime()) ? null : fallback;
  }

  const year = dateParts[0];
  const month = dateParts[1] - 1;
  const day = dateParts[2];

  let hours = 0;
  let minutes = 0;

  if (startTime) {
    const match = String(startTime).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const ampm = match[3] ? match[3].toUpperCase() : null;
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    }
  }

  return new Date(year, month, day, hours, minutes, 0, 0);
}

function processTournamentsWithAutoOpen(dataList) {
  if (!Array.isArray(dataList)) return [];
  const now = new Date();
  return dataList.map(t => {
    if (t.status === 'Upcoming') {
      const startAt = t.registrationStartAt ? new Date(t.registrationStartAt) : getRegistrationStartDateTime(t.registrationStartDate, t.registrationStartTime);
      if (startAt && startAt <= now) {
        return { ...t, status: 'Registration Open' };
      }
    }
    return t;
  });
}

  // Fetch & Auto-Sync Tournaments from MongoDB backend
  useEffect(() => {
    async function loadTournaments() {
      const data = await fetchTournamentsAPI();
      if (data && Array.isArray(data)) {
        setTournaments(processTournamentsWithAutoOpen(data));
      }
    }
    loadTournaments();
    const interval = setInterval(loadTournaments, 3000);
    return () => clearInterval(interval);
  }, []);

  const [registrations, setRegistrations] = useState(() => {
    const saved = localStorage.getItem('dd_registrations_v4');
    return saved ? JSON.parse(saved) : [];
  });

  const [leaderboard] = useState(INITIAL_LEADERBOARD);
  const [winners] = useState(INITIAL_WINNERS);
  const [faqs] = useState(INITIAL_FAQS);

  // Modals & Active Selections
  const [selectedTournamentDetail, setSelectedTournamentDetail] = useState(null);
  const [selectedTournamentRegister, setSelectedTournamentRegister] = useState(null);

  // Toast Notification
  const [toast, setToast] = useState(null);

  // FEATURE 4 & 6: Sync current authenticated user data securely from backend on mount / session start
  useEffect(() => {
    async function syncUserData() {
      if (isLoggedIn && userProfile?.email) {
        const freshProfile = await fetchMyProfileAPI(userProfile.email);
        if (freshProfile && freshProfile.email) {
          setUserProfile(freshProfile);
        }
        const freshRegs = await fetchMyRegistrationsAPI(userProfile.email);
        if (freshRegs && Array.isArray(freshRegs)) {
          setRegistrations(freshRegs);
        }
      }
    }
    syncUserData();
  }, [isLoggedIn, userProfile?.email]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('dd_logged_in', isLoggedIn ? 'true' : 'false');
    if (isLoggedIn && activePage && activePage !== 'login') {
      localStorage.setItem('dd_active_page', activePage);
    }
  }, [isLoggedIn, activePage]);

  useEffect(() => {
    if (isLoggedIn && userProfile?.email) {
      localStorage.setItem('dd_user_profile_v4', JSON.stringify(userProfile));
    }
  }, [userProfile, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('dd_registrations_v4', JSON.stringify(registrations));
    }
  }, [registrations, isLoggedIn]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Protected Navigation Gateway
  const navigateTo = (page, param = null) => {
    playClickSound();
    
    // Require login for ALL pages
    if (!isLoggedIn && page !== 'login') {
      showToast('Please login to access DD Gaming!', 'info');
      setActivePage('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setActivePage(page);
    setPageParam(param);
    localStorage.setItem('dd_active_page', page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [authTransitionUser, setAuthTransitionUser] = useState(null);

  // Helper for starting auth session securely with post-login transition
  const handleAuthSuccess = async (user, isNewRegistration = false) => {
    setUserProfile(user);
    setIsLoggedIn(true);
    setActivePage('home');

    // Load ONLY this user's registrations from backend
    if (user?.email) {
      const userRegs = await fetchMyRegistrationsAPI(user.email);
      setRegistrations(userRegs);
    }

    // Trigger universal post-login arena animation for ALL customers (old and new)
    setAuthTransitionUser({ ...user, isNewRegistration });
    playSuccessChimeSound();
  };

  const finishAuthTransition = () => {
    if (authTransitionUser) {
      const user = authTransitionUser;
      const isNew = authTransitionUser.isNewRegistration;
      setAuthTransitionUser(null);

      // After post-login transition completes: Check if First-Time User or Returning User
      if (user && (user.hasSeenWelcome === false || isNew)) {
        setWelcomeAnimationUser(user);
      } else {
        showToast(`Welcome back, ${user?.name || 'Player'} 👋`, 'success');
      }

      if (!localStorage.getItem('dd_audio_choice')) {
        setShowAudioModal(true);
      }
    }
  };

  // LOGIN FUNCTION WITH STRICT CREDENTIAL VALIDATION
  const login = async (email, password) => {
    if (!email || !password || password.length < 4) {
      playErrorSound();
      showToast('Password must be at least 4 characters long.', 'error');
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }

    const apiResult = await loginUserAPI(email, password);

    if (apiResult && apiResult.success && apiResult.user) {
      await handleAuthSuccess(apiResult.user, false);
      return { success: true };
    }

    playErrorSound();
    const errorMsg = apiResult?.message || 'Incorrect password or account not found.';
    showToast(errorMsg, 'error');
    return { success: false, message: errorMsg };
  };

  // REGISTER NEW USER FUNCTION
  const registerUser = async (formData) => {
    const apiResult = await registerUserAPI(formData);

    if (apiResult && apiResult.success && apiResult.user) {
      await handleAuthSuccess(apiResult.user, true);
      return { success: true };
    }

    playErrorSound();
    const errorMsg = apiResult?.message || 'Registration failed.';
    showToast(errorMsg, 'error');
    return { success: false, message: errorMsg };
  };

  // FEATURE 6: PREVENT DATA MIXING ON ACCOUNT SWITCHING
  const logout = () => {
    playClickSound();
    setIsLoggedIn(false);
    setActivePage('login');
    setUserProfile(DEFAULT_USER_PROFILE);
    setRegistrations([]);
    setWelcomeAnimationUser(null);
    localStorage.removeItem('dd_user_profile_v4');
    localStorage.removeItem('dd_registrations_v4');
    localStorage.removeItem('dd_logged_in');
    localStorage.removeItem('dd_audio_choice');
    localStorage.removeItem('dd_active_page');
    localStorage.removeItem('dd_cleared_notif_ids');
    showToast('Logged out. Session data cleared.', 'info');
  };

  // FEATURE 3: CLOSE WELCOME ANIMATION & MARK HAS_SEEN_WELCOME IN MONGO DB
  const closeWelcomeAnimation = async () => {
    if (welcomeAnimationUser && welcomeAnimationUser.email) {
      await markWelcomeSeenAPI(welcomeAnimationUser.email);
      setUserProfile(prev => ({ ...prev, hasSeenWelcome: true }));
    }
    setWelcomeAnimationUser(null);
  };

  // OFFICIAL GOOGLE AUTHENTICATION HANDLER
  const googleLogin = async (authPayload) => {
    playSuccessChimeSound();
    let payload = {};
    if (typeof authPayload === 'string') {
      payload = { credential: authPayload };
    } else if (authPayload?.credential) {
      payload = { credential: authPayload.credential };
    } else if (authPayload?.access_token) {
      payload = { accessToken: authPayload.access_token };
    } else if (authPayload && typeof authPayload === 'object') {
      payload = authPayload;
    }

    const apiResult = await googleLoginAPI(payload);
    let googleUser;

    if (apiResult && apiResult.user) {
      googleUser = apiResult.user;
    } else {
      googleUser = {
        name: authPayload?.name || 'Google Player',
        gamingUsername: 'Google_8Ball_Pro',
        playerId: `DD-8B-${Math.floor(1000 + Math.random() * 9000)}`,
        email: authPayload?.email || 'player.google@gmail.com',
        phone: '',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        rank: 'UNRANKED',
        ddPoints: 50,
        totalTournamentsPlayed: 0,
        wins: 0,
        losses: 0,
        totalWinnings: 0,
        upiId: '',
        hasSeenWelcome: false,
        registeredTournaments: []
      };
    }

    await handleAuthSuccess(googleUser, false);
  };

  const openTournamentDetail = (tournament) => {
    if (!isLoggedIn) {
      showToast('Please login to view tournament details!', 'info');
      navigateTo('login');
      return;
    }
    if (tournament?.gameCode === '8ball' || tournament?.is8BallSpecial) {
      playPoolCueHitSound();
    } else {
      playClickSound();
    }
    setSelectedTournamentDetail(tournament);
  };

  const closeTournamentDetail = () => {
    playClickSound();
    setSelectedTournamentDetail(null);
  };

  const openRegistrationModal = (tournament) => {
    if (!isLoggedIn) {
      showToast('Please login to register for tournaments!', 'info');
      navigateTo('login');
      return;
    }
    if (tournament?.gameCode === '8ball' || tournament?.is8BallSpecial) {
      playPoolCueHitSound();
    } else {
      playClickSound();
    }
    setSelectedTournamentRegister(tournament);
  };

  const closeRegistrationModal = () => {
    playClickSound();
    setSelectedTournamentRegister(null);
  };

  const submitRegistration = async (registrationData) => {
    playCoinSound();
    const newReg = await submitRegistrationAPI({
      ...registrationData,
      email: userProfile.email
    });

    const regObj = newReg || {
      id: `REG-DD-${Math.floor(1000 + Math.random() * 9000)}`,
      tournamentId: registrationData.tournament.id,
      tournamentTitle: registrationData.tournament.title,
      playerName: registrationData.fullName,
      gamingId: registrationData.gamingId,
      phone: registrationData.phone,
      email: userProfile.email,
      entryFee: registrationData.tournament.entryFee,
      txnId: registrationData.txnId || 'FREE_ENTRY',
      status: registrationData.tournament.entryFee === 0 ? 'Confirmed' : 'Pending Verification',
      createdAt: new Date().toLocaleString()
    };

    setRegistrations(prev => [regObj, ...prev]);

    // Update User Profile state
    setUserProfile(prev => ({
      ...prev,
      name: registrationData.fullName || prev.name,
      gamingUsername: registrationData.gamingId || prev.gamingUsername,
      phone: registrationData.phone || prev.phone,
      totalTournamentsPlayed: (prev.totalTournamentsPlayed || 0) + 1,
      registeredTournaments: [
        {
          tournamentId: registrationData.tournament.id,
          registrationId: regObj.id,
          registeredAt: new Date().toLocaleDateString(),
          status: regObj.status,
          paymentTxnId: regObj.txnId
        },
        ...prev.registeredTournaments
      ]
    }));

    showToast(`Successfully registered for ${registrationData.tournament.title}!`, 'success');
  };

  const updateUserProfile = async (updatedData) => {
    playClickSound();
    const payload = {
      ...userProfile,
      ...updatedData,
      email: userProfile.email
    };

    const apiResult = await updateUserProfileAPI(payload);

    if (apiResult && apiResult.success === false && apiResult.message) {
      playErrorSound();
      showToast(apiResult.message, 'error');
      return { success: false, message: apiResult.message, suggestions: apiResult.suggestions };
    }

    const updatedUser = (apiResult && apiResult.name) ? apiResult : payload;
    setUserProfile(updatedUser);
    showToast('Profile updated successfully!', 'success');
    return { success: true };
  };

  // ADMIN ACTIONS
  const adminCreateTournament = async (trnData) => {
    playClickSound();
    const res = await adminCreateTournamentAPI(trnData);
    if (res && res.success === false) {
      playErrorSound();
      showToast(res.message || 'Failed to create tournament', 'error');
      return res;
    }
    const created = res.data || { ...trnData, id: `trn-${Date.now()}` };
    setTournaments(prev => [created, ...prev]);
    showToast(`Tournament "${created.title}" published successfully!`, 'success');
    return { success: true, data: created };
  };

  const adminUpdateTournamentStatus = async (id, status) => {
    playClickSound();
    const trn = tournaments.find(t => t.id === id || t._id === id || String(t.id) === String(id) || String(t._id) === String(id));
    const payload = { status };
    if (status === 'Upcoming' && trn) {
      payload.registrationStartDate = trn.registrationStartDate || trn.date;
      payload.registrationStartTime = trn.registrationStartTime || trn.time;
    }
    setTournaments(prev => prev.map(t => (t.id === id || t._id === id || String(t.id) === String(id) || String(t._id) === String(id)) ? { ...t, ...payload } : t));
    const res = await adminUpdateTournamentAPI(id, payload);
    if (res && res.title) {
      setTournaments(prev => prev.map(t => (t.id === id || t._id === id || String(t.id) === String(id) || String(t._id) === String(id)) ? res : t));
    }
    showToast(`Tournament status updated to ${status}`, 'success');
  };

  const adminDeleteTournament = async (id) => {
    playClickSound();
    try {
      const res = await adminDeleteTournamentAPI(id);
      if (res && res.success === false) {
        showToast(res.message || 'Failed to delete tournament', 'error');
        return { success: false, message: res.message };
      }
      setTournaments(prev => prev.filter(t => t.id !== id && t._id !== id));
      showToast('Tournament permanently deleted!', 'info');
      return { success: true };
    } catch (err) {
      console.error('Error deleting tournament in AppContext:', err);
      showToast('Error deleting tournament', 'error');
      return { success: false, message: err.message };
    }
  };

  const adminUpdateTournament = async (id, updatedData) => {
    playClickSound();
    const capacity = Number(updatedData.maxCapacity || updatedData.totalSlots || 0);
    const fee = Number(updatedData.entryFee || 0);
    const totalCollection = capacity * fee;
    let totalPrize = 0;
    if (Array.isArray(updatedData.prizes)) {
      totalPrize = updatedData.prizes.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    } else {
      totalPrize = Number(updatedData.prizePool || 0);
    }
    if (updatedData.killReward) totalPrize += Number(updatedData.killReward);
    const profit = Math.max(0, totalCollection - totalPrize);

    const fullPayload = {
      ...updatedData,
      registrationStartDate: updatedData.registrationStartDate || updatedData.date,
      registrationStartTime: updatedData.registrationStartTime || updatedData.time,
      totalCollection,
      totalPrize,
      prizePool: totalPrize,
      profit
    };

    const targetId = id || updatedData.id || updatedData._id;

    setTournaments(prev => prev.map(t => (t.id === targetId || t._id === targetId || String(t.id) === String(targetId) || String(t._id) === String(targetId)) ? { ...t, ...fullPayload } : t));
    const res = await adminUpdateTournamentAPI(targetId, fullPayload);
    if (res && res.title) {
      setTournaments(prev => prev.map(t => (t.id === targetId || t._id === targetId || String(t.id) === String(targetId) || String(t._id) === String(targetId)) ? res : t));
    }
    showToast(`Tournament "${updatedData.title || targetId}" updated successfully!`, 'success');
  };

  const adminApprovePayment = async (regId) => {
    playSuccessChimeSound();
    setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status: 'Confirmed' } : r));
    showToast(`Payment for ticket ${regId} approved! Slot confirmed.`, 'success');
  };

  const adminRejectPayment = async (regId) => {
    playErrorSound();
    setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status: 'Rejected' } : r));
    showToast(`Payment for ticket ${regId} rejected.`, 'error');
  };

  const adminLiveUpdateTournament = async (id, liveData) => {
    playClickSound();
    setTournaments(prev => prev.map(t => t.id === id ? { ...t, ...liveData } : t));
    await adminLiveUpdateTournamentAPI(id, liveData);
    showToast('Live match progress updated!', 'success');
  };

  const adminVerifyResults = async (id, finalRanks, waitingHours = 24) => {
    playSuccessChimeSound();
    const status = 'Result Pending';
    setTournaments(prev => prev.map(t => t.id === id ? { ...t, status, rankings: finalRanks, resultWaitingHours: waitingHours } : t));
    await adminVerifyResultsAPI(id, { finalRanks, status, resultWaitingHours: waitingHours });
    showToast('Tournament results verified! Set to Result Pending.', 'success');
  };

  const uploadWinnerQR = async (registrationId, qrCodeUrl) => {
    playCoinSound();
    setRegistrations(prev => prev.map(r => r.id === registrationId ? { ...r, qrCodeUrl, prizePaymentStatus: 'Pending' } : r));
    await uploadWinnerQRAPI(registrationId, qrCodeUrl, userProfile.email);
    showToast('Receiving QR code submitted successfully to Admin!', 'success');
  };

  const adminMarkPrizePaid = async (registrationId, prizeTxnId) => {
    playSuccessChimeSound();
    const paidAt = new Date().toLocaleString();
    setRegistrations(prev => prev.map(r => r.id === registrationId ? { ...r, prizePaymentStatus: 'Paid', prizeTxnId, paidAt } : r));
    await adminMarkPrizePaidAPI(registrationId, prizeTxnId);
    showToast(`Prize payment marked as PAID (Txn: ${prizeTxnId || 'N/A'})!`, 'success');
  };

  const adminDeleteAllData = async (password) => {
    const res = await adminDeleteAllDataAPI(password);
    if (res && res.success) {
      await fetchTournaments();
      await fetchRegistrations();
      showToast(res.message || 'All system data deleted successfully!', 'success');
      return { success: true, message: res.message };
    } else {
      showToast(res?.message || 'Failed to delete system data.', 'error');
      return { success: false, message: res?.message };
    }
  };

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        userRole,
        activePage,
        pageParam,
        userProfile,
        tournaments,
        games: GAMES_LIST,
        registrations,
        leaderboard,
        winners,
        faqs,
        toast,
        selectedTournamentDetail,
        selectedTournamentRegister,
        welcomeAnimationUser,
        authTransitionUser,
        finishAuthTransition,
        soundActive,
        showAudioModal,
        setShowAudioModal,
        setSoundActiveState,
        toggleSound,
        login,
        registerUser,
        logout,
        googleLogin,
        navigateTo,
        openTournamentDetail,
        closeTournamentDetail,
        openRegistrationModal,
        closeRegistrationModal,
        submitRegistration,
        updateUserProfile,
        closeWelcomeAnimation,
        showToast,
        adminCreateTournament,
        adminUpdateTournamentStatus,
        adminUpdateTournament,
        adminDeleteTournament,
        adminApprovePayment,
        adminRejectPayment,
        adminLiveUpdateTournament,
        adminVerifyResults,
        notifications,
        unreadNotificationCount,
        markNotificationRead,
        clearAllNotifications,
        uploadWinnerQR,
        adminMarkPrizePaid,
        adminDeleteAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    console.warn('useApp: AppContext not yet initialized or reloading via HMR');
    return {
      activePage: 'home',
      isLoggedIn: true,
      userProfile: {},
      tournaments: [],
      notifications: [],
      unreadNotificationCount: 0,
      navigateTo: () => {},
      showToast: () => {},
      markNotificationRead: () => {},
      clearAllNotifications: () => {}
    };
  }
  return context;
}
