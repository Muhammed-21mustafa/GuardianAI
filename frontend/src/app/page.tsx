"use client";

import React, { useState, useRef } from "react";
import { Upload, ShieldAlert, ShieldCheck, Activity, Terminal, AlertTriangle, CheckCircle, PackageSearch, ArrowRight } from "lucide-react";
import { analyzeReturn } from "@/lib/api";
import { AnalysisResponse } from "@/types";

// Note: In a real project, we would import these from @/components/ui/
// For this robust prototype without waiting for complete Shadcn registry sync, 
// we use highly polished Tailwind classes mimicking Shadcn to ensure 100% reliability.

export default function Dashboard() {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [returnedImage, setReturnedImage] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [returnedPreview, setReturnedPreview] = useState<string | null>(null);
  
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
      // Reset previous results when new images are uploaded
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!originalImage || !returnedImage) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeReturn(originalImage, returnedImage);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze the images.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 25) return "text-emerald-400";
    if (score <= 60) return "text-yellow-400";
    return "text-red-500";
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case "low": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "medium": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "high": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "critical": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-blue-500/30">
      
      {/* 1. Hero Section */}
      <header className="border-b border-zinc-800/60 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <ShieldAlert className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent tracking-tight">
                GuardianAI
              </h1>
              <p className="text-xs text-blue-400 font-mono tracking-widest uppercase mt-0.5">Autonomous Security Shield</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Multimodal AI Copilot for <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">E-Commerce Verification</span>
          </h2>
          <p className="text-lg text-zinc-400 leading-relaxed">
            Upload original shipment and returned product images. GuardianAI analyzes mismatches, calculates fraud risk, and recommends the exact next action.
          </p>
        </div>

        {/* 2. Upload Area */}
        <section className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Original Image */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <PackageSearch className="w-4 h-4 text-blue-400" />
                Original Shipment Image
              </label>
              <div className="relative group border-2 border-dashed border-zinc-700 hover:border-blue-500/50 rounded-xl bg-zinc-950/50 transition-all duration-300 overflow-hidden h-64 flex flex-col items-center justify-center">
                {originalPreview ? (
                  <img src={originalPreview} alt="Original" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="text-center p-6">
                    <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-3 group-hover:text-blue-400 transition-colors" />
                    <p className="text-sm text-zinc-400">Click to upload original record</p>
                  </div>
                )}
                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, "original")} />
              </div>
            </div>

            {/* Returned Image */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-red-400" />
                Returned Product Image
              </label>
              <div className="relative group border-2 border-dashed border-zinc-700 hover:border-red-500/50 rounded-xl bg-zinc-950/50 transition-all duration-300 overflow-hidden h-64 flex flex-col items-center justify-center">
                {returnedPreview ? (
                  <img src={returnedPreview} alt="Returned" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="text-center p-6">
                    <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-3 group-hover:text-red-400 transition-colors" />
                    <p className="text-sm text-zinc-400">Click to upload returned item</p>
                  </div>
                )}
                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, "returned")} />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button 
              onClick={handleAnalyze} 
              disabled={!originalImage || !returnedImage || loading}
              className={`px-8 py-3 rounded-lg font-medium text-white flex items-center gap-2 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] 
                ${(!originalImage || !returnedImage || loading) ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-500 hover:scale-105 active:scale-95'}`}
            >
              {loading ? (
                <><Activity className="w-5 h-5 animate-spin" /> Analyzing Multimodal Data...</>
              ) : (
                <><Activity className="w-5 h-5" /> Analyze Return</>
              )}
            </button>
          </div>
          
          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </section>

        {/* 3. Result Dashboard */}
        {result && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Risk Score Card */}
              <div className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Activity className="w-24 h-24" />
                </div>
                <div>
                  <p className="text-zinc-400 font-medium text-sm">Fraud Risk Score</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className={`text-6xl font-black tracking-tighter ${getRiskColor(result.risk_score)}`}>
                      {result.risk_score}
                    </span>
                    <span className="text-xl text-zinc-500">/ 100</span>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${getRiskBadgeColor(result.risk_level)}`}>
                    {result.risk_level} Risk
                  </span>
                  <span className="text-xs text-zinc-500">{result.confidence * 100}% AI Confidence</span>
                </div>
              </div>

              {/* Action Card */}
              <div className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-2xl md:col-span-2 flex flex-col justify-between">
                <div>
                  <p className="text-zinc-400 font-medium text-sm mb-4">Recommended Action</p>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl border ${result.risk_level === 'critical' || result.risk_level === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                      {result.risk_level === 'critical' || result.risk_level === 'high' ? <ShieldAlert className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{result.recommended_action}</h3>
                      <p className="text-zinc-400 mt-1">{result.summary}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800">
                  <div className="flex items-center gap-2">
                    {result.manual_review_required ? (
                      <><AlertTriangle className="w-4 h-4 text-yellow-500" /> <span className="text-sm text-yellow-500">Human Verification Required</span></>
                    ) : (
                      <><CheckCircle className="w-4 h-4 text-emerald-500" /> <span className="text-sm text-emerald-500">Auto-Approve Eligible</span></>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Thought Trace Panel (Terminal Style) */}
            <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-zinc-900/80 border-b border-zinc-800/60 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm font-semibold text-zinc-300">AI Decision Trace</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                  <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                  <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                </div>
              </div>
              <div className="p-6 font-mono text-sm leading-relaxed">
                <div className="text-blue-400 mb-2">&gt; Extracting multimodal features from visual evidence...</div>
                <div className="text-blue-400 mb-2">&gt; Analyzing cross-reference data points...</div>
                <div className="text-zinc-300 mt-4 border-l-2 border-blue-500/50 pl-4 py-1 bg-blue-500/5">
                  {result.thought_trace}
                </div>
              </div>
            </div>

            {/* 4. Mismatch Table */}
            {result.mismatches.length > 0 && (
              <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-800/60 bg-zinc-900/50">
                  <h3 className="font-semibold text-white">Detected Discrepancies ({result.mismatches.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/30 border-b border-zinc-800">
                      <tr>
                        <th className="px-6 py-4 font-medium">Field</th>
                        <th className="px-6 py-4 font-medium">Original Value</th>
                        <th className="px-6 py-4 font-medium">Returned Value</th>
                        <th className="px-6 py-4 font-medium">Severity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {result.mismatches.map((mismatch, i) => (
                        <tr key={i} className="hover:bg-zinc-800/20 transition-colors">
                          <td className="px-6 py-4 font-medium text-zinc-300 capitalize">{mismatch.field.replace('_', ' ')}</td>
                          <td className="px-6 py-4 text-zinc-400">{mismatch.original_value}</td>
                          <td className="px-6 py-4 text-zinc-300">{mismatch.returned_value}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getRiskBadgeColor(mismatch.severity)}`}>
                              {mismatch.severity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
          </div>
        )}
      </main>
    </div>
  );
}
