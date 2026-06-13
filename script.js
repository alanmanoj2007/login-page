'use strict';

/* ── View switcher ───────────────────────── */
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('view-' + name).classList.remove('hidden');
  document.getElementById('tab-' + name).classList.add('active');
}

/* ── Helpers ─────────────────────────────── */
function setError(id, on) {
  const g = document.getElementById(id);
  if (!g) return;
  g.classList.toggle('error', on);
  g.classList.toggle('valid', !on && g.querySelector('input').value !== '');
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  const label = document.getElementById('toast-msg');
  toast.className = 'toast ' + type;
  label.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._tid);
  toast._tid = setTimeout(() => toast.classList.remove('show'), 3200);
}

function setLoading(btn, on) {
  btn.classList.toggle('loading', on);
  btn.disabled = on;
}

const delay   = ms => new Promise(r => setTimeout(r, ms));
const isEmail = v  => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/* ── Password toggle ─────────────────────── */
document.querySelectorAll('.toggle-pw').forEach(btn => {
  btn.addEventListener('click', () => {
    const inp = document.getElementById(btn.dataset.target);
    const hide = inp.type === 'text';
    inp.type = hide ? 'password' : 'text';
    const svg = btn.querySelector('svg');
    svg.innerHTML = hide
      ? '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>'
      : '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>';
  });
});

/* ── Strength meter ──────────────────────── */
function passwordStrength(pw) {
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}
const strengthText   = ['','Weak','Fair','Good','Strong'];
const strengthColors = ['','var(--error)','#fb923c','#facc15','var(--success)'];

const sPw  = document.getElementById('s-password');
const sBar = document.getElementById('strengthBar');
const sLbl = document.getElementById('strengthLabel');
if (sPw) {
  sPw.addEventListener('input', () => {
    const score = passwordStrength(sPw.value);
    sBar.className = 'strength-bar' + (sPw.value ? ' strength-' + score : '');
    sLbl.textContent = sPw.value ? strengthText[score] : '';
    sLbl.style.color = strengthColors[score];
  });
}

/* ── Login form ──────────────────────────── */
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('l-email');
    const pw    = document.getElementById('l-password');
    const btn   = document.getElementById('loginBtn');
    let ok = true;

    if (!isEmail(email.value)) { setError('l-grp-email', true);    ok = false; }
    else                        { setError('l-grp-email', false); }
    if (!pw.value.trim())       { setError('l-grp-password', true); ok = false; }
    else                        { setError('l-grp-password', false); }
    if (!ok) return;

    setLoading(btn, true);
    await delay(1400);
    setLoading(btn, false);
    showToast('Signed in successfully!', 'success');
  });

  document.getElementById('l-email').addEventListener('blur', function() {
    if (this.value) setError('l-grp-email', !isEmail(this.value));
  });
}

/* ── Signup form ─────────────────────────── */
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async e => {
    e.preventDefault();
    const name    = document.getElementById('s-name');
    const email   = document.getElementById('s-email');
    const pw      = document.getElementById('s-password');
    const confirm = document.getElementById('s-confirm');
    const terms   = document.getElementById('s-terms');
    const btn     = document.getElementById('signupBtn');
    let ok = true;

    if (!name.value.trim())                         { setError('s-grp-name',     true);  ok = false; } else { setError('s-grp-name',     false); }
    if (!isEmail(email.value))                      { setError('s-grp-email',    true);  ok = false; } else { setError('s-grp-email',    false); }
    if (pw.value.length < 8)                        { setError('s-grp-password', true);  ok = false; } else { setError('s-grp-password', false); }
    if (!confirm.value || confirm.value !== pw.value){ setError('s-grp-confirm',  true);  ok = false; } else { setError('s-grp-confirm',  false); }
    if (!terms.checked) { showToast('Please accept the Terms to continue.', 'error'); ok = false; }
    if (!ok) return;

    setLoading(btn, true);
    await delay(1600);
    setLoading(btn, false);
    showToast('Account created! Welcome to Vela.', 'success');
  });

  // Live blur validation
  document.getElementById('s-name').addEventListener('blur',    function(){ if(this.value) setError('s-grp-name',  !this.value.trim()); });
  document.getElementById('s-email').addEventListener('blur',   function(){ if(this.value) setError('s-grp-email', !isEmail(this.value)); });
  document.getElementById('s-confirm').addEventListener('blur', function(){ if(this.value) setError('s-grp-confirm', this.value !== document.getElementById('s-password').value); });
}
