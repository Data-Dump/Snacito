

const ADMIN = {
    _PWRD: 'c25hY2l0bzIwMjY=',
    EMAILJS_PUBLIC: 'gpa_WIcSR9HBprfFA',
    EMAILJS_SERVICE: 'service_3zd91hn',
    TEMPLATE_CONFIRMED: 'template_z0r7qws',
    SUPABASE_URL: 'https://iezszlgxyqizdqazrner.supabase.co',
    SUPABASE_KEY: 'sb_publishable_Wy7qNiMG3d_GXmes2-htUw_TKkFi611'
};

const supabaseClient = supabase.createClient(ADMIN.SUPABASE_URL, ADMIN.SUPABASE_KEY);

try { emailjs.init({ publicKey: ADMIN.EMAILJS_PUBLIC }); } catch (e) { }


const gate = document.getElementById('gate');
const panel = document.getElementById('panel');

function tryLogin() {
    const val = document.getElementById('pw-input').value;
    if (btoa(val) === ADMIN._PWRD) {
        gate.style.display = 'none';
        panel.style.display = 'block';
        loadOrders();
        loadVisits();
        setupRealtimeSubscriptions();
    } else {
        document.getElementById('pw-input').classList.add('error');
        document.getElementById('gate-error').style.display = 'block';
    }
}

document.getElementById('pw-btn').addEventListener('click', tryLogin);
document.getElementById('pw-input').addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(); });
document.getElementById('btn-logout').addEventListener('click', () => {
    panel.style.display = 'none';
    gate.style.display = 'flex';
    document.getElementById('pw-input').value = '';
});



async function loadOrders() {
    const listEl = document.getElementById('orders-list');
    listEl.innerHTML = '<div class="no-orders" style="color:var(--gold);">Loading orders from database...</div>';

    try {
        const res = await fetch(`${ADMIN.SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`, {
            headers: { 'apikey': ADMIN.SUPABASE_KEY, 'Authorization': `Bearer ${ADMIN.SUPABASE_KEY}` }
        });
        const orders = await res.json();


        window._adminOrdersCache = orders;

        if (!orders || orders.length === 0) {
            listEl.innerHTML = '<div class="no-orders">No orders recorded in the database yet.</div>';
            return;
        }

        listEl.innerHTML = orders.map((o, i) => {
            const statusMap = {
                pending: '<span class="badge badge-pending">Pending</span>',
                confirmed: '<span class="badge badge-confirmed">Confirmed</span>',
                rejected: '<span class="badge badge-rejected">Not Received</span>',
            };
            return `
            <div class="order-row" id="order-row-${i}">
                <div class="order-row-top">
                    <div>
                        <div class="order-name">${o.name}</div>
                        <div class="order-id">${o.order_id}</div>
                    </div>
                    ${statusMap[o.status] || statusMap.pending}
                </div>
                <div class="order-meta">
                    📧 ${o.email} &nbsp;·&nbsp; 📱 +91 ${o.phone}
                    &nbsp;·&nbsp; Advance: <span>₹${o.amount}</span>
                </div>
                <div class="order-meta">${new Date(o.created_at).toLocaleString('en-IN')}</div>
                <div class="order-actions">
                    <button class="order-fill-btn" onclick="fillForm(${i})">Fill Form →</button>
                </div>
            </div>`;
        }).join('');
    } catch (e) {
        console.error('Failed to load orders:', e);
        listEl.innerHTML = '<div class="no-orders" style="color:var(--red);">Failed to connect to database.</div>';
    }
}

async function loadVisits() {
    try {
        const websiteRes = await fetch(`${ADMIN.SUPABASE_URL}/rest/v1/visits?page_name=eq.website&select=id`, {
            headers: { 'apikey': ADMIN.SUPABASE_KEY, 'Authorization': `Bearer ${ADMIN.SUPABASE_KEY}`, 'Prefer': 'count=exact' }
        });
        const websiteCount = websiteRes.headers.get('content-range') ? websiteRes.headers.get('content-range').split('/')[1] : 0;
        document.getElementById('count-website').textContent = websiteCount;

        const preorderRes = await fetch(`${ADMIN.SUPABASE_URL}/rest/v1/visits?page_name=eq.pre-order&select=id`, {
            headers: { 'apikey': ADMIN.SUPABASE_KEY, 'Authorization': `Bearer ${ADMIN.SUPABASE_KEY}`, 'Prefer': 'count=exact' }
        });
        const preorderCount = preorderRes.headers.get('content-range') ? preorderRes.headers.get('content-range').split('/')[1] : 0;
        document.getElementById('count-preorder').textContent = preorderCount;
    } catch (e) {
        console.error('Failed to load visits:', e);
        document.getElementById('count-website').textContent = '-';
        document.getElementById('count-preorder').textContent = '-';
    }
}

