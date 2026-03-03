/* ═══════════════════════════════════════════════════════════════
   SNACITO — Pre-Order Wizard JS (UPI Edition)
   ═══════════════════════════════════════════════════════════════

   CONFIG — fill before going live:
   ─────────────────────────────────────────────
   UPI_ID          : Your UPI ID (e.g. yourname@upi / 9876543210@paytm)
   UPI_NAME        : Payee name shown in UPI apps (e.g. SNACITO)
   YOUR_WA_NUMBER  : Your WhatsApp (91XXXXXXXXXX)
   EMAILJS_PUBLIC  : emailjs.com → Account → Public Key
   EMAILJS_SERVICE : emailjs.com → Email Services → Service ID
   EMAILJS_TEMPLATE: emailjs.com → Email Templates → Template ID
   FAST2SMS_KEY    : fast2sms.com DEV API Key (leave blank to skip SMS)
   BUSINESS_EMAIL  : Email that receives every order copy

   ═══════════════════════════════════════════════════════════════ */

const CONFIG = {
    UPI_ID: '9644679988@kotak811',
    UPI_NAME: 'SNACITO',                 // ← appears in UPI app
    YOUR_WA_NUMBER: '919644679988',
    EMAILJS_PUBLIC: 'gpa_WIcSR9HBprfFA',
    EMAILJS_SERVICE: 'service_3zd91hn',
    EMAILJS_TEMPLATE: 'template_xqv5u6c',
    BUSINESS_EMAIL: 'kaushalmalvi412@gmail.com',
    SUPABASE_URL: 'https://iezszlgxyqizdqazrner.supabase.co',
    SUPABASE_KEY: 'sb_publishable_Wy7qNiMG3d_GXmes2-htUw_TKkFi611'
};

/* ── Init EmailJS ───────────────────────────────────────────── */
try { emailjs.init({ publicKey: CONFIG.EMAILJS_PUBLIC }); } catch (e) { }

/* ── Order State ────────────────────────────────────────────── */
const state = {
    items: [], addons: [], byobFlavour: '',
    total: 0, advance: 0, balance: 0,
    customer: {}, orderId: '',
};

/* ═══════════════════════════════════════════════════════════════
   STEP 1 — Item Selection
   ═══════════════════════════════════════════════════════════════ */

document.querySelectorAll('.item-row .qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const row = btn.closest('.item-row');
        const valEl = btn.parentElement.querySelector('.qty-val');
        let v = parseInt(valEl.textContent) || 0;
        v = btn.classList.contains('plus') ? Math.min(99, v + 1) : Math.max(0, v - 1);
        valEl.textContent = v;
        row.classList.toggle('is-added', v > 0);
        recalcOrder();
    });
});

document.querySelectorAll('.choco-qty-row .qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const wrap = btn.closest('.qty-wrap');
        const valEl = wrap.querySelector('.qty-val');
        let v = parseInt(valEl.textContent) || 0;
        v = btn.classList.contains('plus') ? Math.min(99, v + 1) : Math.max(0, v - 1);
        valEl.textContent = v;
        recalcOrder();
    });
});

document.querySelectorAll('[data-addon]').forEach(cb => cb.addEventListener('change', recalcOrder));
document.querySelectorAll('[name="byob-flavour"]').forEach(r => r.addEventListener('change', () => {
    state.byobFlavour = r.value; recalcOrder();
}));

