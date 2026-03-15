<div align="center">

# 🍰 Zest & Zyme

**Discover your next favorite meal — beautifully.**

[![Live Site](https://img.shields.io/badge/Live%20Site-zestzyme.apandey.me-4A6141?style=for-the-badge&logo=vercel&logoColor=white)](https://zestzyme.apandey.me)
[![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

<br/>

> A modern, minimal recipe search app powered by [TheMealDB API](https://www.themealdb.com/api.php).  
> Search → Browse → Cook. That simple.

<br/>

![Zest & Zyme Preview](https://zestzyme.apandey.me/preview.png)

</div>

---

## ✨ Features

- 🔍 **Instant Recipe Search** — Search thousands of meals by name via TheMealDB API
- 🌙 **Dark / Light Mode** — Smooth water-fill animation on theme toggle (fills up going to night, drains going to day)
- 🃏 **Recipe Cards** — Staggered fade-in cards with hover animations and category badges
- 📖 **Full Recipe Detail** — Hero image, ingredient grid, step-by-step instructions, YouTube link
- 🍰 **Floating Food Stickers** — Decorative food emojis bobbing gently on the hero page (desktop & mobile)
- 📱 **Fully Responsive** — Optimized layout for mobile, tablet, and desktop
- ⚡ **Zero Dependencies** — Pure HTML + CSS + Vanilla JS, no build step needed

---

## 🗂️ Project Structure

```
zest-and-zyme/
├── index.html          # Main HTML skeleton
├── css/
│   ├── main.css        # Core styles — animations, header states, stickers
│   └── mobile.css      # Responsive overrides for tablet & mobile
├── js/
│   ├── api.js          # API layer — fetchRecipeByName() → TheMealDB
│   └── main.js         # UI logic — theme, render, navigation, events
└── README.md
```

> **Modular by design** — API calls, UI functions, base CSS, and mobile CSS are all in separate files with clear responsibilities and thorough comments.

---

## 🚀 Getting Started

No build step, no package manager. Just open and go.

```bash
# Clone the repo
git clone https://github.com/apandey-dev/zest-and-zyme.git

# Open in browser
cd zest-and-zyme
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

Or serve locally with any static server:

```bash
npx serve .
# → http://localhost:3000
```

---

## 🔌 API

Powered by the free [TheMealDB API](https://www.themealdb.com/api.php) — no API key required.

| Endpoint | Usage |
|---|---|
| `search.php?s={query}` | Search meals by name |

All API logic is isolated in [`js/api.js`](js/api.js):

```js
// Example usage
const meals = await fetchRecipeByName('chicken');
// → [{ idMeal, strMeal, strMealThumb, strIngredient1, ... }]
```

---

## 🎨 Design Tokens

| Token | Value | Usage |
|---|---|---|
| `brand-sage` | `#7C9473` | Accents, borders |
| `brand-leaf` | `#4A6141` | Primary text, CTA |
| `brand-terracotta` | `#E67E5F` | Badges, highlights |
| `brand-cream` | `#FDFCF8` | Light backgrounds |
| `brand-darkBg` | `#121516` | Dark mode background |
| `brand-darkCard` | `#1E2324` | Dark mode cards |

**Fonts:** [Fredoka](https://fonts.google.com/specimen/Fredoka) (display headings) · [Quicksand](https://fonts.google.com/specimen/Quicksand) (body text)

---

## 🌐 Live Demo

**[zestzyme.apandey.me](https://zestzyme.apandey.me)**

---

## 👤 Author

**Arpit Pandey** — [@apandey-dev](https://github.com/apandey-dev)

---

## 📄 License

MIT © [apandey-dev](https://github.com/apandey-dev)
