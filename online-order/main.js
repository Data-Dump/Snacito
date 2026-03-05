

const CONFIG = {
    UPI_ID: '9644679988@kotak811',
    UPI_NAME: 'SNACITO',
    YOUR_WA_NUMBER: '919644679988',
    EMAILJS_PUBLIC: 'gpa_WIcSR9HBprfFA',
    EMAILJS_SERVICE: 'service_3zd91hn',
    EMAILJS_TEMPLATE: 'template_xqv5u6c',
    BUSINESS_EMAIL: 'kaushalmalvi412@gmail.com',
    SUPABASE_URL: 'https://iezszlgxyqizdqazrner.supabase.co',
    SUPABASE_KEY: 'sb_publishable_Wy7qNiMG3d_GXmes2-htUw_TKkFi611'
};


try { emailjs.init({ publicKey: CONFIG.EMAILJS_PUBLIC }); } catch (e) { }


const state = {
    items: [], addons: [], byobFlavour: '',
    total: 0, advance: 0, balance: 0,
    customer: {}, orderId: '',
};



document.querySelectorAll('.item-row .qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const wrap = btn.closest('.qty-wrap');
        const valEl = wrap.querySelector('.qty-val');
        let v = parseInt(valEl.textContent) || 0;
        v = btn.classList.contains('plus') ? Math.min(99, v + 1) : Math.max(0, v - 1);
        valEl.textContent = v;
        const row = wrap.closest('.item-row');
        if (row) {
            row.classList.toggle('is-added', v > 0);
            if (row.dataset.name === "BYOB Bag") {
                updateBYOBBlocks(v);
            } else if (row.dataset.name && row.dataset.name.startsWith('Choco Puffs')) {

                let totalChocoPacks = 0;
                document.querySelectorAll('.choco-base-qty .qty-val').forEach(el => {
                    totalChocoPacks += (parseInt(el.textContent) || 0);
                });
                updateChocoBlocks(totalChocoPacks);
            }
        }
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

const BYOB_FLAVOURS = ['Tomato', 'Indian Masala', 'Salted', 'Doritos', 'OG Kurkure'];
const BYOB_ADDONS = [
    { name: 'Mayo', price: 10 },
    { name: 'Tandoori Mayo', price: 15 },
    { name: 'Hot Sauce', price: 15 }
];

const CHOCO_TYPES = ['Milk', 'Dark', 'Mix'];
const CHOCO_ADDONS = [
    { name: 'Choco Filling', price: 10 },
    { name: 'Choco Chips', price: 10 }
];

function updateChocoBlocks(qty) {
    const container = document.getElementById('choco-packs-container');
    if (!container) return;

    const optionsWrap = document.getElementById('choco-options');
    if (optionsWrap) optionsWrap.style.display = qty > 0 ? 'block' : 'none';

    const currentQty = container.children.length;

    if (qty > currentQty) {
        for (let i = currentQty + 1; i <= qty; i++) {
            const block = document.createElement('div');
            block.className = 'choco-pack-block';
            block.dataset.packIndex = i;

            block.style.cssText = 'background: rgba(240, 180, 41, 0.05); border: 1.5px dashed rgba(184, 134, 11, 0.3); border-radius: 12px; padding: 14px; margin-top: 10px;';

            let html = `<div style="font-size: 13px; font-weight: 700; color: var(--brown); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">Pack ${i}</div>`;

            html += `<div class="flavour-section" style="margin-bottom: 12px;">`;
            html += `<div class="flavour-label" style="margin-bottom: 8px; color: var(--warm-gray);">1. Chocolate Base</div>`;
            html += `<div class="flavour-chips" style="display:flex; flex-wrap:wrap; gap:6px;">`;
            CHOCO_TYPES.forEach((f, idx) => {
                const checked = (idx === 0) ? 'checked' : '';
                html += `<label class="flavour-chip"><input type="radio" name="pack-${i}-type" value="${f}" onchange="recalcOrder()" ${checked}><span style="color:var(--dark); border-color:var(--border);">${f}</span></label>`;
            });
            html += `</div></div>`;


            html += `<div class="addons-box" style="background:transparent; border:none; padding:0; margin-top:0;">`;
            html += `<div class="addons-label" style="margin-bottom: 8px; color: var(--warm-gray);">2. Add-Ons (Optional)</div>`;
            html += `<div class="addon-chips" style="display:flex; flex-wrap:wrap; gap:6px;">`;
            CHOCO_ADDONS.forEach(a => {
                html += `<label class="addon-chip"><input type="checkbox" data-pack-param="${i}" data-name="${a.name}" data-price="${a.price}" onchange="recalcOrder()"><span style="color:var(--dark); border-color:var(--border);">${a.name} <em>+₹${a.price}</em></span></label>`;
            });
            html += `</div></div>`;

            block.innerHTML = html;
            container.appendChild(block);
        }
    } else if (qty < currentQty) {
        for (let i = currentQty; i > qty; i--) {
            if (container.lastElementChild) {
                container.removeChild(container.lastElementChild);
            }
        }
    }
}

function updateBYOBBlocks(qty) {
    const container = document.getElementById('byob-bags-container');
    if (!container) return;

    const optionsWrap = document.getElementById('byob-options');
    if (optionsWrap) optionsWrap.style.display = qty > 0 ? 'block' : 'none';

    const currentQty = container.children.length;

    if (qty > currentQty) {
        for (let i = currentQty + 1; i <= qty; i++) {
            const block = document.createElement('div');
            block.className = 'byob-bag-block';
            block.dataset.bagIndex = i;
            block.style.cssText = 'background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px; margin-top: 10px;';

            let html = `<div style="font-size: 13px; font-weight: 700; color: var(--gold-light); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">Bag ${i}</div>`;

            html += `<div class="flavour-section" style="margin-bottom: 12px;">`;
            html += `<div class="flavour-label" style="margin-bottom: 8px;">1. Select Flavour</div>`;
            html += `<div class="flavour-chips" style="display:flex; flex-wrap:wrap; gap:6px;">`;
            BYOB_FLAVOURS.forEach((f, idx) => {
                const checked = (idx === 0) ? 'checked' : '';
                html += `<label class="flavour-chip"><input type="radio" name="bag-${i}-flavour" value="${f}" onchange="recalcOrder()" ${checked}><span>${f}</span></label>`;
            });
            html += `</div></div>`;

            html += `<div class="addons-box dark" style="background:transparent; border:none; padding:0; margin-top:0;">`;
            html += `<div class="addons-label" style="margin-bottom: 8px;">2. Add-Ons (Optional)</div>`;
            html += `<div class="addon-chips" style="display:flex; flex-wrap:wrap; gap:6px;">`;
            BYOB_ADDONS.forEach(a => {
                html += `<label class="addon-chip dark"><input type="checkbox" data-bag-param="${i}" data-name="${a.name}" data-price="${a.price}" onchange="recalcOrder()"><span>${a.name} <em>+₹${a.price}</em></span></label>`;
            });
            html += `</div></div>`;

            block.innerHTML = html;
            container.appendChild(block);
        }
    } else if (qty < currentQty) {
        for (let i = currentQty; i > qty; i--) {
            if (container.lastElementChild) {
                container.removeChild(container.lastElementChild);
            }
        }
    }
}

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


    document.querySelectorAll('[data-addon]:not([data-bag-param]):checked').forEach(cb => {
        const addon = { name: cb.dataset.addon, price: parseInt(cb.dataset.price) };
        state.addons.push(addon);
        total += addon.price;
    });


    const dynamicBags = document.querySelectorAll('.byob-bag-block');
    let byobSummaryList = [];

    dynamicBags.forEach(block => {
        const bagIdx = block.dataset.bagIndex;
        const fRadio = block.querySelector(`input[name="bag-${bagIdx}-flavour"]:checked`);
        const flav = fRadio ? fRadio.value : '';

        let bagAddons = [];
        block.querySelectorAll(`input[data-bag-param="${bagIdx}"]:checked`).forEach(cb => {
            const aName = cb.dataset.name;
            const aPrice = parseInt(cb.dataset.price);
            bagAddons.push(aName);
            state.addons.push({ name: `${aName} (Bag ${bagIdx})`, price: aPrice });
            total += aPrice;
        });

        if (flav) {
            const addonStr = bagAddons.length ? ` w/ ${bagAddons.join(', ')}` : '';
            byobSummaryList.push(`Bag ${bagIdx}: ${flav}${addonStr}`);
        }
    });

    state.byobFlavour = byobSummaryList.length > 0 ? byobSummaryList.join(' | ') : null;


    const dynamicPacks = document.querySelectorAll('.choco-pack-block');


    let packSizes = [];
    document.querySelectorAll('.choco-base-qty').forEach(wrap => {
        const row = wrap.closest('.item-row');
        if (!row) return;
        const qty = parseInt(wrap.querySelector('.qty-val').textContent) || 0;
        const sizeMatch = row.dataset.name.match(/(\d+)pc/);
        const sizeStr = sizeMatch ? sizeMatch[1] + 'pc' : 'Base';

        for (let i = 0; i < qty; i++) {
            packSizes.push(sizeStr);
        }
    });




    let chocoSummaryList = [];
    dynamicPacks.forEach((block, idx) => {
        const packIdx = block.dataset.packIndex;
        const sizeStr = packSizes[idx] || 'Pack';
        const typeRadio = block.querySelector(`input[name="pack-${packIdx}-type"]:checked`);
        const chocoType = typeRadio ? typeRadio.value : '';




        if (chocoType === 'Mix') {
            let mixPremium = 0;
            if (sizeStr === '5pc') mixPremium = 10;
            if (sizeStr === '8pc') mixPremium = 20;
            if (sizeStr === '12pc') mixPremium = 20;

            if (mixPremium > 0) {
                state.addons.push({ name: `${sizeStr} Mix Premium (Pack ${packIdx})`, price: mixPremium });
                total += mixPremium;
            }
        }

        let packAddons = [];
        block.querySelectorAll(`input[data-pack-param="${packIdx}"]:checked`).forEach(cb => {
            const aName = cb.dataset.name;
            const aPrice = parseInt(cb.dataset.price);
            packAddons.push(aName);
            state.addons.push({ name: `${aName} (Pack ${packIdx})`, price: aPrice });
            total += aPrice;
        });

        if (chocoType) {
            const addonStr = packAddons.length ? ` w/ ${packAddons.join(', ')}` : '';
            chocoSummaryList.push(`Pack ${packIdx} (${sizeStr}): ${chocoType}${addonStr}`);
        }
    });



    state.chocoFlavour = chocoSummaryList.length > 0 ? chocoSummaryList.join(' | ') : null;

    state.total = total;
    state.advance = Math.ceil(total * 0.50);
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
    if (state.chocoFlavour) {
        html += `<div class="summary-item">
      <span class="summary-item-name" style="color:var(--warm-gray)">Choco Puffs Flavour</span>
      <span class="summary-item-price" style="font-weight:500;color:var(--warm-gray)">${state.chocoFlavour}</span>
    </div>`;
    }
    card.innerHTML = html;

    document.getElementById('s-total').textContent = '₹' + state.total;
    document.getElementById('s-advance').textContent = '₹' + state.advance;
    document.getElementById('s-balance').textContent = '₹' + state.balance;
    document.getElementById('pay-amount').textContent = state.advance;
}

