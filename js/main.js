
const CONFIG = {
  SUPABASE_URL: 'https://iezszlgxyqizdqazrner.supabase.co',
  SUPABASE_KEY: 'sb_publishable_Wy7qNiMG3d_GXmes2-htUw_TKkFi611'
};

const SECTIONS = ['waffles', 'puffs', 'byob'];

function showSection(id) {

  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  const activeTab = document.getElementById('tab-' + id);
  if (activeTab) activeTab.classList.add('active');

  if (id === 'all') {
    SECTIONS.forEach(s => {
      const el = document.getElementById('section-' + s);
      if (el) el.style.display = 'block';
    });
  } else {
    SECTIONS.forEach(s => {
      const el = document.getElementById('section-' + s);
      if (el) el.style.display = (s === id) ? 'block' : 'none';
    });
  }
}

function initScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  trackVisit();
});

async function trackVisit() {
  if (sessionStorage.getItem('snacito_website_visited')) return;

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
      body: JSON.stringify({ page_name: 'website' })
    });
    sessionStorage.setItem('snacito_website_visited', 'true');
  } catch (e) {
    console.error('Failed to track visit:', e);
  }
}
