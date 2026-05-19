# GuardianAI

**AI destekli iade önceliklendirme ve operasyonel doğrulama platformu**

GuardianAI, e-ticaret satıcılarının iade süreçlerinde yaşadığı görsel doğrulama, önceliklendirme ve kanıt yönetimi problemini çözmeyi hedefleyen bir prototiptir.

Proje, iadeleri otomatik reddeden veya müşteriyi suçlayan bir sistem olarak tasarlanmamıştır. GuardianAI’nin amacı, operasyon ekiplerinin şüpheli iade vakalarını daha hızlı incelemesine, görsel kanıtları daha düzenli değerlendirmesine ve nihai kararı insan denetiminde vermesine yardımcı olmaktır.

## Çözülen Problem

E-ticaret satıcıları için iade süreci çoğu zaman yalnızca “ürün geri geldi mi?” sorusundan ibaret değildir. Operasyon ekibinin yanıtlaması gereken daha kritik sorular vardır:

- İade edilen ürün gerçekten siparişteki ürün mü?
- Ürün depodan çıktığı kondisyonla mı geri döndü?
- Aksesuar, parça veya ambalaj eksik mi?
- Müşteri beyanı ile görsel kanıtlar tutarlı mı?
- Bu dosya standart iade akışında mı ilerlemeli, yoksa manuel incelemeye mi alınmalı?
- Pazaryeriyle yaşanabilecek bir uyuşmazlıkta satıcının elinde yeterli kanıt var mı?

Bu sorular bugün birçok satıcıda manuel olarak yanıtlanır. Depo çalışanı görselleri inceler, sipariş bilgisiyle karşılaştırır, şüpheli durumları not eder ve gerekirse pazaryerine açıklama hazırlar. Bu süreç yoğun iade hacminde yavaş, tutarsız ve kişiye bağımlı hale gelir.

## Neden Önemli?

İade operasyonundaki hatalar satıcı için doğrudan maliyet üretir:

- Yanlış veya farklı ürün iadesi kabul edilebilir.
- Eksik aksesuar ya da hasarlı ürün gözden kaçabilir.
- Şüpheli vakalar zamanında fark edilmediği için para iadesi tamamlanabilir.
- Satıcı haklı olsa bile pazaryerine düzenli kanıt sunamadığı için itiraz süreci zayıf kalabilir.

GuardianAI bu noktada manuel inceleme sürecini tamamen ortadan kaldırmayı değil, daha yönetilebilir ve kanıta dayalı hale getirmeyi hedefler.

## Çözüm Yaklaşımı

GuardianAI, iade operasyonunda depo/pazaryeri akışı ile insan operatör arasında çalışan bir karar destek katmanıdır.

Sistem iki temel görsel girdiyi kullanır:

1. **Beklenen ürün görseli:** Katalog görseli, paketleme kamerası çıktısı veya siparişe ait referans görsel.
2. **İade edilen ürün görseli:** Depoya geri dönen paketten çıkan ürünün fotoğrafı.

Bu iki görsel ve sipariş bağlamı analiz edilerek şu çıktılar üretilir:

- Risk skoru
- Risk seviyesi
- Tespit edilen uyuşmazlıklar
- Operasyonel kanıt özeti
- İnsan incelemesi gerekip gerekmediği
- Pazaryeri değerlendirme talebi taslağı
- Müşteriye gönderilebilecek nötr bilgilendirme metni

Nihai karar sistem tarafından otomatik verilmez. GuardianAI, karar verecek operasyon ekibine yapılandırılmış bilgi ve kanıt sunar.

## Sistem Akışı

```text
İade vakası
   ↓
Beklenen ürün görseli + iade ürün görseli
   ↓
Vision Agent
   ↓
Verification Agent
   ↓
Decision Agent
   ↓
Resolution Agent
   ↓
Operasyonel delil dosyası + insan kararı
```

## Ajan Mimarisi

GuardianAI dört aşamalı bir yapay zeka akışı kullanır.

