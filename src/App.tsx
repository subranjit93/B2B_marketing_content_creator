/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AudioProduct } from './types';
import { DEFAULT_CATALOG } from './data/defaultCatalog';
import { Header } from './components/Header';
import { SpotlightHub } from './components/SpotlightHub';
import { PosterStudio } from './components/PosterStudio';
import { InventoryManager } from './components/InventoryManager';
import { WhatsAppBroadcastPreview } from './components/WhatsAppBroadcastPreview';
import { SIPitchAssistantModal } from './components/SIPitchAssistantModal';

const STORAGE_KEY = 'peavey_odisha_catalog_v3';
const LOGO_STORAGE_KEY = 'peavey_brand_logo_v3';
const COMPANY_NAME_KEY = 'peavey_company_name_v3';

export default function App() {
  // Load saved catalog or default
  const [catalog, setCatalog] = useState<AudioProduct[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read saved catalog from localStorage', e);
    }
    return DEFAULT_CATALOG;
  });

  // User Brand Logo
  const [brandLogo, setBrandLogo] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LOGO_STORAGE_KEY);
    } catch (e) {
      return null;
    }
  });

  // User Company Name (Editable, defaults to Sainath Electrocare)
  const [companyName, setCompanyName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(COMPANY_NAME_KEY);
      if (
        saved &&
        !saved.toLowerCase().includes('odisha pro') &&
        !saved.toLowerCase().includes('odisha proaudio')
      ) {
        return saved;
      }
      localStorage.setItem(COMPANY_NAME_KEY, 'Sainath Electrocare');
      return 'Sainath Electrocare';
    } catch (e) {
      return 'Sainath Electrocare';
    }
  });

  const [activeTab, setActiveTab] = useState<'spotlight' | 'studio' | 'inventory' | 'broadcast'>('spotlight');
  
  // Current day recommendation
  const currentDay = new Date().getDay();
  const initialProduct = catalog.find((p) => p.featuredDayOfWeek === currentDay) || catalog[0];
  const [selectedProduct, setSelectedProduct] = useState<AudioProduct>(initialProduct);

  // Pitch Assistant Modal state
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);
  const [pitchProduct, setPitchProduct] = useState<AudioProduct>(initialProduct);
  const [isPitchAutoMode, setIsPitchAutoMode] = useState(false);
  const [appliedPitch, setAppliedPitch] = useState<{ headline: string; message: string; offerText?: string } | null>(null);

  // Persist catalog changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog));
    } catch (e) {
      console.warn('Could not persist catalog to localStorage', e);
    }
  }, [catalog]);

  // Persist brand logo
  const handleUploadLogo = (logo: string | null) => {
    setBrandLogo(logo);
    try {
      if (logo) {
        localStorage.setItem(LOGO_STORAGE_KEY, logo);
      } else {
        localStorage.removeItem(LOGO_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Could not persist logo to localStorage', e);
    }
  };

  // Persist company name
  const handleUpdateCompanyName = (name: string) => {
    setCompanyName(name);
    try {
      localStorage.setItem(COMPANY_NAME_KEY, name);
    } catch (e) {
      console.warn('Could not persist company name to localStorage', e);
    }
  };

  // Update specific product image (Product Image Consistency Architecture)
  const handleUpdateProductImage = (productId: string, newImagePath: string) => {
    setCatalog((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, imagePath: newImagePath } : item))
    );
    if (selectedProduct.id === productId) {
      setSelectedProduct((prev) => ({ ...prev, imagePath: newImagePath }));
    }
  };

  // Reset product image to factory default
  const handleResetProductImage = (productId: string) => {
    const defaultProduct = DEFAULT_CATALOG.find((p) => p.id === productId);
    const factoryPath = defaultProduct?.factoryImagePath || defaultProduct?.imagePath;
    if (factoryPath) {
      handleUpdateProductImage(productId, factoryPath);
    }
  };

  const handleOpenStudio = (product: AudioProduct) => {
    setSelectedProduct(product);
    setActiveTab('studio');
  };

  const handleQuickGenerate = () => {
    const todayProd = catalog.find((p) => p.featuredDayOfWeek === currentDay) || catalog[0];
    setSelectedProduct(todayProd);
    setActiveTab('studio');
  };

  const handleOpenPitchModal = (product: AudioProduct, autoMode: boolean = false) => {
    setPitchProduct(product);
    setIsPitchAutoMode(autoMode);
    setIsPitchModalOpen(true);
  };

  const handleApplyPitch = (headline: string, message: string, offerText?: string) => {
    setAppliedPitch({ headline, message, offerText });
    setSelectedProduct(pitchProduct);
    setActiveTab('studio');
  };

  return (
    <div className="min-h-screen bg-[#080E1A] text-slate-100 flex flex-col font-sans selection:bg-yellow-400 selection:text-slate-950">
      {/* Top Bar with Custom Brand Logo & Company Name */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickGenerate={handleQuickGenerate}
        brandLogo={brandLogo}
        onUploadLogo={handleUploadLogo}
        companyName={companyName}
        onUpdateCompanyName={handleUpdateCompanyName}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 md:py-8">
        {activeTab === 'spotlight' && (
          <SpotlightHub
            catalog={catalog}
            selectedProduct={selectedProduct}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onOpenStudio={handleOpenStudio}
            onOpenPitchAssistant={handleOpenPitchModal}
            companyName={companyName}
          />
        )}

        {activeTab === 'studio' && (
          <PosterStudio
            catalog={catalog}
            selectedProduct={selectedProduct}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onOpenPitchModal={handleOpenPitchModal}
            brandLogo={brandLogo}
            onUploadLogo={handleUploadLogo}
            companyName={companyName}
            onUpdateProductImage={handleUpdateProductImage}
            onResetProductImage={handleResetProductImage}
            appliedPitch={appliedPitch}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryManager
            catalog={catalog}
            onUpdateCatalog={setCatalog}
            onOpenStudioWithProduct={handleOpenStudio}
            onUpdateProductImage={handleUpdateProductImage}
            onResetProductImage={handleResetProductImage}
          />
        )}

        {activeTab === 'broadcast' && (
          <WhatsAppBroadcastPreview
            catalog={catalog}
            selectedProduct={selectedProduct}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onOpenStudio={handleOpenStudio}
            companyName={companyName}
          />
        )}
      </main>

      {/* AI Pitch Assistant Modal */}
      <SIPitchAssistantModal
        product={pitchProduct}
        isOpen={isPitchModalOpen}
        onClose={() => setIsPitchModalOpen(false)}
        onApplyPitch={handleApplyPitch}
        autoModeInitial={isPitchAutoMode}
      />

      {/* Clean Distributor Footer */}
      <footer className="border-t border-blue-900/30 py-4 px-4 md:px-8 text-xs text-slate-400 text-center flex flex-wrap items-center justify-between gap-4 max-w-7xl mx-auto w-full">
        <div className="font-semibold text-white">
          {companyName} <span className="text-yellow-400">·</span> Authorized Peavey Audio Distribution
        </div>
        <div className="text-slate-500 font-mono text-[11px]">
          Odisha Central Depot · Bhubaneswar
        </div>
      </footer>
    </div>
  );
}