document.getElementById('btn-back-2').addEventListener('click', () => showStep(2));



function buildOrderNote() {
    const lines = state.items.map(i => `${i.name} × ${i.qty} = ₹${i.price * i.qty}`);
    state.addons.forEach(a => lines.push(`Add-On: ${a.name} = ₹${a.price}`));
    if (state.byobFlavour) lines.push(`BYOB Flavour: ${state.byobFlavour}`);
    if (state.chocoFlavour) lines.push(`Choco Puffs Flavour: ${state.chocoFlavour}`);
    if (state.customer.note) lines.push(`Note: ${state.customer.note}`);
    lines.push('---');
    lines.push(`Total: ₹${state.total}  |  Advance: ₹${state.advance}  |  Balance: ₹${state.balance}`);
    return lines.join('\n');
}


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


    const upiLink = `upi://pay?pa=${encodeURIComponent(CONFIG.UPI_ID)}&pn=${encodeURIComponent(CONFIG.UPI_NAME)}&am=${state.advance}&cu=INR&tn=${encodeURIComponent('SNACITO-' + orderId)}`;


    document.getElementById('upi-amount').textContent = state.advance;
    document.getElementById('upi-amt-inline').textContent = state.advance;
    document.getElementById('upi-id-display').textContent = CONFIG.UPI_ID;
    document.getElementById('btn-upi-app').href = upiLink;




    const overlay = document.getElementById('upi-overlay');
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';


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