| Ajan | Görev |
| --- | --- |
| **Vision Agent** | Görsellerden ürün tipi, kondisyon, görünür hasar, ambalaj ve aksesuar bilgilerini çıkarır. |
| **Verification Agent** | Beklenen ürün ile iade edilen ürün arasındaki tutarsızlıkları karşılaştırır. |
| **Decision Agent** | Uyuşmazlıkların önemine göre risk skoru, risk seviyesi ve manuel inceleme ihtiyacını hesaplar. |
| **Resolution Agent** | Operasyon ekibine sunulacak kanıt özeti ve iletişim taslaklarını hazırlar. |

## Örnek Kullanım Senaryoları

| Senaryo | Sistem çıktısı |
| --- | --- |
| Ürün aynı ve belirgin sorun yok | Düşük risk, standart iade akışı önerisi |
| Aksesuar eksik | Manuel inceleme önerisi, eksik parça kanıtı |
| Ürün hasarlı geri döndü | Hasar bulgusu, operasyonel değerlendirme önerisi |
| Beklenen üründen tamamen farklı ürün döndü | Kritik risk, kanıt özeti ve pazaryeri değerlendirme taslağı |

## Tasarım İlkeleri

GuardianAI aşağıdaki ilkelerle tasarlanmıştır:

- **İnsan denetimi:** Son karar operasyon ekibindedir.
- **Açıklanabilirlik:** Risk skoru tek başına verilmez; gerekçeler ve uyuşmazlıklar gösterilir.
- **Nötr dil:** Müşteri iletişiminde suçlayıcı ifadeler kullanılmaz.
- **Kanıt odaklılık:** Sistem görsel bulguları operasyonel dosyaya dönüştürür.
- **Ölçeklenebilirlik:** Çok sayıda iade arasından öncelikli dosyaları ayırmayı hedefler.

## Prototipte Bulunan Özellikler

- Manuel iade vakası başlatma
- Beklenen ürün ve iade ürünü görseli yükleme
- AI tabanlı görsel analiz
- Risk skoru ve öncelik seviyesi
- Uyuşmazlık tablosu
- Operasyonel kanıt özeti
- Pazaryeri değerlendirme talebi taslağı
- Müşteri bilgilendirme metni
- Ajan karar izi
- Vaka listesi ve sonuç ekranı

## Teknik Mimari

**Frontend**

- Next.js
- React
- Tailwind CSS
- Lucide React

**Backend**

- FastAPI
- LangGraph
- Google Gemini Vision
- SQLAlchemy
- SQLite

## Proje Yapısı

```text
GuardianAII/
├─ backend/
│  ├─ app/
│  │  ├─ agents/
│  │  ├─ api/
│  │  ├─ services/
│  │  ├─ schemas/
│  │  └─ main.py
│  └─ requirements.txt
├─ frontend/
│  ├─ src/app/
│  ├─ src/lib/
│  ├─ src/types/
│  └─ package.json
└─ README.md
```

## Lokal Kurulum

### Backend

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
py -m uvicorn app.main:app --reload
```

Backend varsayılan adres:

```text
http://localhost:8000
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend varsayılan adres:

```text
http://localhost:3000
```

## Demo Akışı

1. Frontend paneli açılır.
2. Yeni iade doğrulama vakası başlatılır.
3. Sipariş bağlamı girilir.
4. Beklenen ürün görseli ve iade edilen ürün görseli yüklenir.
5. AI analiz akışı çalıştırılır.
6. Sonuç ekranında risk skoru, uyuşmazlıklar, kanıt özeti ve önerilen aksiyonlar incelenir.
7. Operasyon ekibi nihai kararı verir.

## Kapsam ve Sınırlar

Bu proje bir hackathon prototipidir. Üretim ortamına alınmadan önce aşağıdaki başlıkların geliştirilmesi gerekir:

- Gerçek pazaryeri API entegrasyonları
- Depo kamera sistemleriyle entegrasyon
- Daha geniş test veri seti
- Rol bazlı kullanıcı yetkilendirme
- Denetim kayıtları ve güvenlik sertleştirmesi
- Model çıktıları için ek kalite kontrol mekanizmaları

GuardianAI bu haliyle, iade operasyonlarında yapay zekanın nasıl sorumlu, açıklanabilir ve insan denetimli bir karar destek aracına dönüşebileceğini gösteren çalışan bir prototiptir.
