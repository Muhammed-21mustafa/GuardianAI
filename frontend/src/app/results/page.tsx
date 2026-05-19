"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  FolderOpen,
  Gauge,
  LayoutDashboard,
  Loader2,
  MessageSquareText,
  PackageCheck,
  Search,
  ShieldAlert,
  ShieldCheck,
  TerminalSquare,
  XCircle,
} from "lucide-react";
import { updateCaseStatus } from "@/lib/api";
import { cleanText, priorityLabel, riskLabel, severityLabel, statusLabel } from "@/lib/format";
import type { AnalysisResponse, Mismatch } from "@/types";

interface StoredState {
  result: AnalysisResponse | null;
  originalPreview: string;
  returnedPreview: string;
  referenceSource: string;
}

function loadStoredState(): StoredState {
  if (typeof window === "undefined") {
    return { result: null, originalPreview: "", returnedPreview: "", referenceSource: "Referans görsel" };
  }

  try {
    const storedResult = localStorage.getItem("guardian_analysis_result");
    return {
      result: storedResult ? (JSON.parse(storedResult) as AnalysisResponse) : null,
      originalPreview: localStorage.getItem("guardian_original_preview") || "",
      returnedPreview: localStorage.getItem("guardian_returned_preview") || "",
      referenceSource: localStorage.getItem("guardian_reference_source") || "Referans görsel",
    };
  } catch {
    return { result: null, originalPreview: "", returnedPreview: "", referenceSource: "Referans görsel" };
  }
}

function riskBadge(score: number) {
  if (score >= 86) return "border-red-200 bg-red-50 text-red-700";
  if (score >= 61) return "border-orange-200 bg-orange-50 text-orange-700";
  if (score >= 26) return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function riskBar(score: number) {
  if (score >= 86) return "bg-red-600";
  if (score >= 61) return "bg-orange-500";
  if (score >= 26) return "bg-amber-500";
  return "bg-emerald-600";
}

function NavButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function EvidenceImage({ title, preview, emptyLabel }: { title: string; preview: string; emptyLabel: string }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase text-slate-500">{title}</p>
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        {preview ? (
          <img src={preview} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="px-4 text-center text-sm text-slate-400">{emptyLabel}</div>
        )}
      </div>
    </div>
  );
}

