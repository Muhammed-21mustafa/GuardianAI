# 🛡️ GuardianAI: AI-Powered Verification Case Management System

<div align="center">
  <p><strong>E-Ticaret İade Ekosisteminde Otonom Doğrulama ve Operasyonel Risk Yönetim Platformu</strong></p>
  <p><em>Hackathon Kazananı (Adayı) - B2B SaaS Prototipi</em></p>
</div>

---

## 🛑 Problem: Operasyonel Sızıntı ve Ters Lojistik Krizi
E-ticarette iade artık yalnızca “müşteri memnuniyeti” konusu değil; **operasyon, finans, sahtecilik ve ters lojistik** problemidir. 2024 verilerine göre perakende iadeleri küresel çapta **890 milyar dolara** ulaşmıştır. 

Satıcıların asıl ihtiyacı, iade sayısını mucizevi bir şekilde “sıfırlamak” değil; **hangi iadeye ne kadar sürede, hangi kanıtla ve hangi operasyonel aksiyonla yanıt vereceklerini sistematikleştirmektir.** Özellikle Türkiye'de Trendyol (2 gün ret süresi) ve Hepsiburada gibi platformların dar "zaman pencereleri" (SLA), otomasyonun değerini doğrudan görünür kılmaktadır.

Küçük ve orta ölçekli satıcılar (KOBİ'ler) için en yüksek zaman tasarrufu üç noktada oluşur:
1. Düşük riskli iadeleri otomatik ayırma (Triage).
2. Yüksek riskli vakalarda kanıt paketini (Evidence Package) standartlaştırma.
3. Çoklu kanal verisini tek bir "Case Management" (Vaka Yönetimi) ekranında toplama.

---

## 🚀 Çözüm: GuardianAI Operasyon Katmanı
GuardianAI basit bir "fotoğraf doğrulama" aracı değil, uçtan uca bir **Case Management (Vaka Yönetimi)** sistemidir. "Fraud’ı tamamen durduran sihirli değnek" iddiasında bulunmak yerine; görsel kanıt öncelikli çalışan, vakaları önceliklendiren, değiştirilemez kanıt paketleri üreten ve pazar yerlerine (Marketplace) "Dispute" (İtiraz) hazırlığını hızlandıran gerçekçi bir B2B SaaS çözümüdür.

### Nasıl Çalışır? (4 Aşamalı Vaka Akışı)
1. **Case Initiation (Vaka Başlatma):** Hangi pazar yerinden, hangi sebeple ve ne kadarlık bir ürün iade edildiğinin (Bağlam/Context) sisteme girilmesi.
2. **Evidence Collection (Delil Toplama):** Orijinal ve İade ürün görsellerinin GuardianAI'a yüklenmesi.
3. **AI Analysis (Otonom İnceleme):** Multi-agent (Çoklu-ajan) yapay zeka sisteminin saniyeler içinde kanıtları çapraz sorgulaması.
4. **Case Resolution (Vaka Çözümü):** Otomatik itiraz raporu (Dispute Report), risk skoru ve operasyonel aksiyon önerisinin (İadeyi Onayla / Bloke Et) sunulması.

---

## 🧠 Zeka Katmanı: Multi-Agent Mimari (LangGraph)
Sistemimiz LangGraph altyapısıyla 4 farklı yapay zeka ajanının senkronize çalışmasıyla işler:

*   👁️ **Vision Agent (Gözlemci):** Google Gemini 2.5 Flash Vision kullanarak, müşteri sipariş açıklaması ile görsel kanıtları karşılaştırır. Piksel düzeyinde "kondisyon, aksesuar, ürün tipi" çıkarımı yapar. (Örn: Sipariş ayakkabı iken, görselin iPhone kutusu olmasını anında yakalar).
*   🔍 **Verification Agent (Doğrulayıcı):** Orijinal ve iade analizlerini milimetrik olarak çapraz sorgular ve uyuşmazlık (mismatch) raporu oluşturur.
*   ⚖️ **Decision Agent (Yargıç):** Müşterinin "İade Sebebi" (Örn: Hasarlı geldi vs. Beden uymadı) ile görsel bulguları karşılaştırarak mantıksal bir çıkarım yapar. Subjektif sebeplerde tolerans gösterirken, objektif yalan beyanlarda **Risk Skoruna** ceza puanı uygular.
*   🎯 **Resolution Agent (Operasyon Şefi):** Kurumsal Case Management durumunu (Örn: İNCELEME_İÇİN_BEKLETİLİYOR) günceller, log kayıtlarını oluşturur ve pazar yeri "SAFE-T / Seller Protection" kurallarına uygun **Dispute (İtiraz) Raporunu** hazırlar.

---

## 💡 Neden Hackathon Kazandırır? (Pazar Gerçekliği)
Projemiz, teorik bir AI demosu değil, pazar yerlerinin (Amazon, eBay, Trendyol, Hepsiburada) API akışlarına ve **SLA (Service Level Agreement)** sürelerine uygun tasarlanmıştır:
*   Müşteri yalan beyanlarını görsel delillerle (Evidence Completeness Rate) çürütür.
*   İlk inceleme süresini dakikalardan saniyelere indirir (TTR - Time to Resolution).
*   Tüm süreci tek bir Dark Mode Enterprise Dashboard üzerinden yöneterek "Gerçek bir ürün" hissi verir.

---

## 💻 Tech Stack (Teknoloji Altyapısı)
*   **AI Core:** Google Gemini 2.5 Flash (Vision & Reasoning), LangGraph (StateGraph)
*   **Backend:** FastAPI (Python), Pydantic
*   **Frontend:** Next.js (React), Tailwind CSS, Custom UI (Multi-step Onboarding)

---

## 🛠️ Kurulum & Lokal Test
Sistemi lokalinizde çalıştırmak için:

### 1. Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Mac/Linux: source venv/bin/activate
pip install -r requirements.txt

# .env dosyası oluşturup içine GEMINI_API_KEY=your_key_here ekleyin.
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Uygulama **http://localhost:3000** adresinde "Vaka Yönetim Platformu" olarak açılacaktır.
