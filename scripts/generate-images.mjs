// Generates offline fallback SVG images into public/images (used if a product photo fails to load).
// Run: node scripts/generate-images.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const products = JSON.parse(readFileSync('src/data/products.json', 'utf8'));
const colors = { kitchen: ['#2f8f83', '#bfe6df'], dining: ['#e59a2f', '#fbe3bd'], decor: ['#c4556b', '#f6d0d8'], appliances: ['#5b6fd6', '#d5dbfa'], essentials: ['#7a8a3a', '#e3e9c6'], furniture: ['#8a6a4f', '#ead9c9'] };
const glyph = {
  kitchen: '<circle cx="200" cy="170" r="70" fill="#fff" opacity=".9"/><rect x="265" y="160" width="90" height="20" rx="10" fill="#fff" opacity=".9"/>',
  dining: '<rect x="170" y="90" width="60" height="150" rx="14" fill="#fff" opacity=".9"/><rect x="185" y="60" width="30" height="36" rx="6" fill="#fff" opacity=".7"/>',
  decor: '<path d="M200 90 C150 130 150 230 200 250 C250 230 250 130 200 90Z" fill="#fff" opacity=".9"/><circle cx="200" cy="80" r="22" fill="#fff" opacity=".7"/>',
  appliances: '<rect x="120" y="110" width="160" height="120" rx="10" fill="#fff" opacity=".9"/><rect x="120" y="95" width="160" height="28" rx="6" fill="#fff" opacity=".7"/>',
  essentials: '<rect x="160" y="100" width="80" height="140" rx="16" fill="#fff" opacity=".9"/><circle cx="200" cy="140" r="18" fill="currentColor"/>',
};
glyph.furniture = glyph.appliances;
mkdirSync('public/images', { recursive: true });
for (const p of products) {
  const [dark, light] = colors[p.category];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" color="${dark}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs>
<rect width="400" height="320" fill="url(#g)"/>${glyph[p.category]}
<text x="200" y="295" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#fff">${p.name.split(' ').slice(0, 3).join(' ').replace(/&/g, '&amp;')}</text></svg>`;
  writeFileSync(`public/images/${p.id}.svg`, svg);
}
writeFileSync('public/favicon.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#2d4f8b"/><text x="16" y="22" text-anchor="middle" font-family="Arial" font-weight="700" font-size="16" fill="#fff">mS</text></svg>');
console.log(`Generated ${products.length} images`);
