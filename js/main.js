

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

document.addEventListener('DOMContentLoaded', initScrollReveal);

