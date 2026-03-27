# SNACITO — The Complete Digital Platform 🍫

A premium, full-featured web application for **SNACITO**, a handcrafted snack brand at HackJKLU v5.0, Near GH-2 and Sabrang Ground
This repository contains the complete three-part frontend platform: the Digital Menu, the Online-Order Wizard, and the Admin Panel. 

Built entirely with pure HTML, CSS, and Vanilla JavaScript (zero frameworks).

---

## 📁 Architecture

```text
snacito/
├── index.html                ← The Digital Menu (Landing Page)
├── css/
│   └── style.css             ← Core design system & utilities
├── online-order/
│   ├── index.html            ← The 3-Step Online-Order Wizard
│   ├── style.css             ← Wizard-specific UI styles
│   └── main.js               ← Complex cart logic, EmailJS, Razorpay, Supabase
└── admin/
    ├── index.html            ← Secure Dashboard UI
    └── admin.js              ← Authentication, Order fetching, WhatsApp templates
```

---

## 🚀 The Three Apps

### 1. The Digital Menu (`/`)
An elegant, fine-dining inspired digital menu. Features smooth scroll-reveals, sticky category filters, dotted price leaders, and high-performance CSS animations. 

### 2. The Online-Order Wizard (`/online-order`)
A highly dynamic, mobile-first ordering experience:
* **Dynamic Form Generation:** "Mini Choco Puffs" and "BYOB" dynamically generate individual sub-configuration blocks (e.g., "Pack 1", "Pack 2") based on quantity selected, allowing per-item customization (Milk/Dark/Mix coatings + Addons).
* **Live Cart Calculation:** Real-time calculation of totals, mix-premiums, addon costs, and the 50% UPI advance requirement.
* **Integrations:**
    * **Supabase:** Securely stores order details for real-time tracking via the Admin Panel.
    * **Payments:** Core logic for UPI intent generation and dynamic QR Code generation for 50% advance.

### 3. The Admin Dashboard (`/admin`)
A secure operations hub.
* **Obfuscated Gateway:** Access restricted by a base64-encoded passkey logic checking.
* **Live Feed:** Pulls realtime orders from the Supabase backend.
* **Action Center:** Quickly trigger verification emails via EmailJS, mark orders as Confirmed or Not Received, and easily contact customers via pre-filled WhatsApp `wa.me` templates for unverified payments or edge-cases.

---

## ⚙️ Integrations & Config

Before deploying, ensure the `CONFIG` object in `online-order/main.js` and `ADMIN` object in `admin/admin.js` are populated with your live API keys:

- **EmailJS:** Public Key, Service ID, Template IDs
- **Supabase:** Database URL, Anon Key
- **UPI:** Merchant VPA and Name

*(Note: The codebase has been fully stripped of development comments to reduce bundle size and prevent leakage of business logic logic structure.)*

---

*Fresh · Handcrafted · Made with Love — SNACITO @ HackJKLU v5.0, Tech Lawn, JKLU*
