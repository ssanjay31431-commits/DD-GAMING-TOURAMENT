const rawApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://dd-gaming-tourament.onrender.com/api';
const cleanBaseUrl = rawApiUrl.replace(/\/+$/, '');
export const API_BASE_URL = cleanBaseUrl.endsWith('/api') ? cleanBaseUrl : `${cleanBaseUrl}/api`;

export async function fetchTournamentsAPI() {
  try {
    const res = await fetch(`${API_BASE_URL}/tournaments`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function fetchRegistrationsAPI() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/registrations`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function adminUpdateRegistrationStatusAPI(id, status) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/registrations/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function adminUpdateLiveStreamAPI(id, { liveStreamUrl, action }) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/tournaments/${id}/live-stream`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ liveStreamUrl, action })
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function adminSaveResultsAPI(id, { rankings, resultState }) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/tournaments/${id}/results`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rankings, resultState })
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function adminCreateTournamentAPI(trnData) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/tournaments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trnData)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error, message: data.message || 'Failed to create tournament' };
    }
    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function adminUpdateTournamentAPI(id, updateData) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/tournaments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function adminDeleteTournamentAPI(id) {
  const cleanId = encodeURIComponent(id);
  const targetUrl = `${API_BASE_URL}/admin/tournaments/${cleanId}`;
  console.log(`📡 [API CALL] Sending DELETE request to: ${targetUrl}`);

  try {
    const res = await fetch(targetUrl, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log(`📥 [API RESPONSE] Status: ${res.status} ${res.statusText}`);
    const data = await res.json().catch(() => ({}));
    console.log('📦 [API RESPONSE BODY]:', data);

    if (!res.ok) {
      const errorMsg = data.error || data.message || `Server returned error status ${res.status}`;
      console.error(`❌ [API FAILURE]: ${errorMsg}`);
      return { success: false, message: errorMsg };
    }

    return { success: true, message: data.message || 'Tournament deleted successfully', ...data };
  } catch (err) {
    console.error('❌ [API NETWORK ERROR]:', err);
    return { success: false, message: `Server connection failed (${err.message || 'Network Error'})` };
  }
}

export async function adminLiveUpdateTournamentAPI(id, liveData) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/tournaments/${id}/live-update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(liveData)
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function adminVerifyResultsAPI(id, verifyData) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/tournaments/${id}/verify-results`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verifyData)
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function adminMarkPrizePaidAPI(registrationId, prizeTxnId) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/prizes/mark-paid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registrationId, prizeTxnId })
    });
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function fetchAuditLogsAPI() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/audit-logs`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function adminSendEmailAPI({ toEmail, toName, subject, message }) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toEmail, toName, subject, message })
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, skipped: data.skipped, message: data.message || 'Failed to send email via Brevo' };
    }
    return { success: true, message: data.message, messageId: data.messageId };
  } catch (err) {
    return { success: false, message: err.message || 'Network error sending email' };
  }
}

export async function adminDeleteAllDataAPI(password) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/delete-all-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.message || 'Failed to delete data' };
    }
    return { success: true, message: data.message || 'All system data deleted successfully' };
  } catch (err) {
    return { success: false, message: err.message || 'Network error deleting system data' };
  }
}


