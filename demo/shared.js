const API_BASE = 'http://localhost:3000/api'

// --- Storage ---
function getStripeKey() { return localStorage.getItem('demo_stripe_pk') || '' }
function setStripeKey(key) { localStorage.setItem('demo_stripe_pk', key) }
function getAuthToken() { return localStorage.getItem('demo_auth_token') || '' }
function setAuthToken(token) { localStorage.setItem('demo_auth_token', token) }
function clearAuthToken() { localStorage.removeItem('demo_auth_token') }

// --- API fetch (auto-attaches auth header when token exists) ---
async function apiFetch(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getAuthToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message ?? `Error ${res.status}`)
  return data
}

// --- Result display ---
function setResult(el, type, html) {
  el.className = `result ${type}`
  el.innerHTML = html
  el.hidden = false
}

// --- Auth ---
// Injects login/register form into `authEl`, or a logged-in bar if already signed in.
// Calls `onReady` once authenticated.
function initAuth(authEl, onReady) {
  if (getAuthToken()) {
    _renderAuthBar(authEl)
    onReady()
    return
  }
  _renderLoginForm(authEl, () => {
    _renderAuthBar(authEl)
    onReady()
  })
}

function _renderAuthBar(authEl) {
  authEl.innerHTML = `<div class="auth-bar">
    <span>Signed in</span>
    <button type="button" class="btn-text" id="logout-btn">Log out</button>
  </div>`
  authEl.querySelector('#logout-btn').addEventListener('click', () => {
    clearAuthToken()
    location.reload()
  })
}

function _renderLoginForm(authEl, onSuccess) {
  authEl.innerHTML = `<div class="auth-form">
    <p class="auth-title">Sign in to continue</p>
    <div class="field">
      <label for="auth-email">Email</label>
      <input type="email" id="auth-email" placeholder="you@example.com" autocomplete="email">
    </div>
    <div class="field">
      <label for="auth-password">Password</label>
      <input type="password" id="auth-password" placeholder="••••••••" autocomplete="current-password">
    </div>
    <div class="auth-actions">
      <button type="button" class="btn-primary" id="login-btn">Log in</button>
      <button type="button" class="btn-secondary" id="register-btn">Register</button>
    </div>
    <div id="auth-result" class="result" hidden></div>
  </div>`

  const resultEl = authEl.querySelector('#auth-result')

  async function doAuth(endpoint) {
    const email = authEl.querySelector('#auth-email').value.trim()
    const password = authEl.querySelector('#auth-password').value
    if (!email || !password) return
    authEl.querySelector('#login-btn').disabled = true
    authEl.querySelector('#register-btn').disabled = true
    resultEl.hidden = true
    try {
      const { access_token } = await apiFetch(endpoint, {
        method: 'POST',
        body: { email, password },
      })
      setAuthToken(access_token)
      onSuccess()
    } catch (err) {
      setResult(resultEl, 'error', err.message)
      authEl.querySelector('#login-btn').disabled = false
      authEl.querySelector('#register-btn').disabled = false
    }
  }

  authEl.querySelector('#login-btn').addEventListener('click', () => doAuth('/auth/login'))
  authEl.querySelector('#register-btn').addEventListener('click', () => doAuth('/auth/register'))
}

// --- Stripe key settings gear button + popover ---
const GEAR_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="3"/>
  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
</svg>`

// Injects a gear button + popover into `card`. Calls `onKeyChange(key)` immediately
// if a key is already stored, and again whenever the user saves a new one.
function initStripeSettings(card, onKeyChange) {
  const btn = document.createElement('button')
  btn.className = 'settings-btn'
  btn.type = 'button'
  btn.title = 'Stripe settings'
  btn.innerHTML = GEAR_SVG

  const popover = document.createElement('div')
  popover.className = 'popover'
  popover.hidden = true
  popover.innerHTML = `
    <label>Stripe Publishable Key</label>
    <input class="pk-input" type="text" placeholder="pk_test_..." value="${getStripeKey()}">
    <div class="popover-actions">
      <button type="button" class="btn-secondary pop-cancel">Cancel</button>
      <button type="button" class="btn-save pop-save">Save</button>
    </div>
  `

  btn.addEventListener('click', () => { popover.hidden = !popover.hidden })

  popover.querySelector('.pop-cancel').addEventListener('click', () => {
    popover.hidden = true
  })

  popover.querySelector('.pop-save').addEventListener('click', () => {
    const key = popover.querySelector('.pk-input').value.trim()
    if (key.startsWith('pk_')) {
      setStripeKey(key)
      popover.hidden = true
      onKeyChange(key)
    }
  })

  card.appendChild(btn)
  card.appendChild(popover)

  const existing = getStripeKey()
  if (existing) {
    onKeyChange(existing)
  } else {
    popover.hidden = false
  }
}
