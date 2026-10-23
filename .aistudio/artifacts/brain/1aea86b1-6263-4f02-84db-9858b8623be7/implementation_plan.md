# Implementation Plan: Pure Peavey Audio, Custom Distributor Branding & Image Consistency Engine

Remove all ProFX branding across the applet, transition the catalog to 100% authentic Peavey Pro Audio hardware (featuring the Peavey CS® 4000 and IPR2™ 5000 DSP series), center all distributorship identity around the user's custom brand logo and company name, and establish a **Product Image Consistency Architecture** to guarantee visual accuracy as per official catalog specifications.

## User Review & Critical Decisions

> [!IMPORTANT]
> ### Product Image Consistency & Originality Strategy
> To ensure product images are **always consistent, authentic, and true to the Peavey catalog**, the system implements a four-pillar visual engine:
> 1. **Canonical Master Asset Registry**: Every SKU in the catalog is bound to a verified, high-resolution master asset with deterministic path resolution stored locally (`/src/assets/images/...`), preventing broken external links, random AI drift, or generic mockups.
> 2. **Per-SKU Image Manager & Warehouse Photo Uploader**: In both the Inventory Manager and Poster Studio, distributors can inspect the active image, upload official Peavey catalog cuts or real warehouse depot photos, or input direct CDN URLs.
> 3. **Canvas Optical Normalizer**: The canvas renderer automatically normalizes uploaded photos using proportional aspect fitting, dark background integration, acoustic aura lighting, and an official authenticity badge (`PEAVEY ELECTRONICS · AUTHENTIC FACTORY SPEC`) so every poster has identical studio quality regardless of photo source.
> 4. **One-Click Factory Reset**: A safety fallback allowing distributors to instantly revert any SKU to the original Peavey factory catalog photo with one click.

---

## 1. Overview & Core Concept

- **Core Capability**: Daily marketing poster generator and WhatsApp broadcast engine tailored for authorized Peavey commercial audio equipment in the Odisha region.
- **Distributor Ownership**: The distributor's own brand logo and company title take center stage alongside Peavey's world-renowned audio hardware.
- **Target Audience**: System Integrators (SIs), acoustic consultants, sound contractors, and project installers in Odisha working on auditoriums, banquet halls, temple mandaps, and corporate installations.

---

## 2. Ensuring Product Images Are Consistent & Original

### 1. Master Peavey Product Visuals (Canonical Registry)
Every SKU is mapped to an exact, authentic product image representing its genuine physical chassis:
- **Peavey CS® 4000**: Distinctive 2RU heavy-duty steel chassis, twin detented front gain controls, LED ladder array (Power, Activity, DDT™), and heavy-duty front rack handles.
- **Peavey IPR2™ 5000 DSP**: Contemporary illuminated blue front panel, lightweight pierced-aluminum front grille, backlit LCD parameter screen for DSP control.
- **Peavey Aureus™ 28 Mixer**: 10-inch capacitive touch display, 14 motorized faders, glowing backlit channel select buttons.
- **Peavey Versarray™ 112 Mk II**: Textured black polyurea enclosure, neodymium planar ribbon driver, perforated steel acoustic grille.
- **Peavey Elements™ 108C**: Marine-grade weatherized composite enclosure with stainless steel grille.

### 2. Standardized Studio Canvas Staging
To guarantee visual consistency even when custom distributor photos are loaded:
- **Proportional Auto-Fit Container**: The canvas renderer never squashes, stretches, or distorts the hardware's aspect ratio.
- **Subtle Acoustic Gradient Aura**: A radial gradient aura matched to the theme (`#2563EB` Cobalt Blue or `#FACC15` Yellow) sits behind the amplifier or speaker, giving all images consistent depth.
- **Seamless Bottom Gradient Scrim**: The lower 120px of the image frame blends smoothly into the card surface, ensuring clean contrast for specifications below.