let realtimeSetupDone = false;
function setupRealtimeSubscriptions() {
    if (realtimeSetupDone) return;
    realtimeSetupDone = true;

    supabaseClient.channel('public:visits')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visits' }, payload => {
            const page_name = payload.new.page_name;
            if (page_name === 'website') {
                const el = document.getElementById('count-website');
                const curr = parseInt(el.textContent) || 0;
                el.textContent = curr + 1;
            } else if (page_name === 'pre-order') {
                const el = document.getElementById('count-preorder');
                const curr = parseInt(el.textContent) || 0;
                el.textContent = curr + 1;
            }
        })
        .subscribe();

    supabaseClient.channel('public:orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
            console.log('Realtime order update:', payload);
            loadOrders();
        })
        .subscribe();
}

function fillForm(idx) {
    const orders = window._adminOrdersCache || [];
    const o = orders[idx];
    if (!o) return;
    document.getElementById('v-name').value = o.name;
    document.getElementById('v-email').value = o.email;
    document.getElementById('v-orderid').value = o.order_id;
    document.getElementById('v-amount').value = o.amount;
    document.getElementById('v-items').value = o.items || '';
    document.querySelector('.verify-card').scrollIntoView({ behavior: 'smooth' });
}


function getFormData() {
    const name = document.getElementById('v-name').value.trim();
    const email = document.getElementById('v-email').value.trim();
    const orderId = document.getElementById('v-orderid').value.trim();
    const amount = document.getElementById('v-amount').value.trim();
    const items = document.getElementById('v-items').value.trim();

    let ok = true;
    ['v-name', 'v-email', 'v-orderid'].forEach(id => {
        const el = document.getElementById(id);
        if (!el.value.trim()) { el.classList.add('error'); ok = false; }
        else el.classList.remove('error');
    });

    if (!ok) return null;
    return { name, email, orderId, amount, items };
}


document.getElementById('btn-confirm').addEventListener('click', async () => {
    const data = getFormData();
    if (!data) { showToast('Fill in all required fields', 'error'); return; }

    setLoading(true);
    try {
        await emailjs.send(ADMIN.EMAILJS_SERVICE, ADMIN.TEMPLATE_CONFIRMED, {
            customer_name: data.name,
            to_email: data.email,
            order_id: data.orderId,
            advance_amount: '₹' + data.amount,
            balance: 'remaining',
            order_items: data.items || '(see original order email)',
        });
        markOrderStatus(data.orderId, 'confirmed');
        showToast('✅ Confirmation email sent to ' + data.email, 'success');
        clearForm();
    } catch (e) {
        console.error('Confirm email failed:', e);
        showToast('Email failed: ' + (e.text || 'unknown error'), 'error');
    }
    setLoading(false);
});




function setLoading(on) {
    document.getElementById('btn-confirm').disabled = on;
}

function clearForm() {
    ['v-name', 'v-email', 'v-orderid', 'v-amount', 'v-items'].forEach(id => {
        document.getElementById(id).value = '';
    });
}

async function markOrderStatus(orderId, status) {
    try {
        await fetch(`${ADMIN.SUPABASE_URL}/rest/v1/orders?order_id=eq.${orderId}`, {
            method: 'PATCH',
            headers: {
                'apikey': ADMIN.SUPABASE_KEY,
                'Authorization': `Bearer ${ADMIN.SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ status })
        });
        loadOrders();
    } catch (e) {
        console.error('Failed to update status on Supabase:', e);
    }
}

let toastTimer;
function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'show ' + type;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.className = ''; }, 4000);
}