document.getElementById('upi-copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(CONFIG.UPI_ID).then(() => {
        const btn = document.getElementById('upi-copy-btn');
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
    });
});


document.getElementById('btn-paid').addEventListener('click', async () => {
    const btn = document.getElementById('btn-paid');
    btn.disabled = true;
    btn.textContent = 'Confirming…';

    saveOrder();
    await Promise.allSettled([sendEmail(), sendOwnerEmail()]);
    closeUPIModal();
    showSuccess();
});


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


async function sendEmail() {
    if (!CONFIG.EMAILJS_SERVICE) return;
    try {
        const r = await emailjs.send(CONFIG.EMAILJS_SERVICE, CONFIG.EMAILJS_TEMPLATE, {
            to_name: state.customer.name,
            to_email: state.customer.email,
            order_id: state.orderId,
            order_date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
            pickup_date: 'March 6th, 2026 — Aarohan Stall Area',
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


async function sendOwnerEmail() {
    if (!CONFIG.EMAILJS_SERVICE) return;
    try {
        const r = await emailjs.send(CONFIG.EMAILJS_SERVICE, CONFIG.EMAILJS_TEMPLATE, {
            to_name: 'Kaushal (SNACITO)',
            to_email: CONFIG.BUSINESS_EMAIL,
            order_id: state.orderId,
            order_date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
            pickup_date: 'March 6th, 2026 — Aarohan Stall Area',
            order_items: buildOrderNote(),
            order_total: '\u20b9' + state.total,
            advance_paid: '\u20b9' + state.advance,
            balance_due: '\u20b9' + state.balance,
            customer_phone: '+91 ' + state.customer.phone,
            choco_flavour: state.chocoFlavour || 'N/A',
        });
        console.log('[EmailJS] Owner notification OK:', r.status, r.text);
    } catch (e) {
        console.error('[EmailJS] Owner notification FAILED — status:', e.status, '| text:', e.text, '| full:', e);
    }
}





function showSuccess() {
    document.getElementById('succ-name').textContent = state.customer.name.split(' ')[0];
    document.getElementById('succ-order-id').textContent = state.orderId;
    showStep('success');
}


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


recalcOrder();

async function trackVisit() {
    if (sessionStorage.getItem('snacito_onlineorder_visited')) return;

    if (!CONFIG.SUPABASE_URL) return;
    try {
        await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/visits`, {
            method: 'POST',
            headers: {
                'apikey': CONFIG.SUPABASE_KEY,
                'Authorization': `Bearer ${CONFIG.SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ page_name: 'online-order' })
        });
        sessionStorage.setItem('snacito_onlineorder_visited', 'true');
    } catch (e) {
        console.error('Failed to track visit:', e);
    }
}

document.addEventListener('DOMContentLoaded', trackVisit);
