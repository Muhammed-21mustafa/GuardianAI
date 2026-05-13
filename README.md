# GuardianAI 🛡️

![GuardianAI Banner](https://via.placeholder.com/1200x300?text=GuardianAI+-+Autonomous+Operational+Security+Shield)

> **Finans ve E-Ticaret için Otonom Operasyonel Güvenlik Kalkanı**
> *Hekaton’26 Hackathon Projesi*

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org)
[![LangGraph](https://img.shields.io/badge/Agentic-LangGraph-orange.svg)](https://python.langchain.com/docs/langgraph)
[![Gemini](https://img.shields.io/badge/AI-Gemini_1.5_Pro-blue.svg)](https://deepmind.google/technologies/gemini/)

## 📖 Problem Tanımı
E-ticaretteki "kolay iade" politikaları, satıcıların "boş kutu", "kullanılmış ürün" veya "farklı ürün" iadeleriyle finansal zarara uğramasına neden olmaktadır (*Return Fraud*). GuardianAI, bu süreci otonom olarak yöneten, jüri kriterlerine uygun **Agentic (Otonom)** bir yapay zeka sistemidir.

## 🚀 Çözüm: Agentic Multimodal Pipeline
GuardianAI basit bir dashboard değil, kendi kararlarını alabilen bir "Güvenlik Ajanı"dır:
1. **Vision (Görme):** İade edilen paketin/ürünün görsel bütünlüğünü inceler (Multimodal LLM / YOLO).
2. **Reasoning (Muhakeme):** Orijinal ürün verisi ile iade görselini karşılaştırıp "Fraud Risk Skoru" üretir.
3. **Action (Aksiyon):** Risk yüksekse iadeyi askıya alır, itiraz dilekçesini hazırlar ve kargo/pazaryerine otonom bildirim gönderir.

## 🏗️ Mimari (Tech Stack)
- **Frontend:** Next.js (App Router), Tailwind CSS, Shadcn/ui
- **Backend:** FastAPI, Pydantic, PostgreSQL
- **AI/Agents:** LangGraph, Google Gemini 1.5 Pro (Vision & Reasoning)

## 📁 Proje Yapısı
```text
GuardianAI/
├── backend/          # FastAPI ve LangGraph Agent kodları
├── frontend/         # Next.js Dashboard
├── docs/             # Mimari diyagramlar ve sunum notları
└── docker-compose.yml# Hızlı kurulum
```

## ⚙️ Kurulum ve Çalıştırma

### Gereksinimler
- Docker & Docker Compose
- Google Gemini API Key

### Başlangıç
```bash
# 1. Repoyu klonlayın
git clone <repo-url>
cd GuardianAI

# 2. Çevre değişkenlerini ayarlayın
cp .env.example .env

# 3. Docker ile tüm sistemi ayağa kaldırın
docker-compose up -d --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs (Swagger): `http://localhost:8000/docs`

---
*Bu proje Hekaton’26 kapsamında geliştirilmektedir.*
