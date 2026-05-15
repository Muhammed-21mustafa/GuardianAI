"use client";

import React, { useState } from "react";
import { Upload, ShieldAlert, Activity, Terminal, AlertTriangle, CheckCircle, ArrowRight, Download, FileText, Check, Shield, Clock, Search, XCircle } from "lucide-react";
import { analyzeReturn } from "@/lib/api";
import { AnalysisResponse } from "@/types";

export default function Dashboard() {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [returnedImage, setReturnedImage] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [returnedPreview, setReturnedPreview] = useState<string | null>(null);
  
  // Case Context State
  const [orderDescription, setOrderDescription] = useState<string>("");
  const [customerReason, setCustomerReason] = useState<string>("");
  const [productValue, setProductValue] = useState<string>("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);

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
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!originalImage || !returnedImage) return;
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeReturn(originalImage, returnedImage, orderDescription, customerReason, productValue);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Görseller analiz edilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!result) return;
    const content = `# Vaka Raporu: ${result.case_id}
Durum: ${result.case_status}
Risk Skoru: ${result.risk_score}/100 (${result.risk_level})
Finansal Etki: ${result.estimated_financial_impact}

## Delil Özeti
${result.evidence_summary}

## Uyuşmazlıklar
${result.mismatches.map(m => `- ${m.field}: Beklenen ${m.original_value}, Gerçekte Olan ${m.returned_value} (${m.severity})`).join('\n')}

## İtiraz Raporu Özeti
${result.dispute_report_summary}

GuardianAI tarafından otonom olarak oluşturulmuştur.`;
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
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-blue-500/30">
      
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
            <Search className="w-4 h-4" /> Vaka Ara (Önizleme)
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-8 space-y-6">

        {/* UPLOAD SECTION */}
        {!result && (
          <section className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-8 shadow-xl max-w-4xl mx-auto mt-6">
            <div className="mb-8 border-b border-zinc-800 pb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">Yeni Doğrulama Vakası Oluştur</h2>
              <p className="text-zinc-400 mt-2 text-sm">Görsel kanıt ve vaka bağlamı sağlayarak yapay zeka operasyon akışını başlatın.</p>
            </div>
            
            {/* Visual Evidence Group */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">1. Görsel Kanıtlar <span className="text-red-400 text-[10px]">*Zorunlu</span></h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="relative h-48 border border-dashed border-zinc-700 hover:border-blue-500/50 rounded-lg bg-zinc-900/50 transition-colors flex items-center justify-center overflow-hidden group">
                    {originalPreview ? (
                      <img src={originalPreview} alt="Original" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center"><Upload className="w-6 h-6 text-zinc-600 mx-auto mb-2" /><span className="text-xs text-zinc-500">Orijinal Ürünü Yükle</span></div>
                    )}
                    <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, "original")} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative h-48 border border-dashed border-zinc-700 hover:border-red-500/50 rounded-lg bg-zinc-900/50 transition-colors flex items-center justify-center overflow-hidden group">
                    {returnedPreview ? (
                      <img src={returnedPreview} alt="Returned" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center"><Upload className="w-6 h-6 text-zinc-600 mx-auto mb-2" /><span className="text-xs text-zinc-500">İade Edilen Ürünü Yükle</span></div>
                    )}
                    <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, "returned")} />
                  </div>
                </div>
              </div>
            </div>

            {/* Case Context Group */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">2. Vaka Bağlamı <span className="text-zinc-500 text-[10px]">(İsteğe Bağlı)</span></h3>
              <div className="space-y-4">
                
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Sipariş Açıklaması</label>
                  <input 
                    type="text"
                    value={orderDescription}
                    onChange={(e) => setOrderDescription(e.target.value)}
                    placeholder="Örnek: iPhone 15 Pro Max, orijinal kutu, USB-C kablo, kullanım kılavuzu"
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-zinc-700"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Müşteri İade Sebebi</label>
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
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Ürün Değeri (Finansal Etki)</label>
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
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end items-center gap-4 border-t border-zinc-800 pt-6">
              <button onClick={() => window.location.reload()} className="text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors">
                İptal Et
              </button>
              <button onClick={handleAnalyze} disabled={!originalImage || !returnedImage || loading}
                className={`px-8 py-3 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${(!originalImage || !returnedImage || loading) ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]'}`}>
                {loading ? <><Activity className="w-4 h-4 animate-spin" /> Yapay Zeka Analiz Ediyor...</> : <><ShieldAlert className="w-4 h-4" /> Vaka Dosyasını Başlat</>}
              </button>
            </div>
            {error && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{error}</div>}
          </section>
        )}

        {/* RESULTS - CASE FILE */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* TOP CASE HEADER */}
            <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
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
                <button onClick={() => window.location.reload()} className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 border border-zinc-800 rounded hover:bg-zinc-800 transition-colors">
                  Vakayı Kapat
                </button>
              </div>
            </div>

            {/* LIFECYCLE BAR */}
            <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-4 overflow-x-auto">
              <div className="flex items-center justify-between min-w-[800px]">
                {['SİSTEME_YÜKLENDİ', 'YAPAY_ZEKA_ANALİZİ', 'UYUMSUZLUK_KONTROLÜ', 'RİSK_DEĞERLENDİRMESİ', result.case_status].map((step, idx, arr) => (
                  <React.Fragment key={idx}>
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${idx === arr.length - 1 ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'bg-zinc-800 text-zinc-400'}`}>
                        {idx + 1}
                      </div>
                      <span className={`text-[10px] font-bold tracking-wider ${idx === arr.length - 1 ? 'text-blue-400' : 'text-zinc-500'}`}>{step.replace(/_/g, ' ')}</span>
                    </div>
                    {idx < arr.length - 1 && <div className="h-px flex-1 bg-zinc-800 mx-4"></div>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: Evidence & Operations */}
              <div className="xl:col-span-7 space-y-6">
                
                {/* Evidence Package */}
                <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-full">
                  <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-900/40 flex justify-between items-center">
                    <h3 className="font-semibold text-white flex items-center gap-2"><FileText className="w-4 h-4 text-blue-400"/> Delil Dosyası</h3>
                    <button onClick={downloadReport} className="text-xs flex items-center gap-1.5 text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2.5 py-1 rounded-md transition-colors">
                      <Download className="w-3 h-3" /> Raporu İndir
                    </button>
                  </div>
                  <div className="p-5 space-y-6 flex-1">
                    <div>
                      <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Delil Özeti</p>
                      <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">{result.evidence_summary}</p>
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
                                    {m.severity === 'critical' && <XCircle className="w-3 h-3 text-red-500"/>}
                                    {m.field.replace('_', ' ')}
                                  </td>
                                  <td className="px-4 py-3 text-zinc-500 truncate max-w-[150px]" title={m.original_value}>{m.original_value}</td>
                                  <td className="px-4 py-3 text-red-400 truncate max-w-[150px]" title={m.returned_value}>{m.returned_value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mb-2">İtiraz Raporu Özeti</p>
                      <p className="text-sm text-zinc-400 italic border-l-2 border-zinc-700 pl-3">{result.dispute_report_summary}</p>
                    </div>
                  </div>
                </div>

                {/* Action Center */}
                <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5">
                  <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mb-4">Aksiyon Merkezi - Önerilen Adım: <span className="text-zinc-300">{result.recommended_next_step}</span></p>
                  <div className="flex gap-3">
                    <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> İadeyi Onayla
                    </button>
                    <button className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2 border border-zinc-700">
                      <ShieldAlert className="w-4 h-4 text-orange-400" /> İncelemeye Al
                    </button>
                    <button className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-500 text-sm font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2 border border-red-500/30">
                      <XCircle className="w-4 h-4" /> İadeyi Bloke Et
                    </button>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: AI Brain & Logs */}
              <div className="xl:col-span-5 space-y-6">
                
                {/* Risk Score Widget */}
                <div className="bg-gradient-to-br from-[#0c0c0e] to-[#121216] border border-zinc-800 rounded-xl p-6 relative overflow-hidden flex items-center justify-between">
                  <div className="z-10">
                    <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Hesaplanan Risk Skoru</p>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-5xl font-black ${result.risk_score > 60 ? 'text-red-500' : result.risk_score > 25 ? 'text-yellow-400' : 'text-emerald-400'}`}>{result.risk_score}</span>
                      <span className="text-zinc-600 text-lg">/100</span>
                    </div>
                  </div>
                  <div className="z-10 text-right">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${getPriorityColor(result.risk_priority || result.case_priority)}`}>
                       {result.risk_level} Risk
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">% {Math.round(result.confidence * 100)} Yapay Zeka Güveni</p>
                  </div>
                  <ShieldAlert className="absolute -right-4 -bottom-4 w-32 h-32 text-zinc-800/30 rotate-12" />
                </div>

                {/* Automated Action Log */}
                <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5">
                  <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mb-4 flex items-center gap-2"><Clock className="w-3 h-3"/> Otomatik İşlem Geçmişi</p>
                  <div className="space-y-3">
                    {result.automated_action_log.map((log, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-0.5"><Check className="w-3.5 h-3.5 text-blue-500" /></div>
                        <p className="text-sm text-zinc-300">{log}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Decision Trace (Terminal) */}
                <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                  <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Çoklu-Ajan Karar Analizi (Trace)</span>
                  </div>
                  <div className="p-4 h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
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
