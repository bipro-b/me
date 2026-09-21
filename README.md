# Biprodas Barai — Portfolio (Vanilla HTML/CSS/JS)

Zero-dependency static port of the React/Tailwind portfolio. No build step.

```
index.html          # all markup (static, SEO-friendly, icons inlined as SVG)
css/style.css       # design tokens + mobile-first layout
js/main.js          # nav/drawer, scrollspy, typewriter, tabs, carousel, form
assets/images/...   # same images (testmonial/ renamed to certificates/)
```

## Run locally
    npx serve .        # or: python3 -m http.server 8080

## Deploy
Any static host: GitHub Pages, Netlify, Cloudflare Pages, S3 + CloudFront, or NGINX.

## Replaced libraries
| React dep               | Vanilla replacement                         |
|-------------------------|---------------------------------------------|
| react-scroll            | native `scroll-behavior` + IntersectionObserver scrollspy |
| react-simple-typewriter | ~20-line typewriter in main.js              |
| react-slick             | custom carousel (arrows, dots, swipe, keys) |
| framer-motion           | CSS transitions / keyframes                 |
| react-icons             | same icons, inlined SVG                     |
| tailwindcss             | hand-written CSS with the same tokens       |

## Contact form
Client-side validation only (same as the React version). To actually deliver mail,
point the submit handler in `js/main.js` (see TODO) at Formspree / Web3Forms / your API.
