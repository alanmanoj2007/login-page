/* ─────────────────────────────────────────────
   Vela — shared auth script
   Handles: login + signup validation, pw toggle,
            strength meter, loading state, toast
───────────────────────────────────────────── */

'use strict';

/* ── Helpers ──────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const grp = id => document.getElementById(`grp-${id}`);

function setError(groupId, on) {
  const g = grp(groupId);
  if (!g) return;
  g.classList.toggle('error', on);
  g.classList.toggle('valid', !on);
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  const label = document.getElementById('toast-msg');
  if (!toast || !label) return;
  toast.className = `toast ${type}`;
  label.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._tid);
  toast._tid = setTimeout(() => toast.classList.remove('show'), 3200);
}

function setLoading(btn, on) {
  btn.classList.toggle('loading', on);
  btn.disabled = on;
}

/* ── Validators ───────────────────────────── */
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isMinLen = (v, n) => v.length >= n;

function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const strengthText = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['', 'var(--error)', '#fb923c', '#facc15', 'var(--success)'];

/* ── Password visibility toggle ───────────── */
document.querySelectorAll('.toggle-pw').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    if (!target) return;
    const isText = target.type === 'text';
    target.type = isText ? 'password' : 'text';

    // Swap icon to slashed eye when hiding
    const svg = btn.querySelector('svg');
    if (isText) {
      svg.innerHTML = '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>';
    } else {
      svg.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>';
    }
    btn.setAttribute('aria-label', isText ? 'Show password' : 'Hide password');
  });
});

/* ── Strength meter (signup only) ─────────── */
const pwInput = document.getElementById('password');
const strengthBar = document.getElementById('strengthBar');
const strengthLabel = document.getElementById('strengthLabel');

if (pwInput && strengthBar) {
  pwInput.addEventListener('input', () => {
    const score = passwordStrength(pwInput.value);
    strengthBar.className = `strength-bar${pwInput.value ? ' strength-' + score : ''}`;
    if (strengthLabel) {
      strengthLabel.textContent = pwInput.value ? strengthText[score] : '';
      strengthLabel.style.color = strengthColors[score];
    }
  });
}

/* ── Login form ───────────────────────────── */
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email    = document.getElementById('email');
    const password = document.getElementById('password');
    const btn      = document.getElementById('loginBtn');
    let valid = true;

    // Validate email
    if (!isEmail(email.value)) {
      setError('email', true);
      valid = false;
    } else {
      setError('email', false);
    }

    // Validate password
    if (!isMinLen(password.value, 1)) {
      setError('password', true);
      valid = false;
    } else {
      setError('password', false);
    }

    if (!valid) return;

    // Simulate async sign-in
    setLoading(btn, true);
    await delay(1400);
    setLoading(btn, false);
    showToast('Signed in successfully!', 'success');

    // In a real app: redirect to dashboard
    // window.location.href = '/dashboard';
  });

  // Live validation on blur
  document.getElementById('email').addEventListener('blur', function () {
    if (this.value) setError('email', !isEmail(this.value));
  });
}

/* ── Signup form ──────────────────────────── */
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async e => {
    e.preventDefault();
    const name     = document.getElementById('name');
    const email    = document.getElementById('email');
    const password = document.getElementById('password');
    const confirm  = document.getElementById('confirm');
    const terms    = document.getElementById('terms');
    const btn      = document.getElementById('signupBtn');
    let valid = true;

    // Name
    if (!name.value.trim()) {
      setError('name', true);
      valid = false;
    } else {
      setError('name', false);
    }

    // Email
    if (!isEmail(email.value)) {
      setError('email', true);
      valid = false;
    } else {
      setError('email', false);
    }

    // Password
    if (!isMinLen(password.value, 8)) {
      setError('password', true);
      valid = false;
    } else {
      setError('password', false);
    }

    // Confirm
    if (confirm.value !== password.value || !confirm.value) {
      setError('confirm', true);
      valid = false;
    } else {
      setError('confirm', false);
    }

    // Terms
    if (!terms.checked) {
      showToast('Please accept the Terms to continue.', 'error');
      valid = false;
    }

    if (!valid) return;

    setLoading(btn, true);
    await delay(1600);
    setLoading(btn, false);
    showToast('Account created! Welcome to Vela.', 'success');

    // In a real app: redirect or auto-login
    // setTimeout(() => window.location.href = '/dashboard', 1000);
  });

  // Live validation
  const liveCheck = [
    ['name',    () => setError('name',    !document.getElementById('name').value.trim())],
    ['email',   () => setError('email',   !isEmail(document.getElementById('email').value))],
    ['confirm', () => {
      const pw = document.getElementById('password').value;
      const cf = document.getElementById('confirm').value;
      if (cf) setError('confirm', cf !== pw);
    }],
  ];

  liveCheck.forEach(([id, fn]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur', fn);
  });
}

/* ── Utility ──────────────────────────────── */
function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}
