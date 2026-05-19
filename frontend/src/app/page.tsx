"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Boxes,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileSearch,
  FolderOpen,
  Gauge,
  LayoutDashboard,
  Loader2,
  Menu,
  PackageCheck,
  PlusCircle,
  Search,
  ShieldCheck,
  Store,
  Upload,
} from "lucide-react";
import { analyzeReturn, fetchCases } from "@/lib/api";
import { cleanText, statusLabel } from "@/lib/format";
import type { AnalysisResponse, CaseRecord } from "@/types";

type ActiveView = "dashboard" | "cases" | "new_case";
type WizardStep = 1 | 2 | 3;

const loadingMessages = [
  "Vaka kaydı hazırlanıyor",
  "Vision Agent görselleri yapılandırılmış veriye çeviriyor",
  "Verification Agent beklenen ve dönen ürünü karşılaştırıyor",
  "Decision Agent risk ve finansal etkiyi hesaplıyor",
  "Resolution Agent kanıt özeti ve aksiyon taslaklarını oluşturuyor",
];

const demoResult: AnalysisResponse = {
  case_id: "GA-E4F71D",
  case_status: "IN_REVIEW",
  case_priority: "KRİTİK",
  risk_score: 100,
  risk_level: "critical",
  confidence: 0.98,
  manual_review_required: true,
  reason_codes: ["ITEM_SWAP", "CRITICAL_VERIFICATION_RISK"],
  estimated_financial_impact: "45.000 TL",
  evidence_summary:
    "İade paketi içeriği beklenen iPhone 15 Pro Max cihazı ile uyuşmuyor. Kutunun içinde farklı kategoride bir ürün tespit edildi.",
  mismatches: [
    {
      field: "product_type",
      original_value: "iPhone 15 Pro Max",
      returned_value: "Dove sabun",
      severity: "critical",
      description: "Ürün tipi tamamen farklı. Bu vaka ürün değiştirme riskine işaret ediyor.",
    },
  ],
  dispute_report_summary:
    "Görsel doğrulama sonucunda beklenen ürün ile iade paketindeki ürün arasında kritik seviyede uyuşmazlık tespit edildi.",
  marketplace_appeal_draft:
    "Sayın Platform Yetkilisi,\n\nİlgili iade dosyasında görsel doğrulama sonucunda sipariş kaydındaki ürün ile depoya ulaşan iade içeriği arasında kritik seviyede uyuşmazlık tespit edilmiştir. Para iadesi tamamlanmadan önce dosyanın operasyon ekibi tarafından değerlendirilmesini ve ek kanıtların incelenmesini rica ederiz.",
  customer_response_draft:
    "İade süreciniz, görsel doğrulama sırasında tespit edilen bazı tutarsızlıklar nedeniyle ek incelemeye alınmıştır. İnceleme tamamlandığında süreç hakkında yeniden bilgilendirileceksiniz.",
  automated_action_log: [
    "Pazaryeri webhook akışı üzerinden yeni iade vakası alındı.",
    "Orijinal sipariş görseli ile depo iade görseli karşılaştırıldı.",
    "Kritik ürün uyumsuzluğu tespit edildi.",
    "Kanıt özeti hazırlanarak insan incelemesine yönlendirildi.",
  ],
  thought_trace:
    "VISION AGENT:\nOriginal: iPhone 15 Pro Max. Returned: Dove soap.\n\nVERIFICATION AGENT:\nFound 1 critical discrepancy. Overall severity: CRITICAL.\n\nDECISION AGENT:\nRisk score set to 100 because returned item category differs completely.\n\nRESOLUTION AGENT:\nMarketplace appeal and neutral customer response prepared for human review.",
  summary: "İade edilen ürün beklenen ürünle uyuşmuyor.",
  recommended_action: "Para iadesini durdurmadan, dosyayı kanıt özetiyle manuel incelemeye alın.",
  recommended_next_step: "Kanıt özetini kontrol et ve pazaryerine değerlendirme talebi ilet.",
};

