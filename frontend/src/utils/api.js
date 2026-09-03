const rawApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://dd-gaming-tourament.onrender.com/api';
const cleanBaseUrl = rawApiUrl.replace(/\/+$/, '');
export const API_BASE_URL = cleanBaseUrl.endsWith('/api') ? cleanBaseUrl : `${cleanBaseUrl}/api`;

export async function fetchTournamentsAPI() {
  try {
    const res = await fetch(`${API_BASE_URL}/tournaments`);
    if (!res.ok) throw new Error('Failed to fetch tournaments');
    return await res.json();
  } catch (err) {
    console.warn('Backend API unavailable, falling back:', err.message);
    return null;
  }
}

export async function fetchLiveAccessAPI(tournamentId, email) {
  try {
    const encodedEmail = encodeURIComponent(email || '');
    const res = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/live-access?email=${encodedEmail}`);
    return await res.json();
  } catch (err) {
    return { hasAccess: false, reason: 'ERROR', message: err.message };
  }
}

export async function fetchUserNotificationsAPI(email) {
  try {
    const encodedEmail = encodeURIComponent(email || '');
    const res = await fetch(`${API_BASE_URL}/notifications?email=${encodedEmail}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function markNotificationReadAPI(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, { method: 'PUT' });
    return await res.json();
  } catch (err) {
    return { success: false };
  }
}

export async function clearAllNotificationsAPI(email, unreadList = []) {
  try {
    if (unreadList && unreadList.length > 0) {
      await Promise.all(
        unreadList.map(n =>
          fetch(`${API_BASE_URL}/notifications/${n.id}/read`, { method: 'PUT' }).catch(() => {})
        )
      );
    }
    return { success: true };
  } catch (err) {
    return { success: true };
  }
}

export async function checkUsernameAvailabilityAPI(username, currentEmail = '') {
  try {
    const encodedUser = encodeURIComponent(username);
    const encodedEmail = encodeURIComponent(currentEmail);
    const res = await fetch(`${API_BASE_URL}/auth/check-username?username=${encodedUser}&currentEmail=${encodedEmail}`);
    const data = await res.json();
    return data;
  } catch (err) {
    return { available: true };
  }
}

export async function loginUserAPI(email, password) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.message || 'Invalid email or password' };
    }
    return { success: true, ...data };
  } catch (err) {
    console.warn('Backend login error:', err.message);
    return { success: false, message: 'Server unreachable. Please check backend server.' };
  }
}

export async function registerUserAPI(formData) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        gamingUsername: formData.gamingUsername
      })
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.message || 'Registration failed', suggestions: data.suggestions };
    }
    return { success: true, ...data };
  } catch (err) {
    console.warn('Backend registration error:', err.message);
    return { success: false, message: 'Server unreachable.' };
  }
}

export async function googleLoginAPI(googleData) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googleData)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.message || 'Google Sign-In failed' };
    }
    return { success: true, ...data };
  } catch (err) {
    console.warn('Backend Google login error:', err.message);
    return { success: false, message: 'Google Sign-In server notice.' };
  }
}

export async function fetchMyProfileAPI(email) {
  try {
    if (!email) return null;
    const res = await fetch(`${API_BASE_URL}/my-profile?email=${encodeURIComponent(email)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Backend fetch my-profile notice:', err.message);
    return null;
  }
}

export async function fetchMyRegistrationsAPI(email) {
  try {
    if (!email) return [];
    const res = await fetch(`${API_BASE_URL}/my-registrations?email=${encodeURIComponent(email)}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.warn('Backend fetch my-registrations notice:', err.message);
    return [];
  }
}

export async function markWelcomeSeenAPI(email) {
  try {
    if (!email) return;
    await fetch(`${API_BASE_URL}/users/welcome-seen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
  } catch (err) {
    console.warn('Backend mark welcome-seen notice:', err.message);
  }
}

export async function submitRegistrationAPI(regData) {
  try {
    const res = await fetch(`${API_BASE_URL}/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Submit registration failed');
    return data;
  } catch (err) {
    console.warn('Backend submit registration error:', err.message);
    return null;
  }
}

export async function updateUserProfileAPI(profileData) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.message || 'Update profile failed', suggestions: data.suggestions };
    }
    return { success: true, ...data };
  } catch (err) {
    console.warn('Backend update profile error:', err.message);
    return { success: false, message: 'Server unreachable.' };
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

export async function uploadWinnerQRAPI(registrationId, qrCodeUrl, email) {
  try {
    const res = await fetch(`${API_BASE_URL}/user/winner-qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registrationId, qrCodeUrl, email })
    });
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.message };
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

