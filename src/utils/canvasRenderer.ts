import { AudioProduct, PosterConfig } from '../types';

/**
 * Preloads an image into an HTMLImageElement
 */
function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn('Image failed to preload:', src);
      resolve(img);
    };
    img.src = src;
  });
}

/**
 * Draws rounded rectangle path
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/**
 * Renders the high-resolution marketing poster onto an HTML Canvas using Blue, Yellow, and White theme
 */
export async function renderPosterToCanvas(
  canvas: HTMLCanvasElement,
  product: AudioProduct,
  config: PosterConfig
): Promise<void> {
  const isVertical = config.aspectRatio === '9:16';
  const width = 1080;
  const height = isVertical ? 1920 : 1080;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Blue, Yellow, White Palette Configuration
  let primaryBlue = '#2563EB'; // Royal Electric Blue
  let brightYellow = '#FACC15'; // High-Voltage Golden Yellow
  let secondaryBlue = '#60A5FA'; // Sky Blue
  let badgeBg = '#1E3A8A'; // Deep Cobalt Blue
  let badgeBorder = '#FACC15'; // Yellow Accent Border
  let badgeText = '#FFFFFF';

  if (config.theme === 'yellow-volt') {
    primaryBlue = '#3B82F6';
    brightYellow = '#FDE047';
    secondaryBlue = '#93C5FD';
    badgeBg = '#EAB308';
    badgeBorder = '#FFFFFF';
    badgeText = '#0B1329';
  } else if (config.theme === 'deep-navy') {
    primaryBlue = '#1D4ED8';
    brightYellow = '#EAB308';
    secondaryBlue = '#38BDF8';
    badgeBg = '#0F265C';
    badgeBorder = '#3B82F6';
    badgeText = '#FDE047';
  }

  // 1. Draw Deep Navy/Blue Industrial Gradient Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#060B18');
  bgGrad.addColorStop(0.5, '#0C162E');
  bgGrad.addColorStop(1, '#070E20');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle acoustic sound grid
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.07)';
  ctx.lineWidth = 1;
  const gridStep = isVertical ? 60 : 54;
  for (let x = 0; x < width; x += gridStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Electric Blue Aura behind product center
  const auraX = width / 2;
  const auraY = isVertical ? 680 : 440;
  const auraRad = isVertical ? 520 : 360;
  const auraGrad = ctx.createRadialGradient(auraX, auraY, 30, auraX, auraY, auraRad);
  auraGrad.addColorStop(0, 'rgba(37, 99, 235, 0.22)');
  auraGrad.addColorStop(0.7, 'rgba(250, 204, 21, 0.05)');
  auraGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(auraX, auraY, auraRad, 0, Math.PI * 2);
  ctx.fill();

  // 2. Top Header Bar
  const headerTop = isVertical ? 60 : 40;

  // Brand Name Box (Clean Crisp White & Yellow)
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 46px "Outfit", sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('PEAVEY', 60, headerTop + 38);

  // Brand line subtext in Vibrant Yellow
  ctx.font = '700 13px "Space Mono", monospace';
  ctx.fillStyle = brightYellow;
  ctx.letterSpacing = '1.5px';
  ctx.fillText('COMMERCIAL AUDIO SYSTEMS', 60, headerTop + 62);
  ctx.restore();

  // Top Right: Brand Logo Placeholder or Uploaded Logo
  const logoW = 200;
  const logoH = 54;
  const logoX = width - 60 - logoW;
  const logoY = headerTop + 14;

  if (config.distributorLogo) {
    try {
      const userLogoImg = await preloadImage(config.distributorLogo);
      if (userLogoImg.complete && userLogoImg.naturalWidth > 0) {
        ctx.save();
        const scale = Math.min((logoW - 16) / userLogoImg.naturalWidth, (logoH - 12) / userLogoImg.naturalHeight);
        const dw = userLogoImg.naturalWidth * scale;
        const dh = userLogoImg.naturalHeight * scale;
        
        roundRect(ctx, logoX, logoY, logoW, logoH, 8);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fill();
        ctx.strokeStyle = primaryBlue;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.drawImage(userLogoImg, logoX + (logoW - dw) / 2, logoY + (logoH - dh) / 2, dw, dh);
        ctx.restore();
      }
    } catch (e) {
      console.warn('Error drawing logo on canvas:', e);
    }
  } else if (config.showBrandLogoPlaceholder !== false) {
    // Beautiful Blue & Yellow placeholder for user's brand logo
    ctx.save();
    roundRect(ctx, logoX, logoY, logoW, logoH, 8);
    ctx.strokeStyle = brightYellow;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(30, 58, 138, 0.35)';
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 12px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('YOUR BRAND LOGO', logoX + logoW / 2, logoY + logoH / 2 - 7);

    ctx.fillStyle = brightYellow;
    ctx.font = '700 9px "Space Mono", monospace';
    const subLabel = (config.distributorCompanyName || 'REGIONAL DISTRIBUTOR').toUpperCase();
    ctx.fillText(subLabel.length > 22 ? subLabel.slice(0, 20) + '...' : subLabel, logoX + logoW / 2, logoY + logoH / 2 + 9);
    ctx.restore();
  }

  // Hairline separator in Electric Blue
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, headerTop + 82);
  ctx.lineTo(width - 60, headerTop + 82);
  ctx.stroke();

  // 3. Custom Badge / Headline
  const badgeY = headerTop + 100;
  const badgeTextContent = config.customBadge || 'SI EXCLUSIVE PROJECT PRICING';

  ctx.save();
  ctx.font = '700 14px "Space Mono", monospace';
  const badgeWidth = ctx.measureText(badgeTextContent).width + 36;
  roundRect(ctx, 60, badgeY, badgeWidth, 34, 6);
  ctx.fillStyle = badgeBg;
  ctx.fill();
  ctx.strokeStyle = badgeBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = badgeText;
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeTextContent, 78, badgeY + 17);
  ctx.restore();

  // 4. Hero Product Image Frame (with standardized proportional normalizer)
  const imgY = isVertical ? 250 : 190;
  const imgW = isVertical ? 960 : 540;
  const imgH = isVertical ? 580 : 420;
  const imgX = 60;

  // Blue card border with crisp lighting
  roundRect(ctx, imgX, imgY, imgW, imgH, 14);
  ctx.fillStyle = '#0F182B';
  ctx.fill();
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Preload and render image with auto-fit consistency
  if (product.imagePath) {
    try {
      const img = await preloadImage(product.imagePath);
      if (img.complete && img.naturalWidth > 0) {
        ctx.save();
        roundRect(ctx, imgX + 2, imgY + 2, imgW - 4, imgH - 4, 12);
        ctx.clip();

        // Proportional scale to fit beautifully without distortion
        const scale = Math.max(imgW / img.naturalWidth, imgH / img.naturalHeight);
        const nw = img.naturalWidth * scale;
        const nh = img.naturalHeight * scale;
        const nx = imgX + (imgW - nw) / 2;
        const ny = imgY + (imgH - nh) / 2;

        ctx.drawImage(img, nx, ny, nw, nh);

        // Soft gradient overlay at bottom
        const scrim = ctx.createLinearGradient(0, imgY + imgH - 120, 0, imgY + imgH);
        scrim.addColorStop(0, 'transparent');
        scrim.addColorStop(1, 'rgba(6, 11, 24, 0.92)');
        ctx.fillStyle = scrim;
        ctx.fillRect(imgX, imgY + imgH - 120, imgW, 120);

        ctx.restore();
      }
    } catch (e) {
      console.warn('Canvas image render error:', e);
    }
  }

  // Official Peavey authenticity watermark
  ctx.save();
  ctx.font = '700 12px "Space Mono", monospace';
  ctx.fillStyle = brightYellow;
  ctx.fillText(`GENUINE PEAVEY ELECTRONICS · FACTORY SPEC`, imgX + 22, imgY + imgH - 20);
  ctx.restore();

  // 5. Product Title, Category, Tagline
  const titleX = isVertical ? 60 : 630;
  const titleY = isVertical ? 880 : 210;

  ctx.save();
  // Category Kicker in Electric Blue
  ctx.font = '700 15px "Space Mono", monospace';
  ctx.fillStyle = secondaryBlue;
  ctx.letterSpacing = '1.5px';
  ctx.fillText(product.category.toUpperCase(), titleX, titleY);

  // Model Name in White with Outfit font
  ctx.font = isVertical ? '800 56px "Outfit", sans-serif' : '800 48px "Outfit", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.letterSpacing = '0.5px';
  ctx.fillText(product.model, titleX, titleY + (isVertical ? 54 : 48));

  // Tagline in light slate
  ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#CBD5E1';
  ctx.fillText(product.shortTagline, titleX, titleY + (isVertical ? 88 : 80));
  ctx.restore();

  // 6. Technical Spec Grid (4 Key Highlights)
  const specStartY = isVertical ? 1010 : 340;
  const specStartX = isVertical ? 60 : 630;
  const specBoxW = isVertical ? 465 : 190;
  const specBoxH = isVertical ? 96 : 82;
  const specGapX = isVertical ? 30 : 15;
  const specGapY = isVertical ? 18 : 14;

  product.keySpecs.slice(0, 4).forEach((spec, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const sx = specStartX + col * (specBoxW + specGapX);
    const sy = specStartY + row * (specBoxH + specGapY);

    roundRect(ctx, sx, sy, specBoxW, specBoxH, 10);
    ctx.fillStyle = '#0F1A33';
    ctx.fill();
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Spec label
    ctx.save();
    ctx.font = '600 12px "Space Mono", monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(spec.label.toUpperCase(), sx + 18, sy + 28);

    // Spec Value (White bold)
    ctx.font = isVertical ? '800 24px "Outfit", sans-serif' : '800 20px "Outfit", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(spec.value, sx + 18, sy + (isVertical ? 60 : 54));

    // Spec unit/detail in Yellow
    if (spec.unit) {
      ctx.font = '700 13px "Outfit", sans-serif';
      ctx.fillStyle = brightYellow;
      const valW = ctx.measureText(spec.value).width;
      ctx.fillText(spec.unit, sx + 18 + valW + 8, sy + (isVertical ? 60 : 54));
    }
    ctx.restore();
  });

  // 7. Target Applications Bar
  if (isVertical) {
    const appsY = 1250;
    roundRect(ctx, 60, appsY, 960, 90, 10);
    ctx.fillStyle = 'rgba(15, 26, 51, 0.7)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.25)';
    ctx.stroke();

    ctx.save();
    ctx.font = '700 13px "Space Mono", monospace';
    ctx.fillStyle = brightYellow;
    ctx.fillText('APPLICATIONS:', 84, appsY + 34);

    ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(product.targetApplications.join('   ·   '), 84, appsY + 64);
    ctx.restore();
  }

  // 8. Commercial & Pricing Box (Deep Navy with Blue/Yellow accents)
  const commY = isVertical ? 1370 : 540;
  const commW = 960;
  const commX = 60;
  const commH = isVertical ? 220 : 200;

  roundRect(ctx, commX, commY, commW, commH, 14);
  const commGrad = ctx.createLinearGradient(commX, commY, commX + commW, commY);
  commGrad.addColorStop(0, '#0F1D3D');
  commGrad.addColorStop(1, '#0C162E');
  ctx.fillStyle = commGrad;
  ctx.fill();
  ctx.strokeStyle = primaryBlue;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Availability status (No numeric quantity)
  ctx.save();
  ctx.font = '700 13px "Space Mono", monospace';
  const stockText = '● READY STOCK · BHUBANESWAR CENTRAL DEPOT';
  ctx.fillStyle = brightYellow;
  ctx.fillText(stockText, commX + 28, commY + 38);

  // Warranty & GST in White/Slate
  ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#E2E8F0';
  ctx.fillText(`${product.warrantyYears}-Year Peavey Comprehensive Manufacturer Warranty  ·  GST Invoice`, commX + 28, commY + 68);

  // Pricing display
  if (config.showPrice) {
    if (config.priceType === 'si-net' || config.priceType === 'mrp-and-net') {
      ctx.font = '700 13px "Space Mono", monospace';
      ctx.fillStyle = secondaryBlue;
      ctx.fillText('SPECIAL SI NET RATE:', commX + 28, commY + 116);

      ctx.font = '900 44px "Outfit", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      const netText = `₹${product.siB2BPrice.toLocaleString('en-IN')}`;
      ctx.fillText(netText, commX + 28, commY + 164);

      ctx.font = '700 17px "Outfit", sans-serif';
      ctx.fillStyle = brightYellow;
      const netW = ctx.measureText(netText).width;
      ctx.fillText('+ GST', commX + 28 + netW + 12, commY + 160);

      if (config.priceType === 'mrp-and-net') {
        const mrpText = `MRP: ₹${product.mrp.toLocaleString('en-IN')}`;
        ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#64748B';
        ctx.fillText(mrpText, commX + 28 + netW + 86, commY + 160);

        const mrpW = ctx.measureText(mrpText).width;
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(commX + 28 + netW + 84, commY + 154);
        ctx.lineTo(commX + 28 + netW + 86 + mrpW, commY + 154);
        ctx.stroke();
      }
    } else {
      ctx.font = '800 24px "Outfit", sans-serif';
      ctx.fillStyle = brightYellow;
      ctx.fillText('SPECIAL PROJECT BOQ PRICING', commX + 28, commY + 130);
    }
  } else {
    ctx.font = '800 24px "Outfit", sans-serif';
    ctx.fillStyle = brightYellow;
    ctx.fillText('PROJECT BOQ PRICING ON REQUEST', commX + 28, commY + 130);
  }
  ctx.restore();

  // 9. Footer Contact Strip in White, Yellow and Blue
  const footerY = isVertical ? 1620 : 770;
  const footerH = isVertical ? 240 : 250;

  roundRect(ctx, 60, footerY, 960, footerH, 14);
  ctx.fillStyle = '#081124';
  ctx.fill();
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
  ctx.stroke();

  ctx.save();
  // WhatsApp Call to action header
  ctx.font = '800 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = secondaryBlue;
  ctx.fillText('DIRECT ENQUIRIES & DISPATCH', 90, footerY + 44);

  // Phone / WhatsApp highlight in Golden Yellow
  ctx.font = '900 38px "Outfit", sans-serif';
  ctx.fillStyle = brightYellow;
  ctx.letterSpacing = '1px';
  ctx.fillText(`WHATSAPP: ${config.contactNumber || '+91 94370 12345'}`, 90, footerY + 96);

  // Contact person and location in Crisp White
  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(`${config.contactPerson || 'Pro Audio Sales Desk'} · Bhubaneswar Central Depot`, 90, footerY + 138);

  // Bottom trust footer in Light Blue
  ctx.font = '700 12px "Space Mono", monospace';
  ctx.fillStyle = '#93C5FD';
  const companyTitle = (config.distributorCompanyName || 'AUTHORIZED DISTRIBUTOR').toUpperCase();
  ctx.fillText(`${companyTitle} · PEAVEY COMMERCIAL AUDIO (ODISHA)`, 90, footerY + 188);
  ctx.restore();
}

