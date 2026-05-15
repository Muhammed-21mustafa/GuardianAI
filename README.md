# 🛡️ GuardianAI: Autonomous Security Shield for E-Commerce

<div align="center">
  <p><strong>890 Milyar Dolarlık İade Krizine KOBİ Odaklı "Otonom Şahit" Çözümü</strong></p>
</div>

---

## 🛑 Problem: Görünmeyen Tehdidin Anatomisi
2025 yılı verilerine göre e-ticaret dünyasında **"İade Dolandırıcılığı" (Return Fraud)** ve operasyonel suistimaller her yıl **890 Milyar Dolarlık** devasa bir kayba yol açmaktadır. 
Özellikle Türkiye e-ticaret pazarının %78'ini oluşturan **KOBİ'ler**, kurumsal devlere kıyasla bu dolandırıcılıktan **%57 daha fazla zarar görmekte** ve çoğu zaman iflas riskiyle karşı karşıya kalmaktadır.

*   **Empty Box Scam / Rock in a Box:** İade kutusundan ürün yerine taş çıkması.
*   **Return Fraud:** Orijinal ürünün alıkonup, içine sahte/eski ürün konularak iade edilmesi.
*   **Wardrobing:** Tek seferlik kullanıp "beğenmedim" diyerek geri gönderme (özellikle tekstil ve elektronik).

Satıcıların elinde iade sürecinin haklılığını kanıtlayacak **manipüle edilemez dijital deliller** bulunmadığı için, platformlar (Amazon, Trendyol vb.) genellikle alıcıyı haklı bulmakta ve KOBİ'ler zarara uğramaktadır.

---

## 🚀 Çözüm: GuardianAI ("Otonom Şahit")
GuardianAI, statik kodlarla çalışan basit bir yazılım değil; fiziksel dünyayı görebilen, muhakeme edebilen ve aksiyon alabilen bir **Agentic Commerce Defense (Yapay Zeka Savunma Ağı)** platformudur. 

Olay anında bir **"Otonom Şahit"** olarak devreye girer. Depo görevlisi iade paketini açtığı an sistemi besler, GuardianAI saniyeler içinde:
1. İadeyi orijinal kargo verisiyle karşılaştırır.
2. Sahtekarlığı, eksik aksesuarı veya hasarı tespit eder.
3. Hukuki ve operasyonel olarak pazar yerlerine sunulmak üzere **Değiştirilemez Delil Paketi (Evidence Package)** ve itiraz raporu (Dispute Report) üretir.

---

## 🧠 Nasıl Çalışır? (Multi-Agent Architecture)
Sistemimiz LangGraph altyapısıyla **4 farklı yapay zeka ajanının (Multi-Agent)** takım çalışmasıyla işler:

1.  👁️ **Vision Agent (Gözlemci):** Gemini 2.5 Flash Vision modelini kullanarak orijinal ve iade edilen ürün fotoğraflarından piksel piksel "kondisyon, renk, aksesuar, ürün tipi" çıkarımı yapar.
2.  🔍 **Verification Agent (Doğrulayıcı):** İki veri setini milimetrik olarak çapraz sorgular (Cross-reference) ve uyumsuzlukları (mismatches) şiddetine göre sınıflandırır.
3.  ⚖️ **Decision Agent (Yargıç):** Weighted Scoring (Ağırlıklı Puanlama) algoritmasıyla 0-100 arası bir Risk Skoru hesaplar. (Örn: Çizik = 15 Puan, Farklı Ürün = 100 Puan/Kritik Risk).
4.  🎯 **Resolution Agent (Operasyon Şefi):** Kurumsal Case Management (Vaka Yönetimi) sürecini başlatır. Otomatik aksiyonlar alır (örn: İadeyi bloke et), tahmini finansal kaybı hesaplar ve operasyon ekibine nihai raporu sunar.

---

## 💻 Tech Stack (Teknoloji Altyapısı)
GuardianAI, modern ve ölçeklenebilir bir kurumsal (Enterprise) altyapıya sahiptir:

*   **AI & Orchestration:** Google Gemini 2.5 Flash, LangGraph (StateGraph)
*   **Backend:** FastAPI (Python), Pydantic (Veri Validasyonu)
*   **Frontend:** Next.js (React), Tailwind CSS, Shadcn UI (Custom Dashboard)

---

## 🛠️ Kurulum & Çalıştırma (Lokal Demo)

Projeyi kendi bilgisayarınızda çalıştırmak için:

### 1. Backend
```bash
cd backend
python -m venv venv
# Windows için:
.\venv\Scripts\activate
# Mac/Linux için:
source venv/bin/activate

pip install -r requirements.txt
# .env dosyasına kendi GEMINI_API_KEY bilginizi girin.

uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Uygulama **http://localhost:3000** adresinde çalışacaktır.

---

## 🌍 Vizyon: Agentic Commerce Dönemi
Gelecekte alışverişleri bizim yerimize yapay zeka botları yapacak. Peki ya dolandırıcılığı da AI botları yaparsa? (Bot-Takeover saldırıları). GuardianAI, bu "AI vs AI" çağında, fiziksel dünyadaki ürünleri dijital dünyaya kusursuz bir veri seti olarak aktararak e-ticaretin **son savunma hattı** olmayı hedeflemektedir.
