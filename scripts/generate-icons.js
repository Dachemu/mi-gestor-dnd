// Script para generar iconos PWA
// Ejecutar: node scripts/generate-icons.js

const fs = require('fs');
const { createCanvas } = require('canvas');

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Fondo púrpura
  ctx.fillStyle = '#8B5CF6';
  ctx.fillRect(0, 0, size, size);
  
  // Texto D&D
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.2}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('D&D', size / 2, size / 2 - size * 0.05);
  
  // Subtítulo Manager
  ctx.font = `${size * 0.08}px sans-serif`;
  ctx.fillStyle = '#E5E7EB';
  ctx.fillText('Manager', size / 2, size / 2 + size * 0.1);
  
  // Elementos decorativos (dados)
  ctx.fillStyle = '#F59E0B';
  const dotSize = size * 0.015;
  ctx.beginPath();
  ctx.arc(size * 0.3, size * 0.8, dotSize, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(size * 0.7, size * 0.8, dotSize, 0, 2 * Math.PI);
  ctx.fill();
  
  return canvas.toBuffer('image/png');
}

// Crear directorio public si no existe
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

// Generar iconos
const icon192 = generateIcon(192);
const icon512 = generateIcon(512);

fs.writeFileSync('public/pwa-192x192.png', icon192);
fs.writeFileSync('public/pwa-512x512.png', icon512);

console.log('✅ Iconos PWA generados correctamente');