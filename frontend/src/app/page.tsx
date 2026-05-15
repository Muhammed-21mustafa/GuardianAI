"use client";

import React, { useState, useEffect } from "react";
import { Upload, ShieldAlert, Activity, Terminal, AlertTriangle, CheckCircle, ArrowRight, Download, FileText, Check, Shield, Clock, Search, XCircle, ChevronRight, ChevronLeft, Box, Tag, Store } from "lucide-react";
import { analyzeReturn } from "@/lib/api";
import { AnalysisResponse } from "@/types";

export default function Dashboard() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Case Context State
  const [customerReason, setCustomerReason] = useState<string>("");
  const [shortDescription, setShortDescription] = useState<string>("");
  const [marketplace, setMarketplace] = useState<string>("");
  const [productCategory, setProductCategory] = useState<string>("");
  const [productValue, setProductValue] = useState<string>("");

  // Step 2: Evidence State
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [returnedImage, setReturnedImage] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [returnedPreview, setReturnedPreview] = useState<string | null>(null);
  
  // Step 3: Analysis State
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingMessages = [
    "Doğrulama vakası başlatılıyor...",
    "Görsel ajanlar (Vision Agent) çalıştırılıyor...",
    "Deliller çapraz sorgulanıyor (Verification)...",
    "Operasyonel risk hesaplanıyor (Decision)...",
    "İtiraz ve delil paketi oluşturuluyor (Resolution)..."
  ];
  
  // Step 4: Result State
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentStep === 3) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [currentStep]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "original" | "returned") => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "original") {
        setOriginalImage(file);
        setOriginalPreview(URL.createObjectURL(file));
      } else {
        setReturnedImage(file);
        setReturnedPreview(URL.createObjectURL(file));
      }
    }
  };

  const goToEvidence = () => {
    setCurrentStep(2);
  };

  const handleAnalyze = async () => {
    if (!originalImage || !returnedImage) return;
    setCurrentStep(3);
    setLoadingStep(0);
    setError(null);
    try {
      // Combine fields for the backend order_description
      const combinedOrderDesc = `Pazaryeri: ${marketplace}. Kategori: ${productCategory}. Ürün: ${shortDescription}`;
      
      const data = await analyzeReturn(originalImage, returnedImage, combinedOrderDesc, customerReason, productValue);
      setResult(data);
      setCurrentStep(4);
    } catch (err: any) {
      setError(err.message || "Görseller analiz edilirken bir hata oluştu.");
      setCurrentStep(2); // Go back to evidence on error
    }
  };

  const resetFlow = () => {
    window.location.reload();
  };

  const downloadReport = () => {
    if (!result) return;
    const content = `# Vaka Raporu: ${result.case_id}\nDurum: ${result.case_status}\nRisk Skoru: ${result.risk_score}/100 (${result.risk_level})\nFinansal Etki: ${result.estimated_financial_impact}\n\n## Delil Özeti\n${result.evidence_summary}\n\n## Uyuşmazlıklar\n${result.mismatches.map(m => `- ${m.field}: Beklenen ${m.original_value}, Gerçekte Olan ${m.returned_value} (${m.severity})`).join('\n')}\n\n## İtiraz Raporu Özeti\n${result.dispute_report_summary}\n\nGuardianAI tarafından otonom olarak oluşturulmuştur.`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.case_id}_Rapor.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "KRİTİK": return "text-red-500 bg-red-500/10 border-red-500/20";
      case "YÜKSEK": return "text-orange-400 bg-orange-500/10 border-orange-500/20";
      case "ORTA": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      default: return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    }
  };

  const renderTrace = (trace: string) => {
    const blocks = trace.split("\n\n");
    return blocks.map((block, idx) => {
      const [header, ...content] = block.split(":\n");
      if (!content.length) return <div key={idx} className="text-zinc-400 my-1">{block}</div>;
      return (
        <div key={idx} className="mb-4 last:mb-0">
          <div className="text-blue-400 text-xs font-bold mb-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            {header}
          </div>
          <div className="text-zinc-300 border-l border-zinc-700/50 pl-3 ml-0.5 py-0.5 font-mono text-[13px]">
            {content.join(":\n")}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-blue-500/30 pb-12">
      
      {/* HEADER */}
      <header className="border-b border-zinc-800/80 bg-[#09090b] sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-600 rounded-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-zinc-100 leading-tight">GuardianAI</h1>
              <p className="text-[10px] text-zinc-500 tracking-widest uppercase">Operasyon Platformu</p>
            </div>
          </div>
          <div className="text-sm text-zinc-400 flex items-center gap-2 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800">
            <Search className="w-4 h-4" /> Vaka Ara
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-8 space-y-6">

        {/* STEPPER NAVIGATION */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-zinc-800 z-0"></div>
            
            {[
              { num: 1, label: "VAKA BAŞLATMA" },
              { num: 2, label: "DELİL TOPLAMA" },
              { num: 3, label: "YAPAY ZEKA ANALİZİ" },
              { num: 4, label: "VAKA ÇÖZÜMÜ" }
            ].map((step) => (
              <div key={step.num} className="relative z-10 flex flex-col items-center gap-2 bg-zinc-950 px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  currentStep === step.num ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] ring-4 ring-zinc-950' : 
                  currentStep > step.num ? 'bg-emerald-500 text-white ring-4 ring-zinc-950' : 
                  'bg-zinc-800 text-zinc-500 ring-4 ring-zinc-950'
                }`}>
                  {currentStep > step.num ? <Check className="w-4 h-4" /> : step.num}
                </div>
                <span className={`text-[10px] font-bold tracking-wider ${currentStep >= step.num ? 'text-zinc-200' : 'text-zinc-600'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: CASE INITIATION */}
        {currentStep === 1 && (
          <section className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-8 shadow-2xl max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4">
            <div className="mb-8 border-b border-zinc-800 pb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">1. Adım: Vaka Başlatma</h2>
              <p className="text-zinc-400 mt-2 text-sm">Doğrulama sürecini başlatmak için iade edilen ürünün bağlam bilgilerini girin.</p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5"><Store className="w-3.5 h-3.5"/> Satış Platformu (Pazaryeri)</label>
                  <select 
                    value={marketplace}
                    onChange={(e) => setMarketplace(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                  >
                    <option value="">-- Seçiniz --</option>
                    <option value="Amazon">Amazon</option>
                    <option value="Trendyol">Trendyol</option>
                    <option value="Hepsiburada">Hepsiburada</option>
                    <option value="Shopify (Kendi Sitemiz)">Shopify (Kendi Sitemiz)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5"><Box className="w-3.5 h-3.5"/> Ürün Kategorisi</label>
                  <select 
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                  >
                    <option value="">-- Seçiniz --</option>
                    <option value="Elektronik">Elektronik</option>
                    <option value="Moda & Giyim">Moda & Giyim</option>
                    <option value="Ev & Yaşam">Ev & Yaşam</option>
                    <option value="Kozmetik">Kozmetik</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">Sipariş Kısa Açıklaması</label>
                <input 
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Örnek: iPhone 15 Pro Max 256GB Naturel Titanyum"
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-zinc-700"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5"/> Müşteri İade Sebebi (Claim)</label>
                  <select 
                    value={customerReason}
                    onChange={(e) => setCustomerReason(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                  >
                    <option value="">-- Sebep Seçin --</option>
                    <option value="Ürün hasarlı geldi">Ürün hasarlı geldi</option>
                    <option value="Yanlış ürün gönderildi">Yanlış ürün gönderildi</option>
                    <option value="Aksesuar/Parça eksik">Aksesuar/Parça eksik</option>
                    <option value="Beden uymadı / Rahatsız">Beden uymadı / Rahatsız</option>
                    <option value="Fikrimi değiştirdim / Beklentimi karşılamadı">Fikrimi değiştirdim / Beklentimi karşılamadı</option>
                    <option value="Ürün kusurlu / Çalışmıyor">Ürün kusurlu / Çalışmıyor</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5"/> Ürün Değeri (Finansal Risk)</label>
                  <input 
                    type="text"
                    value={productValue}
                    onChange={(e) => setProductValue(e.target.value)}
                    placeholder="Örnek: 45000 TL"
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-zinc-700"
                  />
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-end">
              <button onClick={goToEvidence} 
                className="px-8 py-3 rounded-lg font-bold text-sm flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:scale-105">
                Görsel Kanıt Yüklemeye Geç <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* STEP 2: EVIDENCE COLLECTION */}
        {currentStep === 2 && (
          <section className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-8 shadow-2xl max-w-4xl mx-auto animate-in fade-in slide-in-from-right-8">
            <div className="mb-8 border-b border-zinc-800 pb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">2. Adım: Delil Toplama (Evidence Collection)</h2>
              <p className="text-zinc-400 mt-2 text-sm">GuardianAI, müşteri beyanlarını objektif görsel kanıtlarla doğrular. Lütfen karşılaştırma materyallerini yükleyin.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400"/> Orijinal Sipariş Görseli</label>
                <div className="relative h-64 border-2 border-dashed border-zinc-700 hover:border-blue-500/50 rounded-xl bg-zinc-900/50 transition-colors flex items-center justify-center overflow-hidden group">
                  {originalPreview ? (
                    <img src={originalPreview} alt="Original" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center"><Upload className="w-8 h-8 text-zinc-600 mx-auto mb-3 group-hover:text-blue-400 transition-colors" /><span className="text-sm font-medium text-zinc-500">Tıkla veya Sürükle</span></div>
                  )}
                  <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, "original")} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-400"/> İade Edilen Ürün Görseli</label>
                <div className="relative h-64 border-2 border-dashed border-zinc-700 hover:border-red-500/50 rounded-xl bg-zinc-900/50 transition-colors flex items-center justify-center overflow-hidden group">
                  {returnedPreview ? (
                    <img src={returnedPreview} alt="Returned" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center"><Upload className="w-8 h-8 text-zinc-600 mx-auto mb-3 group-hover:text-red-400 transition-colors" /><span className="text-sm font-medium text-zinc-500">Tıkla veya Sürükle</span></div>
                  )}
                  <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, "returned")} />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center border-t border-zinc-800 pt-6">
              <button onClick={() => setCurrentStep(1)} className="px-6 py-2.5 rounded-lg font-medium text-sm text-zinc-400 hover:text-white flex items-center gap-2 transition-colors border border-zinc-800 hover:bg-zinc-800">
                <ChevronLeft className="w-4 h-4" /> Geri Dön
              </button>
              <button onClick={handleAnalyze} disabled={!originalImage || !returnedImage}
                className={`px-8 py-3 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${(!originalImage || !returnedImage) ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105'}`}>
                <Activity className="w-4 h-4" /> Yapay Zeka Analizini Başlat
              </button>
            </div>
            {error && <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2"><AlertTriangle className="w-5 h-5" />{error}</div>}
          </section>
        )}

        {/* STEP 3: AI ANALYSIS LOADING */}
        {currentStep === 3 && (
          <section className="bg-transparent max-w-2xl mx-auto mt-20 text-center animate-in zoom-in duration-500">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              <Shield className="w-12 h-12 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-6 tracking-tight">Otonom İnceleme Devam Ediyor</h2>
            
            <div className="space-y-4 max-w-md mx-auto text-left bg-zinc-900/50 p-6 rounded-xl border border-zinc-800/50 shadow-2xl">
              {loadingMessages.map((msg, idx) => (
                <div key={idx} className={`flex items-center gap-3 transition-all duration-500 ${idx <= loadingStep ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                  {idx < loadingStep ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : idx === loadingStep ? (
                    <Activity className="w-5 h-5 text-blue-500 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-zinc-700" />
                  )}
                  <span className={`text-sm font-medium ${idx < loadingStep ? 'text-zinc-400' : idx === loadingStep ? 'text-white' : 'text-zinc-600'}`}>{msg}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* STEP 4: CASE RESOLUTION (Result) */}
        {currentStep === 4 && result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* TOP CASE HEADER */}
            <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Vaka Numarası</p>
                  <h2 className="text-2xl font-mono font-bold text-white">{result.case_id}</h2>
                </div>
                <div className="h-10 w-px bg-zinc-800"></div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Durum</p>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span></span>
                    <span className="text-sm font-semibold text-zinc-200">{result.case_status.replace(/_/g, ' ')}</span>
                  </div>
                </div>
                <div className="h-10 w-px bg-zinc-800"></div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Öncelik</p>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getPriorityColor(result.case_priority)}`}>{result.case_priority}</span>
                </div>
                <div className="h-10 w-px bg-zinc-800"></div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Tahmini Zarar</p>
                  <p className="text-sm font-bold text-zinc-300">{result.estimated_financial_impact}</p>
                </div>
              </div>
              <div>
                <button onClick={resetFlow} className="text-xs text-zinc-400 hover:text-white px-4 py-2 border border-zinc-800 rounded hover:bg-zinc-800 transition-colors font-medium">
                  Yeni Vaka Başlat
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: Evidence & Operations */}
              <div className="xl:col-span-7 space-y-6">
                
                {/* Evidence Package */}
                <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-full shadow-lg">
                  <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-900/40 flex justify-between items-center">
                    <h3 className="font-semibold text-white flex items-center gap-2"><FileText className="w-4 h-4 text-blue-400"/> Delil Dosyası</h3>
                    <button onClick={downloadReport} className="text-xs font-bold flex items-center gap-1.5 text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-md transition-colors">
                      <Download className="w-3.5 h-3.5" /> Raporu İndir
                    </button>
                  </div>
                  <div className="p-5 space-y-6 flex-1">
                    <div>
                      <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Delil Özeti</p>
                      <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/50 p-3.5 rounded-lg border border-zinc-800/50">{result.evidence_summary}</p>
                    </div>
                    
                    {result.mismatches.length > 0 && (
                      <div>
                        <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Tespit Edilen Anomaliler</p>
                        <div className="rounded-lg border border-zinc-800 overflow-hidden">
                          <table className="w-full text-sm text-left">
                            <thead className="text-[10px] text-zinc-500 uppercase bg-zinc-900/80">
                              <tr>
                                <th className="px-4 py-2 font-medium">Alan</th>
                                <th className="px-4 py-2 font-medium">Beklenen</th>
                                <th className="px-4 py-2 font-medium">Gerçekte Olan</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                              {result.mismatches.map((m, i) => (
                                <tr key={i} className="bg-zinc-950/30">
                                  <td className="px-4 py-3 font-medium text-zinc-300 capitalize flex items-center gap-2">
                                    {m.severity === 'critical' && <XCircle className="w-3.5 h-3.5 text-red-500"/>}
                                    {m.field.replace('_', ' ')}
                                  </td>
                                  <td className="px-4 py-3 text-zinc-500 truncate max-w-[150px]" title={m.original_value}>{m.original_value}</td>
                                  <td className="px-4 py-3 text-red-400 font-medium truncate max-w-[150px]" title={m.returned_value}>{m.returned_value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Resmi İtiraz / Hakem Heyeti Dilekçesi</p>
                      <div className="text-sm text-zinc-400 border-l-2 border-zinc-700 pl-3.5 py-1 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 whitespace-pre-wrap">
                        {result.dispute_report_summary}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Center */}
                <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5 shadow-lg">
                  <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mb-4">Aksiyon Merkezi - Önerilen Adım: <span className="text-white">{result.recommended_next_step}</span></p>
                  <div className="flex gap-3">
                    <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 shadow-lg">
                      <CheckCircle className="w-4 h-4" /> İadeyi Onayla
                    </button>
                    <button className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 border border-zinc-700">
                      <ShieldAlert className="w-4 h-4 text-orange-400" /> İncelemeye Al
                    </button>
                    <button className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-500 text-sm font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 border border-red-500/30">
                      <XCircle className="w-4 h-4" /> İadeyi Bloke Et
                    </button>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: AI Brain & Logs */}
              <div className="xl:col-span-5 space-y-6">
                
                {/* Risk Score Widget */}
                <div className="bg-gradient-to-br from-[#0c0c0e] to-[#121216] border border-zinc-800 rounded-xl p-6 relative overflow-hidden flex items-center justify-between shadow-lg">
                  <div className="z-10">
                    <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Hesaplanan Risk Skoru</p>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-6xl font-black tracking-tighter ${result.risk_score > 60 ? 'text-red-500' : result.risk_score > 25 ? 'text-yellow-400' : 'text-emerald-400'}`}>{result.risk_score}</span>
                      <span className="text-zinc-600 text-xl font-bold">/100</span>
                    </div>
                  </div>
                  <div className="z-10 text-right">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border ${getPriorityColor(result.risk_priority || result.case_priority)}`}>
                       {result.risk_level} Risk
                    </div>
                    <p className="text-xs font-medium text-zinc-500 mt-2">% {Math.round(result.confidence * 100)} Yapay Zeka Güveni</p>
                  </div>
                  <ShieldAlert className="absolute -right-4 -bottom-4 w-32 h-32 text-zinc-800/20 rotate-12" />
                </div>

                {/* Automated Action Log */}
                <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5 shadow-lg">
                  <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mb-4 flex items-center gap-2"><Clock className="w-3.5 h-3.5"/> Otomatik İşlem Geçmişi</p>
                  <div className="space-y-3.5">
                    {result.automated_action_log.map((log, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-0.5"><Check className="w-4 h-4 text-blue-500" /></div>
                        <p className="text-sm text-zinc-300 font-medium">{log}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Decision Trace (Terminal) */}
                <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                  <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-zinc-400" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Çoklu-Ajan Karar Analizi (Trace)</span>
                  </div>
                  <div className="p-5 h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                    {renderTrace(result.thought_trace)}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