### 3. SKU Image Customizer & Factory Restore
- **Inline Image Updater**: A dedicated image picker in both `InventoryManager` and `PosterStudio` allowing the user to upload new official catalog photos (PNG/JPG) or unboxed warehouse depot photos.
- **Factory Image Revert**: If an uploaded photo doesn't look right, a single click restores the original Peavey catalog image immediately.

---

## 3. Brand & Layout Redirection

### Brand Transformation:
- **Complete Removal of ProFX**:
  - Replace "PROFX ODISHA" in the top bar with the user's custom company name and brand logo.
  - Footers, watermarks, and WhatsApp text templates replace all ProFX references with direct Peavey manufacturer warranty and the distributor's own sales desk.
- **Distributor Company Name Editor**:
  - Editable in the Header / Settings (stored in `localStorage`), allowing distributors to set their trading name (e.g. "SOUND CRAFT ODISHA", "EASTERN AUDIO LABS", or any custom identity).
- **100% Peavey Pro Audio Catalog**:
  - Crest Audio models fully replaced by **Peavey CS® 4000** and **Peavey IPR2™ 5000 DSP**.
  - All brand filters and category tags reflect Peavey pro audio lines.

---

## 4. Technical Architecture & Component Mapping

```
┌────────────────────────────────────────────────────────────────────────┐
│                   App State & Persistence (localStorage)               │
│  • catalog (100% Peavey: CS 4000, IPR2 5000, Aureus, Versarray, etc.) │
│  • distributorLogo (Data URL / PNG)                                    │
│  • distributorCompanyName (string, customizable)                       │
│  • canonicalImageRegistry (factory defaults backup)                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
       ┌────────────────────────────┼───────────────────────────┐
       ▼                            ▼                           ▼
┌──────────────┐           ┌─────────────────┐         ┌────────────────┐
│    Header    │           │  SpotlightHub   │         │  PosterStudio  │
│ • User Logo  │           │ • 7-Day Cal.    │         │ • Canvas 9:16  │
│ • Co. Name   │           │ • CS 4000       │         │ • Canvas 1:1   │
│ • Tabs       │           │ • IPR2 5000 DSP │         │ • Image Picker │
└──────────────┘           └─────────────────┘         └───────┬────────┘
                                                               │
                                                               ▼
                                                      ┌─────────────────┐
                                                      │  canvasRenderer │
                                                      │ • Blue/Yellow/  │
                                                      │   White Theme   │
                                                      │ • Auto-Fit Card │
                                                      │ • Peavey Specs  │
                                                      └─────────────────┘
```

### Steps for Execution:
1. **Peavey Power Amps Image & Spec Assets**:
   - Generate/link high-fidelity authentic visual assets for the **Peavey CS® 4000** and **Peavey IPR2™ 5000 DSP**.
   - Store factory defaults in a read-only registry so products can always be restored to original catalog imagery.
2. **Catalog & Type System Overhaul**:
   - Update `types/index.ts` and `defaultCatalog.ts` to replace Crest models with the Peavey CS 4000 and IPR2 5000 DSP.
   - Remove Crest Audio references from brand enums and filters.
3. **Image Consistency & Customizer UI**:
   - In `PosterStudio.tsx`, add an Image Asset control allowing the user to view the active image, upload a new catalog cut, or click "Restore Factory Photo".
   - In `InventoryManager.tsx`, add an image preview thumbnail and image upload/reset capability for each SKU.
4. **Distributor Identity & Complete ProFX Removal**:
   - Remove every trace of "ProFX" in `Header.tsx`, `canvasRenderer.ts`, `PosterStudio.tsx`, `SpotlightHub.tsx`, `WhatsAppBroadcastPreview.tsx`, and `server.ts`.
   - Add inline editing for `distributorCompanyName` alongside the brand logo uploader in `Header.tsx` and `PosterStudio.tsx`.
5. **Build Verification**:
   - Execute `compile_applet` to confirm clean compilation and zero TypeScript errors.
