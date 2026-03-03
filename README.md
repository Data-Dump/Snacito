# SNACITO — Digital Menu 🍫

A premium digital menu website for **SNACITO**, a handcrafted snack brand at the college food court.  
Built as a single-page web app — mobile & desktop optimised, ready to deploy on Vercel / Netlify / GitHub Pages.

---

## 📁 Project Structure

```
snacito/
├── index.html        ← Main HTML (structure & content)
├── css/
│   └── style.css     ← All styles (variables, layout, components)
├── js/
│   └── main.js       ← Tab switching + scroll-reveal logic
└── README.md
```

---

## 🍽️ Menu Categories

| Category | Items |
|---|---|
| 🧇 Waffles | Single / Double / Triple Layer — Milk, Dark, Mix, KitKat |
| 🍫 Mini Choco Puffs | 5 / 8 / 12 pieces — Milk, Dark, Mix |
| 🍟 BYOB | Normal Bag with Veggies — ₹39 |

---

## ✨ Features

- Animated gold ticker strip
- Shimmer effect on hero title
- Sticky filter nav tabs (All / Waffles / Choco Puffs / BYOB)
- Dotted price leaders (classic fine-dining menu style)
- Scroll-reveal animations via IntersectionObserver
- Fully responsive — mobile & desktop
- Zero dependencies — pure HTML, CSS, JS

---

## 🚀 Deploy

### Vercel (recommended)
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Select the repo → Deploy (no build config needed)

### GitHub Pages
1. Go to **Settings → Pages**
2. Source: `main` branch, `/ (root)`
3. Save — your site goes live at `https://<username>.github.io/<repo>`

---

## 🛠️ Local Development

Just open `index.html` in any browser — no build step required.

```bash
# Or serve with a simple local server:
npx serve .
```

---

*Fresh · Handcrafted · Made with Love — SNACITO @ College Food Court*
