import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hakkımızda | Randevum",
  description: "Randevum hakkında bilgiler, misyonumuz ve vizyonumuz.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0A0A] via-[#131010] to-[#1C1411] py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#1C1411]/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-[#2a1f1a] shadow-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Hakkımızda
          </h1>
          <p className="text-slate-400 mb-8">
            Randevum - Randevu Yönetim Platformu
          </p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">Biz Kimiz?</h2>
              <p className="text-slate-300 leading-relaxed">
                Randevum, randevu sistemi ile çalışan işletmeler ve müşterileri arasında köprü kuran, 
                modern ve kullanıcı dostu bir randevu yönetim platformudur. 2024 yılında kurulan 
                Randevum, Türkiye'deki tüm randevu tabanlı işletmelerin dijital dönüşümüne katkı 
                sağlamayı hedeflemektedir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">Misyonumuz</h2>
              <p className="text-slate-300 leading-relaxed">
                Randevum olarak misyonumuz, işletmelerin randevu yönetim süreçlerini dijitalleştirerek 
                hem işletmelere hem de müşterilere zaman kazandırmak, randevu süreçlerini kolaylaştırmak 
                ve müşteri memnuniyetini artırmaktır. Teknolojiyi kullanarak, randevu alma ve yönetme 
                deneyimini en üst seviyeye çıkarmayı hedefliyoruz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">Vizyonumuz</h2>
              <p className="text-slate-300 leading-relaxed">
                Türkiye'nin en güvenilir ve kullanıcı dostu randevu yönetim platformu olmak. 
                Tüm randevu tabanlı işletmelerin (berber, kuaför, güzellik salonu, pilates, terapi, 
                veteriner, diş hekimi, doktor vb.) dijital dönüşümüne öncülük etmek ve müşterilere 
                en iyi randevu deneyimini sunmak.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">Hizmetlerimiz</h2>
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">İşletmeler İçin</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Online randevu yönetim sistemi</li>
                <li>Müşteri veritabanı yönetimi</li>
                <li>Randevu takvimi ve planlama</li>
                <li>Gelir ve müşteri analizi</li>
                <li>Müşteri yorumları ve puanlama sistemi</li>
                <li>Mobil uygulama desteği</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">Müşteriler İçin</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Kolay randevu alma</li>
                <li>Randevu takibi ve hatırlatmalar</li>
                <li>Yakındaki işletmeleri keşfetme</li>
                <li>Favori işletmeleri kaydetme</li>
                <li>İşletme yorumları ve puanları görüntüleme</li>
                <li>Randevu geçmişi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">Değerlerimiz</h2>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li><strong className="text-white">Güvenilirlik:</strong> Kullanıcı verilerinin güvenliği bizim önceliğimizdir</li>
                <li><strong className="text-white">Kullanıcı Odaklılık:</strong> Kullanıcı deneyimini sürekli iyileştiriyoruz</li>
                <li><strong className="text-white">İnovasyon:</strong> Teknolojinin gücünü kullanarak yenilikçi çözümler sunuyoruz</li>
                <li><strong className="text-white">Şeffaflık:</strong> Tüm işlemlerimizde şeffaf ve dürüst olmayı hedefliyoruz</li>
                <li><strong className="text-white">Müşteri Memnuniyeti:</strong> Müşterilerimizin memnuniyeti bizim başarımızdır</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">Teknoloji</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Randevum, modern web teknolojileri ve mobil uygulama geliştirme araçları kullanılarak 
                geliştirilmiştir. Platformumuz:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>SSL sertifikası ile güvenli bağlantı sağlar</li>
                <li>Firebase altyapısı ile yüksek performans sunar</li>
                <li>Mobil uygulama ile her yerden erişilebilir</li>
                <li>7/24 kesintisiz hizmet verir</li>
                <li>KVKK uyumlu veri koruma sağlar</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">İletişim</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Bizimle iletişime geçmek için:
              </p>
              <div className="bg-[#0B0A0A] rounded-lg p-4 border border-[#2a1f1a]">
                <p className="text-slate-300">
                  <strong className="text-white">E-posta:</strong> randevum.iletisim@gmail.com
                </p>
                <p className="text-slate-300 mt-2">
                  <strong className="text-white">Telefon:</strong> 0539 240 11 11
                </p>
                <p className="text-slate-300 mt-2">
                  <strong className="text-white">Çalışma Saatleri:</strong> 7/24 ulaşılabilir
                </p>
                <p className="text-slate-300 mt-2">
                  <strong className="text-white">Web:</strong>{" "}
                  <Link href="/" className="text-[#c49a6c] hover:text-[#d4b896] underline">
                    www.onlinerandevum.com
                  </Link>
                </p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-[#2a1f1a]">
            <Link
              href="/"
              className="inline-flex items-center text-[#c49a6c] hover:text-[#d4b896] transition-colors"
            >
              ← Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

