import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  fetchTournamentsAPI,
  fetchRegistrationsAPI,
  adminCreateTournamentAPI,
  adminUpdateTournamentAPI,
  adminDeleteTournamentAPI,
  adminUpdateRegistrationStatusAPI,
  adminLiveUpdateTournamentAPI,
  adminVerifyResultsAPI,
  adminUpdateLiveStreamAPI,
  adminSaveResultsAPI,
  adminMarkPrizePaidAPI,
  fetchAuditLogsAPI,
  adminSendEmailAPI,
  adminDeleteAllDataAPI
} from '../utils/api';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [tournaments, setTournaments] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  const loadAllData = async () => {
    const trns = await fetchTournamentsAPI();
    if (trns && Array.isArray(trns)) setTournaments(trns);

    const regs = await fetchRegistrationsAPI();
    if (regs && Array.isArray(regs)) setRegistrations(regs);

    const logs = await fetchAuditLogsAPI();
    if (logs && Array.isArray(logs)) setAuditLogs(logs);
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 3000);
    return () => clearInterval(interval);
  }, []);

  const adminCreateTournament = async (trnData) => {
    const res = await adminCreateTournamentAPI(trnData);
    if (res && res.success === false) {
      showToast(res.message || 'Failed to create tournament', 'error');
      return res;
    }
    const created = res.data || { ...trnData, id: `trn-${Date.now()}` };
    setTournaments(prev => [created, ...prev]);
    showToast(`Tournament "${created.title}" published successfully!`, 'success');
    return { success: true, data: created };
  };

  const adminUpdateTournamentStatus = async (id, status) => {
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
    showToast(`Status updated to ${status}`, 'success');
  };

  const adminDeleteTournament = async (id) => {
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
      console.error('Error in adminDeleteTournament:', err);
      showToast('An unexpected error occurred while deleting tournament.', 'error');
      return { success: false, message: err.message };
    }
  };

  const adminUpdateTournament = async (id, updatedData) => {
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
    showToast(`Tournament "${updatedData.title || targetId}" updated!`, 'success');
  };

  const adminApprovePayment = async (regId) => {
    setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status: 'Confirmed' } : r));
    await adminUpdateRegistrationStatusAPI(regId, 'Confirmed');
    showToast(`Payment for ticket ${regId} approved! Slot confirmed.`, 'success');
  };

  const adminRejectPayment = async (regId) => {
    setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status: 'Rejected' } : r));
    await adminUpdateRegistrationStatusAPI(regId, 'Rejected');
    showToast(`Payment for ticket ${regId} rejected.`, 'error');
  };

  const adminLiveUpdateTournament = async (id, liveData) => {
    setTournaments(prev => prev.map(t => t.id === id ? { ...t, ...liveData } : t));
    await adminLiveUpdateTournamentAPI(id, liveData);
    showToast('Live match progress updated!', 'success');
  };

  const adminVerifyResults = async (id, finalRanks, waitingHours = 24) => {
    const status = 'Result Pending';
    setTournaments(prev => prev.map(t => t.id === id ? { ...t, status, rankings: finalRanks, resultWaitingHours: waitingHours } : t));
    await adminVerifyResultsAPI(id, { finalRanks, status, resultWaitingHours: waitingHours });
    showToast('Tournament results verified!', 'success');
  };

  const adminUpdateLiveStream = async (id, { liveStreamUrl, action }) => {
    const res = await adminUpdateLiveStreamAPI(id, { liveStreamUrl, action });
    if (res && res.tournament) {
      setTournaments(prev => prev.map(t => (t.id === id || t._id === id) ? res.tournament : t));
    }
    showToast(`Live stream updated (${action})!`, 'success');
  };

  const adminSaveResults = async (id, { rankings, resultState }) => {
    const res = await adminSaveResultsAPI(id, { rankings, resultState });
    if (res && res.tournament) {
      setTournaments(prev => prev.map(t => (t.id === id || t._id === id) ? res.tournament : t));
    }
    showToast(`Tournament results saved as ${resultState}!`, 'success');
  };

  const adminMarkPrizePaid = async (registrationId, prizeTxnId) => {
    const paidAt = new Date().toLocaleString();
    setRegistrations(prev => prev.map(r => r.id === registrationId ? { ...r, prizePaymentStatus: 'Paid', prizeTxnId, paidAt } : r));
    await adminMarkPrizePaidAPI(registrationId, prizeTxnId);
    showToast(`Prize payment marked as PAID!`, 'success');
  };

  const adminSendEmail = async (emailData) => {
    const res = await adminSendEmailAPI(emailData);
    if (res && res.success) {
      showToast(res.message || `Email sent successfully via Brevo to ${emailData.toEmail}!`, 'success');
      return { success: true, message: res.message };
    } else {
      showToast(res?.message || 'Failed to send email via Brevo.', 'error');
      return { success: false, message: res?.message };
    }
  };

  const adminDeleteAllData = async (password) => {
    const res = await adminDeleteAllDataAPI(password);
    if (res && res.success) {
      await loadAllData();
      showToast(res.message || 'All system data deleted successfully!', 'success');
      return { success: true, message: res.message };
    } else {
      showToast(res?.message || 'Failed to delete system data.', 'error');
      return { success: false, message: res?.message };
    }
  };

  return (
    <AdminContext.Provider
      value={{
        tournaments,
        registrations,
        auditLogs,
        toast,
        showToast,
        loadAllData,
        adminCreateTournament,
        adminUpdateTournamentStatus,
        adminUpdateTournament,
        adminDeleteTournament,
        adminApprovePayment,
        adminRejectPayment,
        adminLiveUpdateTournament,
        adminVerifyResults,
        adminUpdateLiveStream,
        adminSaveResults,
        adminMarkPrizePaid,
        adminSendEmail,
        adminDeleteAllData
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminApp() {
  return useContext(AdminContext);
}
