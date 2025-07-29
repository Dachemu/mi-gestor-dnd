const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSvgToPng() {
  const svgPath = path.join(__dirname, '..', 'public', 'icon.svg');
  const outputDir = path.join(__dirname, '..', 'public');
  
  try {
    // Leer el SVG
    const svgBuffer = fs.readFileSync(svgPath);
    
    // Convertir a PNG 192x192
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(outputDir, 'pwa-192x192.png'));
    
    // Convertir a PNG 512x512
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(outputDir, 'pwa-512x512.png'));
    
    // Crear favicon 32x32
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(outputDir, 'favicon-32x32.png'));
    
    console.log('✅ Iconos PNG generados correctamente:');
    console.log('  - pwa-192x192.png');
    console.log('  - pwa-512x512.png');
    console.log('  - favicon-32x32.png');
    
  } catch (error) {
    console.error('❌ Error al convertir SVG a PNG:', error);
  }
}

convertSvgToPng();