const demoCases: CaseRecord[] = [
  {
    id: "GA-E4F71D",
    product_name: "Trendyol / Elektronik / iPhone 15 Pro Max 256GB",
    risk_score: 100,
    status: "IN_REVIEW",
    agent_data: demoResult,
    image_urls: {},
    created_at: new Date().toISOString(),
  },
  {
    id: "GA-7A19C2",
    product_name: "Hepsiburada / Kulaklık / Kablosuz kulaklık seti",
    risk_score: 54,
    status: "MANUAL_REVIEW",
    agent_data: { ...demoResult, case_id: "GA-7A19C2", risk_score: 54, risk_level: "medium" },
    image_urls: {},
    created_at: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
  },
  {
    id: "GA-31D90B",
    product_name: "Amazon / Moda / Spor ayakkabı",
    risk_score: 12,
    status: "APPROVED",
    agent_data: { ...demoResult, case_id: "GA-31D90B", risk_score: 12, risk_level: "low" },
    image_urls: {},
    created_at: new Date(Date.now() - 1000 * 60 * 94).toISOString(),
  },
];

function getInitialView(): ActiveView {
  if (typeof window === "undefined") return "dashboard";
  const action = new URLSearchParams(window.location.search).get("action");
  if (action === "cases") return "cases";
  if (action === "new_case") return "new_case";
  return "dashboard";
}

function getInitialDemoState() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("action") === "demo";
}

function fileFromBase64(base64String: string, filename: string): File {
  const [header, data] = base64String.split(",");
  const mime = header.match(/:(.*?);/)?.[1] || "image/png";
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new File([bytes], filename, { type: mime });
}

