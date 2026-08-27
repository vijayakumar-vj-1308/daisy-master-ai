/**
 * RESECTOR 7 — ADMIN AUTHENTICATION CONTROLLER (CLIENT-SIDE)
 * Strictly communicates with backend endpoints.
 * ZERO reference codes or credentials stored or hardcoded on client side.
 */

class AdminAuthManager {
  constructor() {
    this.sessionToken = null;
    this.apiBase = '/api/admin';
    this.dom = {
      authScreen: document.getElementById('auth-screen'),
      dashboardScreen: document.getElementById('dashboard-screen'),
      loginForm: document.getElementById('admin-login-form'),
      refInput: document.getElementById('admin-ref-input'),
      btnToggleEye: document.getElementById('btn-toggle-show-code'),
      errorBox: document.getElementById('auth-error-box'),
      errorMsg: document.getElementById('auth-error-msg'),
      btnAccess: document.getElementById('btn-admin-access'),
      spinner: document.getElementById('auth-spinner'),
      btnLogout: document.getElementById('btn-admin-logout')
    };

    this.init();
  }

  init() {
    this.bindEvents();
    this.checkExistingSession();
  }

  bindEvents() {
    // Password visibility toggle
    if (this.dom.btnToggleEye && this.dom.refInput) {
      this.dom.btnToggleEye.addEventListener('click', () => {
        const type = this.dom.refInput.getAttribute('type') === 'password' ? 'text' : 'password';
        this.dom.refInput.setAttribute('type', type);
      });
    }

    // Submit login form
    if (this.dom.loginForm) {
      this.dom.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.attemptLogin();
      });
    }

    // Logout button
    if (this.dom.btnLogout) {
      this.dom.btnLogout.addEventListener('click', () => {
        this.logout();
      });
    }
  }

  async checkExistingSession() {
    const storedToken = sessionStorage.getItem('__adm_tok');
    if (!storedToken) {
      this.showLoginView();
      return;
    }

    try {
      const res = await fetch(`${this.apiBase}/verify`, {
        headers: { 'Authorization': `Bearer ${storedToken}` }
      });
      const data = await res.json();
      if (data.authenticated) {
        this.sessionToken = storedToken;
        this.showDashboardView();
        if (window.adminUI) window.adminUI.loadData();
      } else {
        this.clearSession();
        this.showLoginView();
      }
    } catch (e) {
      this.showLoginView();
    }
  }

  async attemptLogin() {
    const inputVal = this.dom.refInput.value.trim();
    if (!inputVal) {
      this.showError("Reference code cannot be empty.");
      return;
    }

    this.setLoading(true);
    this.hideError();

    try {
      const res = await fetch(`${this.apiBase}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referenceCode: inputVal })
      });

      const data = await res.json();
      this.setLoading(false);

      if (res.ok && data.token) {
        this.sessionToken = data.token;
        sessionStorage.setItem('__adm_tok', data.token);
        this.dom.refInput.value = '';
        this.showDashboardView();
        if (window.adminUI) window.adminUI.loadData();
      } else {
        this.showError(data.error || "ACCESS DENIED — Invalid reference code.");
        if (data.locked) {
          this.dom.btnAccess.disabled = true;
          setTimeout(() => {
            this.dom.btnAccess.disabled = false;
          }, (data.waitSeconds || 60) * 1000);
        }
      }
    } catch (e) {
      this.setLoading(false);
      this.showError("Connection error with station authorization server.");
    }
  }

  async logout() {
    if (this.sessionToken) {
      try {
        await fetch(`${this.apiBase}/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${this.sessionToken}` }
        });
      } catch (e) {}
    }
    this.clearSession();
    this.showLoginView();
  }

  clearSession() {
    this.sessionToken = null;
    sessionStorage.removeItem('__adm_tok');
    if (this.dom.refInput) this.dom.refInput.value = '';
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.sessionToken || sessionStorage.getItem('__adm_tok') || ''}`
    };
  }

  showLoginView() {
    if (this.dom.authScreen) this.dom.authScreen.classList.remove('hidden');
    if (this.dom.dashboardScreen) this.dom.dashboardScreen.classList.add('hidden');
  }

  showDashboardView() {
    if (this.dom.authScreen) this.dom.authScreen.classList.add('hidden');
    if (this.dom.dashboardScreen) this.dom.dashboardScreen.classList.remove('hidden');
  }

  showError(msg) {
    if (this.dom.errorBox && this.dom.errorMsg) {
      this.dom.errorMsg.textContent = msg;
      this.dom.errorBox.classList.remove('hidden');
    }
  }

  hideError() {
    if (this.dom.errorBox) {
      this.dom.errorBox.classList.add('hidden');
    }
  }

  setLoading(isLoading) {
    if (this.dom.btnAccess) this.dom.btnAccess.disabled = isLoading;
    if (this.dom.spinner) {
      if (isLoading) this.dom.spinner.classList.remove('hidden');
      else this.dom.spinner.classList.add('hidden');
    }
  }
}

window.adminAuth = new AdminAuthManager();
