# GuardianAI Mimari Dokümanı 🏗️

## 1. Sistem Bileşenleri

### Frontend (Next.js)
Kullanıcıların iade taleplerini gördüğü, dashboard üzerinden istatistikleri takip ettiği ve otonom sistemin aldığı kararları izlediği arayüz.

### Backend (FastAPI)
- Yüksek performanslı asenkron API.
- LangGraph pipeline'ını host eder.
- Frontend ile AI modelleri arasında köprü kurar.

### AI Pipeline (LangGraph & Gemini)
Sistemin beyni. Karar döngüsü şu şekildedir:
1. **Detection:** Gönderilen veriler parse edilir.
2. **Reasoning:** Gemini 1.5 Pro kullanılarak ürün ile iade verisi karşılaştırılır, "Fraud Risk Skoru" belirlenir.
3. **Action:** Risk skoruna göre iade onaylanır veya askıya alınıp otomatik dilekçe üretilir.

## 2. Veri Akışı
1. E-ticaret platformundan/Kullanıcıdan iade görseli ve sipariş verisi gelir.
2. `POST /api/v1/analysis/analyze` endpoint'ine düşer.
3. LangGraph Agent State başlatılır.
4. Gemini modeli multimodal analiz yapar.
5. Aksiyon kararı verilip State güncellenir.
6. Sonuç Frontend'e dönülür.