/**
 * Generates formatted WhatsApp marketing text copy ready to send to SIs
 */
export function generateWhatsAppMessage(
  product: AudioProduct,
  config: PosterConfig,
  customNotes?: string
): string {
  const specsText = product.keySpecs
    .map((s) => `• *${s.label}:* ${s.value} ${s.unit || ''}`)
    .join('\n');

  const appsText = product.targetApplications.join(', ');

  const fivePercentRebate = Math.round(product.siB2BPrice * 0.05);
  const netEffectivePrice = product.siB2BPrice - fivePercentRebate;

  let priceSection = '';
  if (config.showPrice) {
    if (config.priceType === 'si-net') {
      priceSection = `💰 *Dealer Net Rate:* ₹${product.siB2BPrice.toLocaleString('en-IN')} + GST\n🎁 *Distributor 5% Rebate:* ₹${netEffectivePrice.toLocaleString('en-IN')} + GST (Save ₹${fivePercentRebate.toLocaleString('en-IN')})\n`;
    } else if (config.priceType === 'mrp-and-net') {
      priceSection = `💰 *Dealer Net Rate:* ₹${product.siB2BPrice.toLocaleString('en-IN')} + GST (MRP: ₹${product.mrp.toLocaleString('en-IN')})\n🎁 *Distributor 5% Rebate:* ₹${netEffectivePrice.toLocaleString('en-IN')} + GST (Save ₹${fivePercentRebate.toLocaleString('en-IN')})\n`;
    } else {
      priceSection = `💰 *Pricing:* Special Project Rates with 5% Distributor Rebate available on request\n`;
    }
  }

  const badgeText = config.customBadge ? `📢 *${config.customBadge}*\n\n` : '';
  const noteText = customNotes ? `\n💡 *Project Note:* ${customNotes}\n` : '';
  const distributorName = config.distributorCompanyName || 'Authorized Peavey Regional Partner';

  return `*${product.brand.toUpperCase()} ${product.model.toUpperCase()}*
_${product.shortTagline}_

${badgeText}Dear Partner,
Here is our featured Peavey commercial audio solution for System Integrators in Odisha:

🔧 *Key Technical Specifications:*
${specsText}

🎯 *Target Applications:*
${appsText}

📦 *Availability:* Ready Stock (Odisha Central Depot — Immediate dispatch)
🛡️ *Warranty:* ${product.warrantyYears}-Year Official Peavey Comprehensive Manufacturer Warranty (100% GST Invoice)
${priceSection}${noteText}
📍 *Distributor:* ${distributorName} (Odisha Central Depot)
📞 *Contact for BOQ / Demos:* ${config.contactNumber || '+91 94370 00000'} (${config.contactPerson || 'Sales Desk'})

_Reply to this message for spec sheet PDF or project quote._`;
}
