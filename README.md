<h1 align="center">
  <!-- <br>
  <img src="https://via.placeholder.com/150x150/2563EB/FFFFFF?text=Simmar" alt="Simmar Logo" width="150">
  <br> -->
  Simmar
  <br>
  <sub><sup>Simple Marketplace</sup></sub>
  <br>
</h1>

<p align="center">
  <a href="https://e-commerce-electronic-chi.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Live_Demo-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo">
  </a>
  <a href="https://github.com/ahmeteyibil/e-commerce-electronic" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repository">
  </a>
  <a href="https://github.com/ahmeteyibil/e-commerce-electronic/blob/main/LICENSE.md" target="_blank">
    <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License">
  </a>
</p>

<p align="center">
  <b>Karmaşık e-ticaret arayüzlerinden uzak, sade ve kolay bir alışveriş deneyimi.</b>
</p>

<br>

## 📝 Proje Hakkında

**Simmar**, kullanıcıların ve satıcıların buluştuğu, minimal ve kullanıcı dostu bir e-ticaret pazaryeri platformudur. 
Amacı, kalabalık ve karmaşık e-ticaret sitelerinin aksine, alışverişin temel ihtiyaçlarına odaklanarak
**sade, hızlı ve keyifli** bir deneyim sunmaktır.

### ✨ Öne Çıkan Özellikler

- 👤 **Kullanıcı Yönetimi:** Güvenli kayıt, giriş ve oturum yönetimi.
- 🛒 **Alışveriş Sepeti:** Kullanıcıya özel sepet yönetimi, ürün ekleme/çıkarma.
- 🏪 **Satıcı Paneli:** Satıcıların ürünlerini listelemesi, yönetmesi ve siparişleri takip etmesi.
- 📦 **Ürün Listeleme:** Kategorilere göre filtrelenmiş, dinamik ürün listeleme.
- 🔐 **Güvenlik:** Şifre hashleme (bcrypt), güvenli cookie yönetimi.
- 🎨 **Modern Arayüz:** Kullanıcı dostu, responsive (mobil uyumlu) tasarım.

### 🛠️ Kullanılan Teknolojiler

**Backend:**
- [Node.js](https://nodejs.org/) - JavaScript çalışma ortamı
- [Express.js](https://expressjs.com/) - Web framework
- [EJS](https://ejs.co/) - Template engine
- [PostgreSQL](https://www.postgresql.org/) - Veritabanı (Neon.tech)

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

**Hosting & Infrastructure:**
- [Vercel](https://vercel.com/) - Frontend ve Serverless Functions
- [Neon.tech](https://neon.tech/) - Serverless PostgreSQL

**Diğer:**
- [bcrypt](https://www.npmjs.com/package/bcrypt) - Şifre hashleme
- [express-session](https://www.npmjs.com/package/express-session) - Oturum yönetimi

<br>

## 🚀 Canlı Demo

Projenin canlı versiyonuna aşağıdaki linkten erişebilirsiniz:

🔗 **Live Demo:** [Simmar.vercel.app](https://e-commerce-electronic.vercel.app) 

*Demo kullanıcı bilgileri:* (İstersen ekle)
- Email: `demo@user.com`
- Şifre: `demouser`

<br>

## 📦 Kurulum (Local Geliştirme)

Projeyi local bilgisayarında çalıştırmak için:

```bash
# 1. Repoyu klonla
git clone https://github.com/ahmeteyibil/e-commerce-electronic.git
cd e-commerce-electronic

# 2. Bağımlılıkları yükle
npm install

# 3. Ortam değişkenlerini ayarla (.env dosyası oluştur)
# .env.example dosyasını .env olarak kopyala ve değişkenleri doldur
cp .env.example .env

# 4. Veritabanını hazırla (SQL dosyalarını çalıştır)
# Neon veya local PostgreSQL kullanabilirsin

# 5. Uygulamayı çalıştır
npm start