function recalcOrder() {
    state.items = [];
    state.addons = [];
    let total = 0;

    document.querySelectorAll('.item-row[data-price]').forEach(row => {
        const qty = parseInt(row.querySelector('.qty-val').textContent) || 0;
        if (qty > 0) {
            const name = row.dataset.name, price = parseInt(row.dataset.price);
            state.items.push({ name, price, qty });
            total += price * qty;
        }
    });

    document.querySelectorAll('.choco-qty-row .qty-wrap[data-name]').forEach(wrap => {
        const qty = parseInt(wrap.querySelector('.qty-val').textContent) || 0;
        if (qty > 0) {
            const name = wrap.dataset.name, price = parseInt(wrap.dataset.price);
            state.items.push({ name, price, qty });
            total += price * qty;
        }
    });

    document.querySelectorAll('[data-addon]:checked').forEach(cb => {
        const addon = { name: cb.dataset.addon, price: parseInt(cb.dataset.price) };
        state.addons.push(addon);
        total += addon.price;
    });

    state.total = total;
    state.advance = Math.ceil(total * 0.10);
    state.balance = total - state.advance;

    const totalItems = state.items.reduce((s, i) => s + i.qty, 0);
    const cartBar = document.getElementById('cart-bar');
    const btnBottom = document.getElementById('btn-to-step2-bottom');

    if (totalItems > 0) {
        cartBar.style.display = 'flex';
        document.getElementById('cart-count').textContent = totalItems + (totalItems === 1 ? ' item' : ' items');
        document.getElementById('cart-total').textContent = '₹' + total;
        btnBottom.disabled = false;
    } else {
        cartBar.style.display = 'none';
        btnBottom.disabled = true;
    }
}

function goToStep2() {
    if (state.items.length === 0) return;
    showStep(2);
}
document.getElementById('btn-to-step2').addEventListener('click', goToStep2);
document.getElementById('btn-to-step2-bottom').addEventListener('click', goToStep2);

/* ═══════════════════════════════════════════════════════════════
   STEP 2 — Details
   ═══════════════════════════════════════════════════════════════ */
document.getElementById('btn-back-1').addEventListener('click', () => showStep(1));

document.getElementById('btn-to-step3').addEventListener('click', () => {
    const nameEl = document.getElementById('f-name');
    const emailEl = document.getElementById('f-email');
    const phoneEl = document.getElementById('f-phone');
    const phoneWrap = phoneEl.closest('.phone-wrap');
    let ok = true;

    [nameEl, emailEl, phoneEl].forEach(el => el.classList.remove('error'));
    phoneWrap.classList.remove('error');

    if (!nameEl.value.trim()) { nameEl.classList.add('error'); nameEl.focus(); ok = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) {
        emailEl.classList.add('error'); if (ok) emailEl.focus(); ok = false;
    }
    if (!/^\d{10}$/.test(phoneEl.value.trim())) {
        phoneWrap.classList.add('error'); if (ok) phoneEl.focus(); ok = false;
    }
    if (!ok) return;

    state.customer = {
        name: nameEl.value.trim(),
        email: emailEl.value.trim(),
        phone: phoneEl.value.trim(),
        rollno: document.getElementById('f-rollno').value.trim(),
        note: document.getElementById('f-note').value.trim(),
    };

    buildSummary();
    showStep(3);
});

/* ═══════════════════════════════════════════════════════════════
   STEP 3 — Summary builder
   ═══════════════════════════════════════════════════════════════ */
function buildSummary() {
    const card = document.getElementById('summary-card');
    let html = `<div class="summary-head"><div class="summary-head-text">Your Order — ${state.customer.name}</div></div>`;

    state.items.forEach(item => {
        html += `<div class="summary-item">
      <span class="summary-item-name">${item.name} <span class="summary-item-qty">× ${item.qty}</span></span>
      <span class="summary-item-price">₹${item.price * item.qty}</span>
    </div>`;
    });
    state.addons.forEach(a => {
        html += `<div class="summary-item">
      <span class="summary-item-name">Add-On: ${a.name}</span>
      <span class="summary-item-price">₹${a.price}</span>
    </div>`;
    });
    if (state.byobFlavour) {
        html += `<div class="summary-item">
      <span class="summary-item-name" style="color:var(--warm-gray)">BYOB Flavour</span>
      <span class="summary-item-price" style="font-weight:500;color:var(--warm-gray)">${state.byobFlavour}</span>
    </div>`;
    }
    card.innerHTML = html;

    document.getElementById('s-total').textContent = '₹' + state.total;
    document.getElementById('s-advance').textContent = '₹' + state.advance;
    document.getElementById('s-balance').textContent = '₹' + state.balance;
    document.getElementById('pay-amount').textContent = state.advance;
}

