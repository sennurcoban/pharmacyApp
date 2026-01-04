# EczaneBul 🏥💊

**EczaneBul**, Türkiye'deki tüm nöbetçi eczaneleri anlık olarak bulmanızı sağlayan pratik bir mobil uygulamadır. Bulunduğunuz konuma en yakın eczaneleri listeler, harita üzerinde gösterir ve yol tarifi almanızı sağlar.

## 🚀 Özellikler

- **📍 Otomatik Konum Tespiti:** Uygulama açıldığında GPS konumunuzu algılar ve size **en yakın** nöbetçi eczaneleri otomatik olarak getirir (Reverse Geocoding destekli).
- **🔍 Detaylı Arama:** İl ve İlçe seçerek Türkiye'nin 81 ilindeki nöbetçi eczaneleri sorgulayabilirsiniz.
- **🗺️ Harita Entegrasyonu:** Eczanelerin konumlarını harita üzerinde görün ve "Yol Tarifi Al" özelliği ile (Google Maps/Apple Maps) kolayca ulaşın.
- **📞 Tek Tıkla Arama:** Eczaneyi doğrudan uygulama üzerinden arayabilirsiniz.
- **🌙 7/24 Güncel:** Veriler **CollectAPI** üzerinden anlık ve doğru olarak çekilir.

## 🛠️ Kurulum ve Çalıştırma

Bu projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

### 1. Gereksinimler
- Node.js
- Expo CLI (`npm install -g expo-cli`)
- Telefonunuzda **Expo Go** uygulaması (App Store / Play Store)

### 2. Projeyi İndirin ve Bağımlılıkları Yükleyin

```bash
git clone https://github.com/sennurcoban/pharmacyApp.git
cd pharmacyApp
npm install
```

### 3. API Anahtarını Ayarlayın 🔑

Uygulama nöbetçi eczane verileri için **CollectAPI** servisini kullanır. Kendi API anahtarınızı ücretsiz alıp projeye eklemelisiniz:

1. [CollectAPI Nöbetçi Eczane API](https://collectapi.com/tr/api/health/nobetci-eczane-api) adresinden ücretsiz üye olun ve API anahtarınızı alın.
2. `src/api/Enpoints.js` dosyasını açın.
3. `COLLECT_API_KEY` değişkenine anahtarınızı yapıştırın:

```javascript
// src/api/Enpoints.js
const COLLECT_API_KEY = "apikey size_verilen_anahtar_buraya"; 
const USE_MOCK_DATA = false; // Gerçek veriler için false yapın
```

### 4. Uygulamayı Başlatın ▶️

```bash
npx expo start
```

Terminalde çıkan QR kodu telefonunuzdaki **Expo Go** uygulaması ile okutun.

## 📱 Simülatör ve Gerçek Cihaz Notları

- **Gerçek Cihaz:** GPS açıksa, uygulama konumunuzu otomatik bulur ve etrafınızdaki eczaneleri getirir. Hiçbir ayar yapmanıza gerek yoktur.
- **Simülatör (iOS/Android):** Simülatörler varsayılan olarak (0,0) veya San Francisco konumunda başlar. Türkiye verilerini görmek için:
    - **iOS Simulator:** Menüden `Features` > `Location` > `Custom Location` seçip bir Türkiye koordinatı (Örn: Tokat -> 40.3167, 36.5500) girin.

## 🤝 Katkıda Bulunma

Hataları bildirmek veya özellik eklemek için lütfen "Issues" veya "Pull Request" kullanın.

## 📄 Lisans

Bu proje MIT lisansı ile lisanslanmıştır.
