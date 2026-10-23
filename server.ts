import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Server-side Gemini client for B2B Pro Audio AI generation
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Peavey Pro Audio Marketing Engine',
    region: 'Odisha, India',
  });
});

// AI Endpoint: Generate tailor-made WhatsApp pitch copy for Odisha System Integrators
app.post('/api/generate-si-pitch', async (req: Request, res: Response) => {
  try {
    const { product, targetProject, tone, customOffer } = req.body;

    if (!product || !product.brand || !product.model) {
      return res.status(400).json({ error: 'Missing required product data' });
    }

    const siDealerPrice = Number(product.siB2BPrice) || 0;
    const distributorDiscountAmount = Math.round(siDealerPrice * 0.05);
    const netDiscountedPrice = siDealerPrice - distributorDiscountAmount;

    const lockedOfferDescription = customOffer || 
      `Special 5% Distributor Rebate: ₹${netDiscountedPrice.toLocaleString('en-IN')} + GST (Flat 5% discount saving ₹${distributorDiscountAmount.toLocaleString('en-IN')} off Dealer Net ₹${siDealerPrice.toLocaleString('en-IN')}) with immediate dispatch from Bhubaneswar Central Depot`;

    const prompt = `You are a Senior B2B Pro Audio Solutions Consultant representing the authorized regional distribution partner for Peavey commercial audio systems in Odisha, India.
Write a compelling, spec-accurate, high-converting WhatsApp marketing message and technical pitch tailored specifically for System Integrators (SIs), AV consultants, and project contractors.

Product Details:
- Brand: ${product.brand}
- Model: ${product.model}
- Category: ${product.category}
- Tagline: ${product.shortTagline || ''}
- Key Specs: ${(product.keySpecs || []).map((s: any) => `${s.label}: ${s.value} ${s.unit || ''}`).join(', ')}
- Target Applications: ${(product.targetApplications || []).join(', ')}
- Stock Status: ${product.stockStatus || 'In Stock'} (Ready stock in central Bhubaneswar warehouse)
- Net SI Dealer Price: ₹${siDealerPrice.toLocaleString('en-IN')} (MRP: ₹${(product.mrp || 0).toLocaleString('en-IN')})
- Mandatory Distributor Offer: ALWAYS feature the 5% Distributor Rebate: ₹${netDiscountedPrice.toLocaleString('en-IN')} + GST (Dealer saves ₹${distributorDiscountAmount.toLocaleString('en-IN')} on this order)
- Warranty: ${product.warrantyYears || 3} Years Official Peavey Comprehensive Manufacturer Warranty

Target Project/Audience Context: ${targetProject || 'Auditoriums, Heritage Temples, Banquet Halls & Mandaps across Odisha (Bhubaneswar, Cuttack, Puri, Rourkela)'}
Sales Angle / Tone: ${tone || 'Authoritative Engineering & Exclusive Commercial Margin for SIs'}
Distributor Incentive: ${lockedOfferDescription}

Formatting Requirements:
1. Start with an eye-catching headline suitable for WhatsApp status/broadcast (e.g. 📢 [ODISHA SI STOCK ALERT] or 🔊 [BOQ EXCLUSIVE]).
2. 3-4 bullet points emphasizing why this piece of pro audio gear is technically and commercially ideal for System Integrators (headroom, reliability, acoustic dispersion, thermal efficiency, installation simplicity).
3. Explicit commercial perks: Always highlight the 5% Distributor Rebate on Dealer Price (Net: ₹${netDiscountedPrice.toLocaleString('en-IN')} + GST), Genuine Peavey factory hardware, 100% GST invoice for input tax credit, local warranty dispatch in Odisha.
4. Clear call-to-action to lock in the 5% distributor discount, request BOQ pricing, tender spec sheets, or immediate warehouse dispatch.

Return STRICTLY valid JSON conforming to this schema without markdown code blocks:
{
  "headline": "Short punchy status line",
  "whatsappBody": "Full formatted WhatsApp message text with appropriate line breaks and formatting (*bold*, _italic_, bullet points)",
  "siKeyBenefits": ["Benefit 1", "Benefit 2", "Benefit 3"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating SI pitch via Gemini:', error);
    // Graceful fallback with mandatory 5% distributor discount calculation
    const fallbackDealerPrice = Number(req.body?.product?.siB2BPrice) || 0;
    const fallbackDiscount = Math.round(fallbackDealerPrice * 0.05);
    const fallbackNet = fallbackDealerPrice - fallbackDiscount;

    const fallbackData = {
      headline: `🚨 [ODISHA SI EXCLUSIVE] PEAVEY ${req.body?.product?.model?.toUpperCase() || ''} · 5% DISTRIBUTOR REBATE`,
      whatsappBody: `*PEAVEY ${req.body?.product?.model?.toUpperCase()}*\n_${req.body?.product?.shortTagline || 'Peavey Commercial Audio System'}_\n\nDear Partner,\nWe have ready inventory of this premium equipment in our central Bhubaneswar warehouse, ready for immediate dispatch to your ongoing projects across Odisha.\n\n💰 *EXCLUSIVE DISTRIBUTOR OFFER (5% OFF DEALER NET):*\n• Dealer Net Price: ₹${fallbackDealerPrice.toLocaleString('en-IN')} + GST\n• *Your Special Rebate Price (5% Off): ₹${fallbackNet.toLocaleString('en-IN')} + GST*\n• *Instant SI Savings: ₹${fallbackDiscount.toLocaleString('en-IN')}*\n\n✓ *100% Genuine Peavey Factory Hardware*\n✓ *${req.body?.product?.warrantyYears || 3}-Year Comprehensive Manufacturer Warranty*\n✓ *GST Input Tax Credit Invoice*\n✓ *Ready Stock at Bhubaneswar Central Depot (24h Dispatch)*\n\nContact us on WhatsApp to lock in your 5% distributor rebate and arrange immediate dispatch.`,
      siKeyBenefits: [
        `5% Distributor Rebate: Save ₹${fallbackDiscount.toLocaleString('en-IN')} per unit directly from Bhubaneswar Depot`,
        'Tour-proven reliability under extreme electrical and thermal conditions',
        'Direct local dispatch across all 30 Odisha districts with zero interstate transit delays',
      ],
    };
    return res.json({ success: true, data: fallbackData, isFallback: true });
  }
});

// Production vs Development middleware handling
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