document.getElementById('btn-back-2').addEventListener('click', () => showStep(2));

/* ═══════════════════════════════════════════════════════════════
   UPI PAYMENT MODAL
   ═══════════════════════════════════════════════════════════════ */

function buildOrderNote() {
    const lines = state.items.map(i => `${i.name} × ${i.qty} = ₹${i.price * i.qty}`);
    state.addons.forEach(a => lines.push(`Add-On: ${a.name} = ₹${a.price}`));
    if (state.byobFlavour) lines.push(`BYOB Flavour: ${state.byobFlavour}`);
    if (state.customer.note) lines.push(`Note: ${state.customer.note}`);
    lines.push('---');
    lines.push(`Total: ₹${state.total}  |  Advance: ₹${state.advance}  |  Balance: ₹${state.balance}`);
    return lines.join('\n');
}

/* Open the UPI modal */
document.getElementById('btn-pay').addEventListener('click', () => {
    try {
        if (state.advance <= 0) { alert('Please add at least one item'); return; }
        openUPIModal();
    } catch (e) {
        console.error('UPI modal error:', e);
        alert('Something went wrong opening the payment screen. Please refresh and try again.');
    }
});

function openUPIModal() {
    const orderId = 'SNK' + Date.now().toString(36).toUpperCase();
    state.orderId = orderId;

    /* Build UPI deep-link */
    const upiLink = `upi://pay?pa=${encodeURIComponent(CONFIG.UPI_ID)}&pn=${encodeURIComponent(CONFIG.UPI_NAME)}&am=${state.advance}&cu=INR&tn=${encodeURIComponent('SNACITO-' + orderId)}`;

    /* Populate text fields */
    document.getElementById('upi-amount').textContent = state.advance;
    document.getElementById('upi-amt-inline').textContent = state.advance;
    document.getElementById('upi-id-display').textContent = CONFIG.UPI_ID;
    document.getElementById('btn-upi-app').href = upiLink;

    /* Wire screenshot button (removed from HTML) */

    /* Show modal FIRST so user isn't blocked */
    const overlay = document.getElementById('upi-overlay');
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    /* Generate QR via free API — no library needed */
    const qrImg = document.getElementById('upi-qr-img');
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiLink)}&color=3a1a05&bgcolor=ffffff&margin=10&format=png`;
}

function closeUPIModal() {
    document.getElementById('upi-overlay').style.display = 'none';
    document.body.style.overflow = '';
}

document.getElementById('upi-close').addEventListener('click', closeUPIModal);
document.getElementById('upi-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeUPIModal();
});

/* Copy UPI ID */
document.getElementById('upi-copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(CONFIG.UPI_ID).then(() => {
        const btn = document.getElementById('upi-copy-btn');
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
    });
});

/* ── "I've Paid" → Confirm order ────────────────────────────── */
document.getElementById('btn-paid').addEventListener('click', async () => {
    const btn = document.getElementById('btn-paid');
    btn.disabled = true;
    btn.textContent = 'Confirming…';

    saveOrder();   // persist to Supabase for admin panel
    await Promise.allSettled([sendEmail(), sendOwnerEmail()]);
    closeUPIModal();
    showSuccess();
});

/* ── Save order to Supabase ──────────────────────────────────── */
async function saveOrder() {
    if (!CONFIG.SUPABASE_URL) return;

    const payload = {
        order_id: state.orderId,
        name: state.customer.name,
        email: state.customer.email,
        phone: state.customer.phone,
        amount: state.advance,
        items: buildOrderNote(),
        status: 'pending'
    };

    try {
        await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/orders`, {
            method: 'POST',
            headers: {
                'apikey': CONFIG.SUPABASE_KEY,
                'Authorization': `Bearer ${CONFIG.SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(payload)
        });
        console.log('[Supabase] Order saved to database');
    } catch (e) {
        console.error('[Supabase] Failed to save order:', e);
    }
}

/* ── Customer confirmation email ─────────────────────────────── */
async function sendEmail() {
    if (!CONFIG.EMAILJS_SERVICE) return;
    try {
        const r = await emailjs.send(CONFIG.EMAILJS_SERVICE, CONFIG.EMAILJS_TEMPLATE, {
            to_name: state.customer.name,
            to_email: state.customer.email,
            order_id: state.orderId,
            order_date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
            pickup_date: 'March 7th, 2026 — College Food Court',
            order_items: buildOrderNote(),
            order_total: '\u20b9' + state.total,
            advance_paid: '\u20b9' + state.advance,
            balance_due: '\u20b9' + state.balance,
            customer_phone: '+91 ' + state.customer.phone,
        });
        console.log('[EmailJS] Customer email OK:', r.status, r.text);
    } catch (e) {
        console.error('[EmailJS] Customer email FAILED — status:', e.status, '| text:', e.text, '| full:', e);
    }
}

/* ── Owner notification email ──────────────────────────────────── */
async function sendOwnerEmail() {
    if (!CONFIG.EMAILJS_SERVICE) return;
    try {
        const r = await emailjs.send(CONFIG.EMAILJS_SERVICE, CONFIG.EMAILJS_TEMPLATE, {
            to_name: 'Kaushal (SNACITO)',
            to_email: CONFIG.BUSINESS_EMAIL,
            order_id: state.orderId,
            order_date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
            pickup_date: 'March 7th, 2026 — College Food Court',
            order_items: buildOrderNote(),
            order_total: '\u20b9' + state.total,
            advance_paid: '\u20b9' + state.advance,
            balance_due: '\u20b9' + state.balance,
            customer_phone: '+91 ' + state.customer.phone,
        });
        console.log('[EmailJS] Owner notification OK:', r.status, r.text);
    } catch (e) {
        console.error('[EmailJS] Owner notification FAILED — status:', e.status, '| text:', e.text, '| full:', e);
    }
}

/* ── WhatsApp notification ──────────────────────────────────── */
function openWhatsApp() {
    const msg = [
        `🛒 *SNACITO Pre-Order — Advance Paid*`,
        ``,
        `👤 ${state.customer.name}`,
        `📱 +91 ${state.customer.phone}`,
        `✉️ ${state.customer.email}`,
        `🆔 Order ID: ${state.orderId}`,
        `💳 Advance paid: ₹${state.advance} via UPI`,
        ``,
        buildOrderNote(),
        ``,
        `_(March 7th · College Food Court)_`
    ].join('\n');
    window.open(`https://wa.me/${CONFIG.YOUR_WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
}

/* ── Success screen ─────────────────────────────────────────── */
function showSuccess() {
    document.getElementById('succ-name').textContent = state.customer.name.split(' ')[0];
    document.getElementById('succ-order-id').textContent = state.orderId;
    showStep('success');
}

/* ═══════════════════════════════════════════════════════════════
   Step Navigation
   ═══════════════════════════════════════════════════════════════ */
function showStep(n) {
    document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('step-' + n).classList.add('active');

    [1, 2, 3].forEach(s => {
        const si = document.getElementById('si-' + s);
        si.classList.remove('active', 'done');
        if (s < n) si.classList.add('done');
        if (s == n) si.classList.add('active');
    });
    [1, 2].forEach(c => document.getElementById('sc-' + c).classList.toggle('done', c < n));

    if (n !== 1) document.getElementById('cart-bar').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Boot ───────────────────────────────────────────────────── */
recalcOrder();
