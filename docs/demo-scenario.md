# Hekaton'26 - 7 Dakikalık Jüri Sunumu Demo Senaryosu 🎯

## 1. Giriş (1. Dakika)
- "Merhaba, e-ticaret satıcıları her yıl iade suistimalleri (Return Fraud) yüzünden milyarlarca dolar kaybediyor."
- "Biz bu sorunu sadece raporlayan değil, **otonom olarak durduran** GuardianAI'ı geliştirdik."

## 2. Platform Gösterimi (2-3. Dakika)
- Gösterilecek Ekran: GuardianAI Dashboard
- "Gördüğünüz gibi satıcının o günkü tüm iade talepleri burada listeleniyor."
- "Şimdi, sahte bir iade talebi geldiğini varsayalım."

## 3. Agentic Pipeline'ı Tetikleme (4-5. Dakika)
- Bir iPhone kutusunun içine sabun konulmuş bir görseli sisteme yüklüyoruz.
- Orijinal ürün bilgisi: "iPhone 15 Pro Max 256GB"
- "Analiz Et" butonuna basıyoruz.

**Arka Planda Neler Oluyor? (Jüriye Anlatım):**
- *Şu an LangGraph ajanımız devreye girdi.*
- *Gemini 1.5 Pro, orijinal ürün bilgisiyle görseli multimodal olarak analiz ediyor.*
- *Model, kutunun içindeki objenin telefon olmadığını tespit edip Fraud Skorunu %95 olarak hesaplıyor.*

## 4. Otonom Karar ve Sonuç (6. Dakika)
- Ekranda beliren sonuç:
  - **Karar:** 🔴 İade Askıya Alındı
  - **Risk:** %95 (Sabun tespit edildi)
  - **Otonom Aksiyon:** Kargo firması için otomatik tutanak/dilekçe oluşturuldu.

## 5. Kapanış (7. Dakika)
- "GuardianAI sayesinde satıcı, ürünü manuel kontrol etmeden, iade parası müşteriye geçmeden sahtekarlığı engelledi. Biz bir tool değil, **Ajan** yarattık. Teşekkürler."