function TraceBlock({ trace }: { trace: string }) {
  if (!trace) {
    return <p className="text-sm text-slate-500">Ajan izi bu sonuçta yer almıyor.</p>;
  }

  return (
    <div className="space-y-3">
      {trace.split("\n\n").map((block, index) => {
        const lines = block.split("\n");
        const title = cleanText(lines[0] || `Adım ${index + 1}`);
        const body = cleanText(lines.slice(1).join("\n"));
        return (
          <div key={`${title}-${index}`} className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-blue-700">{title.replace(":", "")}</p>
            <p className="mt-2 whitespace-pre-wrap font-mono text-xs leading-5 text-slate-600">{body || cleanText(block)}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const [initialState] = useState<StoredState>(() => loadStoredState());
  const [result, setResult] = useState<AnalysisResponse | null>(initialState.result);
  const [originalPreview] = useState(initialState.originalPreview);
  const [returnedPreview] = useState(initialState.returnedPreview);
  const [referenceSource] = useState(initialState.referenceSource);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
          <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-slate-400" />
          <h1 className="text-xl font-semibold text-slate-950">Aktif sonuç dosyası yok</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Önce yeni bir doğrulama başlatın veya demo taramayı çalıştırın.</p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Panele dön
          </button>
        </div>
      </div>
    );
  }

  const confidencePercent = Math.round(result.confidence * 100);
  const mismatches = result.mismatches || [];
  const isEscalated = result.case_status === "ESCALATED" || result.case_status.includes("ESKALE");

  const handleAction = async (newStatus: string, message: string) => {
    setIsSubmitting(true);
    try {
      if (result.case_id !== "GA-E4F71D") {
        await updateCaseStatus(result.case_id, newStatus);
      }
      const updated = { ...result, case_status: newStatus };
      setResult(updated);
      localStorage.setItem("guardian_analysis_result", JSON.stringify(updated));
      setToast(message);
      window.setTimeout(() => setToast(""), 3500);
    } catch {
      setToast("Durum güncellenemedi. Backend bağlantısını kontrol edin.");
      window.setTimeout(() => setToast(""), 3500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadReport = () => {
    const mismatchText = mismatches
      .map((item: Mismatch) => `- ${cleanText(item.field)}: ${cleanText(item.original_value)} -> ${cleanText(item.returned_value)} (${severityLabel(item.severity)})`)
      .join("\n");
    const content = `# GuardianAI Vaka Raporu: ${result.case_id}

Durum: ${statusLabel(result.case_status)}
Risk Skoru: ${result.risk_score}/100 (${riskLabel(result.risk_level)})
Finansal Etki: ${cleanText(result.estimated_financial_impact)}

## Delil Özeti
${cleanText(result.evidence_summary)}

## Uyuşmazlıklar
${mismatchText || "- Uyuşmazlık tespit edilmedi."}

## Pazaryeri Taslağı
${cleanText(result.marketplace_appeal_draft || result.dispute_report_summary)}

GuardianAI tarafından insan incelemesine yardımcı olmak amacıyla oluşturulmuştur.`;

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${result.case_id}_GuardianAI_Rapor.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-68 shrink-0 flex-col bg-slate-950 p-4 text-white lg:flex">
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-500 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold leading-none">GuardianAI</p>
              <p className="mt-1 text-xs text-slate-400">Evidence workspace</p>
            </div>
          </div>
          <nav className="space-y-1">
            <NavButton icon={LayoutDashboard} label="Operasyon paneli" onClick={() => router.push("/")} />
            <NavButton icon={FolderOpen} label="Vakalar" onClick={() => router.push("/?action=cases")} />
            <NavButton icon={Activity} label="Yeni demo tarama" onClick={() => router.push("/")} />
          </nav>
          <div className="mt-auto rounded-lg border border-blue-400/20 bg-blue-400/10 p-4 text-sm text-blue-50">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <PackageCheck className="h-4 w-4" />
              Karar ilkesi
            </div>
            <p className="text-xs leading-5 text-blue-100/80">
              Son karar insan operatörde kalır; bu ekran kanıtı ve öneriyi düzenler.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Panele dön
              </button>
              <div className="hidden items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:flex">
                <Search className="h-4 w-4" />
                <span>{result.case_id}</span>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {toast && (
              <div className="fixed bottom-5 right-5 z-50 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-lg">
                {toast}
              </div>
            )}

            <div className="mx-auto max-w-7xl min-w-0 space-y-6">
              <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {result.case_id}
                      </span>
                      <span className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${riskBadge(result.risk_score)}`}>
                        {riskLabel(result.risk_level)}
                      </span>
                      <span className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        {priorityLabel(result.case_priority)}
                      </span>
                    </div>
                    <h1 className="max-w-4xl text-3xl font-semibold text-slate-950">Operasyonel delil dosyası hazır</h1>
                    <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">{cleanText(result.summary || result.evidence_summary)}</p>
                  </div>
                  <div className="grid min-w-[260px] gap-2 text-sm">
                    <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                      <span className="text-slate-500">Durum</span>
                      <span className="font-semibold text-slate-900">{statusLabel(result.case_status)}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                      <span className="text-slate-500">Finansal etki</span>
                      <span className="font-semibold text-slate-900">{cleanText(result.estimated_financial_impact)}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:col-span-2">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase text-slate-500">Verification risk index</p>
                    <Gauge className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-semibold text-slate-950">{result.risk_score}</span>
                    <span className="pb-2 text-lg font-semibold text-slate-400">/100</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-slate-100">
                    <div className={`h-2 rounded-full ${riskBar(result.risk_score)}`} style={{ width: `${result.risk_score}%` }} />
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="mb-4 text-xs font-semibold uppercase text-slate-500">Model güveni</p>
                  <p className="text-3xl font-semibold text-slate-950">%{confidencePercent}</p>
                  <p className="mt-2 text-xs text-slate-500">Görsel ve semantik karşılaştırma ortalaması</p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="mb-4 text-xs font-semibold uppercase text-slate-500">İnsan incelemesi</p>
                  {result.manual_review_required ? (
                    <p className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
                      <AlertTriangle className="h-4 w-4" />
                      Gerekli
                    </p>
                  ) : (
                    <p className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Gerekli değil
                    </p>
                  )}
                </div>
              </section>

              <section className="grid min-w-0 gap-6 xl:grid-cols-[1.35fr_0.9fr]">
                <div className="min-w-0 space-y-6">
                  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <h2 className="font-semibold text-slate-950">Görsel kanıt karşılaştırması</h2>
                        <p className="mt-1 text-xs text-slate-500">Referans kaynağı: {cleanText(referenceSource)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={downloadReport}
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Download className="h-4 w-4" />
                        MD rapor indir
                      </button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <EvidenceImage title="Beklenen ürün" preview={originalPreview} emptyLabel="Referans görsel demo akışında saklanmadı" />
                      <EvidenceImage title="Depoya dönen ürün" preview={returnedPreview} emptyLabel="İade görseli demo akışında saklanmadı" />
                    </div>
                    <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="mb-2 text-xs font-semibold uppercase text-slate-500">AI delil özeti</p>
                      <p className="text-sm leading-6 text-slate-700">{cleanText(result.evidence_summary)}</p>
                    </div>
                  </div>

                  <div className="min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                      <h2 className="font-semibold text-slate-950">Saptanan anomaliler</h2>
                    </div>
                    {mismatches.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[680px] text-left text-sm">
                          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                              <th className="px-5 py-3 font-semibold">Kriter</th>
                              <th className="px-5 py-3 font-semibold">Beklenen</th>
                              <th className="px-5 py-3 font-semibold">Tespit edilen</th>
                              <th className="px-5 py-3 font-semibold">Seviye</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {mismatches.map((item) => (
                              <tr key={`${item.field}-${item.returned_value}`}>
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                                    {item.severity === "critical" ? <XCircle className="h-4 w-4 text-red-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
                                    {cleanText(item.field).replaceAll("_", " ")}
                                  </div>
                                  <p className="mt-1 text-xs leading-5 text-slate-500">{cleanText(item.description)}</p>
                                </td>
                                <td className="px-5 py-4 text-slate-600">{cleanText(item.original_value)}</td>
                                <td className="px-5 py-4 font-semibold text-slate-900">{cleanText(item.returned_value)}</td>
                                <td className="px-5 py-4">
                                  <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${item.severity === "critical" ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                                    {severityLabel(item.severity)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-5 text-sm text-slate-500">Uyuşmazlık tespit edilmedi.</div>
                    )}
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="font-semibold text-slate-950">Operasyonel aksiyon merkezi</h2>
                    <p className="mt-1 text-sm text-slate-600">{cleanText(result.recommended_next_step || result.recommended_action)}</p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => handleAction("APPROVED", "İade onaylandı olarak işaretlendi.")}
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        İadeyi onayla
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction("MANUAL_REVIEW", "Vaka manuel inceleme kuyruğuna aktarıldı.")}
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-60"
                      >
                        <ShieldAlert className="h-4 w-4" />
                        Manuel incelemeye gönder
                      </button>
                      <button
                        type="button"
                        onClick={downloadReport}
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        <Download className="h-4 w-4" />
                        Kanıt özetini indir
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction("ESCALATED", "Pazaryerine değerlendirme talebi hazırlandı.")}
                        disabled={isSubmitting || isEscalated}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:bg-slate-300"
                      >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquareText className="h-4 w-4" />}
                        Pazaryeri talebi hazırla
                      </button>
                    </div>
                  </div>
                </div>

                <div className="min-w-0 space-y-6">
                  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-950">
                      <FileText className="h-4 w-4 text-blue-700" />
                      Üretilen iletişim taslakları
                    </h2>
                    <div className="space-y-4">
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <p className="mb-2 text-xs font-semibold uppercase text-blue-700">Pazaryeri değerlendirme talebi</p>
                        <p className="max-h-48 overflow-auto whitespace-pre-wrap text-sm leading-6 text-blue-950">
                          {cleanText(result.marketplace_appeal_draft || result.dispute_report_summary)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                        <p className="mb-2 text-xs font-semibold uppercase text-emerald-700">Müşteri bilgilendirme metni</p>
                        <p className="max-h-48 overflow-auto whitespace-pre-wrap text-sm leading-6 text-emerald-950">
                          {cleanText(result.customer_response_draft)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-950">
                      <Clock3 className="h-4 w-4 text-slate-500" />
                      Sistem olay günlüğü
                    </h2>
                    <div className="space-y-3">
                      {(result.automated_action_log || []).map((log, index) => (
                        <div key={`${log}-${index}`} className="flex gap-3">
                          <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-950 text-[10px] font-semibold text-white">
                            {index + 1}
                          </div>
                          <p className="text-sm leading-6 text-slate-600">{cleanText(log)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-950">
                      <TerminalSquare className="h-4 w-4 text-slate-500" />
                      Ajan karar izi
                    </h2>
                    <TraceBlock trace={result.thought_trace} />
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