function riskBadge(score: number) {
  if (score >= 86) return "border-red-200 bg-red-50 text-red-700";
  if (score >= 61) return "border-orange-200 bg-orange-50 text-orange-700";
  if (score >= 26) return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function NavButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
        active ? "bg-white text-slate-950 shadow-sm" : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

function StepIndicator({ step }: { step: WizardStep }) {
  const steps = [
    { id: 1, label: "Vaka bilgisi" },
    { id: 2, label: "Kanıt görselleri" },
    { id: 3, label: "Ajan analizi" },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {steps.map((item) => (
        <div
          key={item.id}
          className={`rounded-md border px-3 py-2 text-sm ${
            step === item.id
              ? "border-blue-500 bg-blue-50 text-blue-800"
              : step > item.id
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-500"
          }`}
        >
          <span className="mr-2 font-semibold">{item.id}</span>
          {item.label}
        </div>
      ))}
    </div>
  );
}

function EvidenceUpload({
  title,
  subtitle,
  tone,
  preview,
  onUpload,
}: {
  title: string;
  subtitle: string;
  tone: "blue" | "amber";
  preview: string | null;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const accent = tone === "blue" ? "border-blue-300 bg-blue-50 text-blue-700" : "border-amber-300 bg-amber-50 text-amber-700";

  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
        <Upload className="h-4 w-4" />
        {title}
      </span>
      <span className="mb-3 block text-xs text-slate-500">{subtitle}</span>
      <div className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-dashed ${accent}`}>
        {preview ? (
          <img src={preview} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="px-6 text-center">
            <Upload className="mx-auto mb-3 h-8 w-8" />
            <p className="text-sm font-semibold">Görsel seç</p>
            <p className="mt-1 text-xs text-slate-500">PNG veya JPG</p>
          </div>
        )}
        <input type="file" accept="image/*" className="absolute inset-0 cursor-pointer opacity-0" onChange={onUpload} />
      </div>
    </label>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<ActiveView>(getInitialView);
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [isDemoFetching, setIsDemoFetching] = useState(getInitialDemoState);
  const [casesList, setCasesList] = useState<CaseRecord[]>(demoCases);
  const [isFetchingCases, setIsFetchingCases] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [customerReason, setCustomerReason] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [marketplace, setMarketplace] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productValue, setProductValue] = useState("");
  const [referenceSource, setReferenceSource] = useState("Katalog görseli");
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [returnedImage, setReturnedImage] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [returnedPreview, setReturnedPreview] = useState<string | null>(null);

  const displayedCases = casesList.length > 0 ? casesList : demoCases;

  const stats = useMemo(() => {
    const total = displayedCases.length;
    const critical = displayedCases.filter((item) => item.risk_score >= 86).length;
    const avgRisk = Math.round(displayedCases.reduce((sum, item) => sum + item.risk_score, 0) / Math.max(total, 1));
    const valueAtRisk = "45.000 TL";
    return { total, critical, avgRisk, valueAtRisk };
  }, [displayedCases]);

  const refreshCases = useCallback(async () => {
    setIsFetchingCases(true);
    try {
      const data = await fetchCases();
      setCasesList(data.length > 0 ? data : demoCases);
    } catch {
      setCasesList(demoCases);
    } finally {
      setIsFetchingCases(false);
    }
  }, []);

  const openCases = () => {
    setActiveView("cases");
    void refreshCases();
  };

  const startNewCase = () => {
    setActiveView("new_case");
    setWizardStep(1);
    setError(null);
  };

  const triggerDemoFetch = () => {
    setIsDemoFetching(true);
  };

  useEffect(() => {
    if (!isDemoFetching) return undefined;
    const timer = window.setTimeout(() => {
      localStorage.setItem("guardian_analysis_result", JSON.stringify(demoResult));
      localStorage.setItem("guardian_original_preview", "");
      localStorage.setItem("guardian_returned_preview", "");
      localStorage.setItem("guardian_reference_source", "Katalog görseli");
      router.push("/results");
    }, 1600);
    return () => window.clearTimeout(timer);
  }, [isDemoFetching, router]);

  if (isDemoFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg border border-blue-400/30 bg-blue-500/10">
            <Loader2 className="h-8 w-8 animate-spin text-blue-300" />
          </div>
          <h1 className="text-2xl font-semibold">Pazaryeri akışı taranıyor</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Demo webhook senaryosu çalışıyor. Şüpheli iade vakası yakalanınca delil dosyasına yönlendirileceksiniz.
          </p>
        </div>
      </div>
    );
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: "original" | "returned") => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (type === "original") {
      setOriginalImage(file);
      setOriginalPreview(URL.createObjectURL(file));
    } else {
      setReturnedImage(file);
      setReturnedPreview(URL.createObjectURL(file));
    }
  };

  const viewCaseDetails = (caseRecord: CaseRecord) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace("/api/v1", "") : "http://localhost:8000";
    const originalUrl = caseRecord.image_urls?.original ? `${API_BASE}${caseRecord.image_urls.original}` : "";
    const returnedUrl = caseRecord.image_urls?.returned ? `${API_BASE}${caseRecord.image_urls.returned}` : "";

    localStorage.setItem("guardian_analysis_result", JSON.stringify(caseRecord.agent_data || demoResult));
    localStorage.setItem("guardian_original_preview", originalUrl);
    localStorage.setItem("guardian_returned_preview", returnedUrl);
    localStorage.setItem("guardian_reference_source", "Referans görsel");
    router.push("/results");
  };

  const handleAnalyze = async () => {
    setWizardStep(3);
    setIsAnalyzing(true);
    setLoadingStep(0);
    setError(null);

    const progressTimer = window.setInterval(() => {
      setLoadingStep((current) => Math.min(current + 1, loadingMessages.length - 1));
    }, 900);

    try {
      const placeholderBase64 =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
      const origFile = originalImage || fileFromBase64(placeholderBase64, "expected_catalog_reference.png");
      const retFile = returnedImage || fileFromBase64(placeholderBase64, "actual_physical_evidence.png");
      const combinedOrderDesc = `Pazaryeri: ${marketplace || "Demo"}. Kategori: ${productCategory || "Genel"}. Ürün: ${shortDescription || "Demo ürün"}. Referans kaynağı: ${referenceSource}.`;

      const data = await analyzeReturn(
        origFile,
        retFile,
        combinedOrderDesc,
        customerReason || "Belirtilmedi",
        productValue || "1000 TL",
      );

      localStorage.setItem("guardian_analysis_result", JSON.stringify(data));
      localStorage.setItem("guardian_original_preview", originalPreview || placeholderBase64);
      localStorage.setItem("guardian_returned_preview", returnedPreview || placeholderBase64);
      localStorage.setItem("guardian_reference_source", referenceSource);
      router.push("/results");
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Görseller analiz edilirken hata oluştu.";
      setError(message);
      setWizardStep(2);
    } finally {
      window.clearInterval(progressTimer);
      setIsAnalyzing(false);
    }
  };

  const renderDashboard = () => (
    <div className="mx-auto max-w-7xl min-w-0 space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Human-in-the-loop iade doğrulama
            </div>
            <h1 className="max-w-3xl text-3xl font-semibold tracking-normal text-slate-950">
              Şüpheli iadeleri kanıt dosyasına çeviren operasyon paneli
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
              GuardianAI, iade paketindeki ürünün sipariş kaydıyla görsel olarak uyuşup uyuşmadığını analiz eder. Sistem müşteriyi suçlamaz veya iadeyi tek başına reddetmez; operasyon ekibine öncelik, gerekçe, delil özeti ve pazaryeri aksiyon taslağı verir.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={startNewCase}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
              >
                <PlusCircle className="h-4 w-4" />
                Yeni vaka başlat
              </button>
              <button
                type="button"
                onClick={triggerDemoFetch}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
              >
                <Activity className="h-4 w-4" />
                Demo taramayı çalıştır
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Jüri demosu için ana mesaj</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                15-20 dakikalık manuel iade incelemesini birkaç saniyelik kanıt hazırlama akışına indirir.
              </p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase text-emerald-700">Güvenlik ilkesi</p>
              <p className="mt-2 text-sm leading-6 text-emerald-800">
                Nihai karar insanda kalır; AI sadece riskleri açıklar ve dosyayı hazırlanabilir hale getirir.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Bugünkü vaka", value: stats.total, icon: FolderOpen, tone: "text-blue-700 bg-blue-50 border-blue-200" },
          { label: "Kritik öncelik", value: stats.critical, icon: AlertTriangle, tone: "text-red-700 bg-red-50 border-red-200" },
          { label: "Ortalama risk", value: `${stats.avgRisk}/100`, icon: Gauge, tone: "text-amber-700 bg-amber-50 border-amber-200" },
          { label: "Finansal risk", value: stats.valueAtRisk, icon: CircleDollarSign, tone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
        ].map((item) => (
          <div key={item.label} className={`rounded-lg border bg-white p-4 shadow-sm ${item.tone}`}>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase">{item.label}</p>
              <item.icon className="h-4 w-4" />
            </div>
            <p className="text-2xl font-semibold text-slate-950">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="grid min-w-0 gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-950">Öncelikli vaka kuyruğu</h2>
              <p className="mt-1 text-xs text-slate-500">Risk skoru yüksek dosyalar ilk sırada ele alınır.</p>
            </div>
            <button type="button" onClick={openCases} className="text-sm font-semibold text-blue-700 hover:text-blue-900">
              Tümünü aç
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Vaka</th>
                  <th className="px-5 py-3 font-semibold">Ürün</th>
                  <th className="px-5 py-3 font-semibold">Risk</th>
                  <th className="px-5 py-3 font-semibold">Durum</th>
                  <th className="px-5 py-3 font-semibold text-right">Aksiyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedCases.slice(0, 4).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-800">{item.id}</td>
                    <td className="max-w-[280px] px-5 py-4 text-slate-600">{cleanText(item.product_name)}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${riskBadge(item.risk_score)}`}>
                        {item.risk_score}/100
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{statusLabel(item.status)}</td>
                    <td className="px-5 py-4 text-right">
                      <button type="button" onClick={() => viewCaseDetails(item)} className="text-sm font-semibold text-blue-700 hover:text-blue-900">
                        İncele
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-950">Ajan akışı</h2>
          <p className="mt-1 text-xs text-slate-500">Demo sırasında anlatılacak teknik omurga.</p>
          <div className="mt-5 space-y-4">
            {[
              ["Vision Agent", "İki görselden ürün tipi, kondisyon, aksesuar ve hasar bulgularını çıkarır."],
              ["Verification Agent", "Beklenen ürün ile dönen paketi kurallı ve semantik olarak karşılaştırır."],
              ["Decision Agent", "Risk skoru, öncelik ve manuel inceleme gerekliliğini hesaplar."],
              ["Resolution Agent", "Kanıt özeti, pazaryeri itiraz taslağı ve müşteri bilgilendirme metni üretir."],
            ].map(([title, description], index) => (
              <div key={title} className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-950 text-xs font-semibold text-white">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  const renderCases = () => (
    <div className="mx-auto max-w-7xl min-w-0 space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Vaka yönetimi</h1>
          <p className="mt-2 text-sm text-slate-600">Geçmiş analizler, demo vakaları ve operasyonel karar durumu.</p>
        </div>
        <button
          type="button"
          onClick={refreshCases}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          {isFetchingCases ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Yenile
        </button>
      </div>

      <div className="min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm">
        {isFetchingCases ? (
          <div className="flex min-h-56 items-center justify-center text-sm text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Vakalar yükleniyor
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Case ID</th>
                  <th className="px-5 py-3 font-semibold">Sipariş / ürün</th>
                  <th className="px-5 py-3 font-semibold">Risk skoru</th>
                  <th className="px-5 py-3 font-semibold">Durum</th>
                  <th className="px-5 py-3 font-semibold">Tarih</th>
                  <th className="px-5 py-3 font-semibold text-right">Detay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedCases.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-900">{item.id}</td>
                    <td className="max-w-[360px] px-5 py-4 text-slate-600">{cleanText(item.product_name)}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${riskBadge(item.risk_score)}`}>
                        {item.risk_score}/100
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{statusLabel(item.status)}</td>
                    <td className="px-5 py-4 text-slate-500">{new Date(item.created_at).toLocaleString("tr-TR")}</td>
                    <td className="px-5 py-4 text-right">
                      <button type="button" onClick={() => viewCaseDetails(item)} className="font-semibold text-blue-700 hover:text-blue-900">
                        Aç
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderNewCase = () => (
    <div className="mx-auto max-w-5xl min-w-0 space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Manuel iade doğrulama</h1>
        <p className="mt-2 text-sm text-slate-600">Sipariş bağlamını ve iki kanıt görselini verin; GuardianAI vaka dosyasını hazırlasın.</p>
      </div>
      <StepIndicator step={wizardStep} />

      {wizardStep === 1 && (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Store className="h-4 w-4" />
                Satış platformu
              </span>
              <select value={marketplace} onChange={(event) => setMarketplace(event.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                <option value="">Seçiniz</option>
                <option value="Trendyol">Trendyol</option>
                <option value="Hepsiburada">Hepsiburada</option>
                <option value="Amazon">Amazon</option>
                <option value="Shopify">Kendi e-ticaret sitesi</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Boxes className="h-4 w-4" />
                Ürün kategorisi
              </span>
              <select value={productCategory} onChange={(event) => setProductCategory(event.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                <option value="">Seçiniz</option>
                <option value="Elektronik">Elektronik</option>
                <option value="Moda">Moda</option>
                <option value="Ev ve yaşam">Ev ve yaşam</option>
                <option value="Kozmetik">Kozmetik</option>
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-slate-800">Sipariş kısa açıklaması</span>
              <input value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} placeholder="Örn. iPhone 15 Pro Max 256GB Naturel Titanyum" className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-800">Müşteri iade sebebi</span>
              <select value={customerReason} onChange={(event) => setCustomerReason(event.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                <option value="">Sebep seçin</option>
                <option value="Ürün hasarlı geldi">Ürün hasarlı geldi</option>
                <option value="Yanlış ürün gönderildi">Yanlış ürün gönderildi</option>
                <option value="Aksesuar veya parça eksik">Aksesuar veya parça eksik</option>
                <option value="Fikrimi değiştirdim">Fikrimi değiştirdim</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-800">Ürün değeri</span>
              <input value={productValue} onChange={(event) => setProductValue(event.target.value)} placeholder="Örn. 45.000 TL" className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </label>
          </div>

          <div className="mt-6 flex justify-end">
            <button type="button" onClick={() => setWizardStep(2)} className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
              Kanıt görsellerine geç
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {wizardStep === 2 && (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <label className="mb-5 block">
            <span className="mb-2 block text-sm font-semibold text-slate-800">Referans görsel kaynağı</span>
            <select value={referenceSource} onChange={(event) => setReferenceSource(event.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
              <option value="Katalog görseli">Pazaryeri katalog görseli</option>
              <option value="Paketleme kamerası">Satıcı paketleme kamerası</option>
              <option value="Müşteri kargo öncesi kanıtı">Müşteri kargo öncesi kanıtı</option>
            </select>
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <EvidenceUpload title="Beklenen ürün" subtitle="Sipariş, katalog veya çıkış anı görseli" tone="blue" preview={originalPreview} onUpload={(event) => handleImageUpload(event, "original")} />
            <EvidenceUpload title="Depoya dönen ürün" subtitle="İade paketinden çıkan gerçek ürün" tone="amber" preview={returnedPreview} onUpload={(event) => handleImageUpload(event, "returned")} />
          </div>

          {error && (
            <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse justify-between gap-3 sm:flex-row">
            <button type="button" onClick={() => setWizardStep(1)} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <ChevronLeft className="h-4 w-4" />
              Geri
            </button>
            <button type="button" onClick={handleAnalyze} className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">
              <Activity className="h-4 w-4" />
              AI analizini başlat
            </button>
          </div>
        </section>
      )}

      {wizardStep === 3 && (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mx-auto max-w-xl text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              {isAnalyzing ? <Loader2 className="h-7 w-7 animate-spin" /> : <CheckCircle2 className="h-7 w-7" />}
            </div>
            <h2 className="text-xl font-semibold text-slate-950">Ajan zinciri çalışıyor</h2>
            <p className="mt-2 text-sm text-slate-600">Analiz tamamlandığında sonuç dosyasına yönlendirileceksiniz.</p>
          </div>
          <div className="mx-auto mt-6 max-w-2xl space-y-3">
            {loadingMessages.map((message, index) => (
              <div key={message} className={`flex items-center gap-3 rounded-md border px-4 py-3 text-sm ${index <= loadingStep ? "border-blue-200 bg-blue-50 text-blue-800" : "border-slate-200 bg-slate-50 text-slate-400"}`}>
                {index < loadingStep ? <CheckCircle2 className="h-4 w-4" /> : index === loadingStep ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock3 className="h-4 w-4" />}
                {message}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );

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
              <p className="mt-1 text-xs text-slate-400">Return verification ops</p>
            </div>
          </div>

          <nav className="space-y-1">
            <NavButton active={activeView === "dashboard"} icon={LayoutDashboard} label="Operasyon paneli" onClick={() => setActiveView("dashboard")} />
            <NavButton active={activeView === "cases"} icon={FolderOpen} label="Vakalar" onClick={openCases} />
            <NavButton active={activeView === "new_case"} icon={PlusCircle} label="Manuel doğrulama" onClick={startNewCase} />
          </nav>

          <div className="mt-6 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={triggerDemoFetch}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-blue-200 transition hover:bg-blue-500/10 hover:text-white"
            >
              <Activity className="h-4 w-4" />
              Demo webhook taraması
            </button>
            <button
              type="button"
              className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-400"
            >
              <BarChart3 className="h-4 w-4" />
              Finansal raporlar
            </button>
          </div>

          <div className="mt-auto rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-50">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <PackageCheck className="h-4 w-4" />
              Demo odağı
            </div>
            <p className="text-xs leading-5 text-emerald-100/80">
              Otomatik ret değil, kanıta dayalı insan karar desteği.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button type="button" className="rounded-md border border-slate-300 p-2 text-slate-600 lg:hidden">
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <h2 className="text-base font-semibold text-slate-950 sm:text-lg">İade önceliklendirme ve kanıt yönetimi</h2>
                </div>
              </div>
              <div className="hidden items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:flex">
                <FileSearch className="h-4 w-4" />
                <span>Case ID, sipariş veya ürün ara</span>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {activeView === "dashboard" && renderDashboard()}
            {activeView === "cases" && renderCases()}
            {activeView === "new_case" && renderNewCase()}
          </main>
        </div>
      </div>
    </div>
  );
}
