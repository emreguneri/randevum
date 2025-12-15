import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | Randevum",
  description: "Randevum gizlilik politikası ve veri koruma bilgileri.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0A0A] via-[#131010] to-[#1C1411] py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#1C1411]/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-[#2a1f1a] shadow-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Gizlilik Politikası
          </h1>
          <p className="text-slate-400 mb-8">
            Son güncelleme: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Genel Bilgiler</h2>
              <p className="text-slate-300 leading-relaxed">
                Randevum olarak, kullanıcılarımızın gizliliğini korumak bizim için önemlidir. 
                Bu Gizlilik Politikası, Randevum uygulaması ve web sitesi aracılığıyla topladığımız 
                kişisel bilgilerin nasıl toplandığını, kullanıldığını, saklandığını ve korunduğunu açıklar.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Toplanan Bilgiler</h2>
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.1. Kullanıcı Bilgileri</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Uygulamayı kullanırken aşağıdaki bilgileri topluyoruz:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Ad, soyad</li>
                <li>E-posta adresi</li>
                <li>Telefon numarası</li>
                <li>Profil fotoğrafı (opsiyonel)</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.2. Randevu Bilgileri</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Randevu oluştururken aşağıdaki bilgileri kaydediyoruz:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Randevu tarihi ve saati</li>
                <li>Seçilen hizmet</li>
                <li>İşletme bilgileri</li>
                <li>Randevu notları</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.3. Konum Bilgileri</h3>
              <p className="text-slate-300 leading-relaxed">
                Size yakın işletmeleri göstermek için konum bilgilerinizi kullanıyoruz. 
                Bu bilgiler yalnızca siz izin verdiğinizde toplanır ve kullanılır.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.4. Teknik Bilgiler</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Uygulamanın düzgün çalışması için aşağıdaki teknik bilgileri topluyoruz:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Cihaz bilgileri (model, işletim sistemi)</li>
                <li>IP adresi</li>
                <li>Kullanım istatistikleri</li>
                <li>Hata logları</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Bilgilerin Kullanımı</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Topladığımız bilgileri aşağıdaki amaçlarla kullanıyoruz:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Randevu yönetimi ve takibi</li>
                <li>Kullanıcı hesabı yönetimi</li>
                <li>Müşteri hizmetleri desteği</li>
                <li>Uygulama geliştirme ve iyileştirme</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                <li>Güvenlik ve dolandırıcılık önleme</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Bilgilerin Paylaşımı</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Kişisel bilgilerinizi aşağıdaki durumlar dışında üçüncü taraflarla paylaşmıyoruz:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Randevu aldığınız işletmeler (randevu bilgileri)</li>
                <li>Yasal yükümlülükler (mahkeme kararı, yasal süreçler)</li>
                <li>Hizmet sağlayıcılarımız (Firebase, Google Maps - sadece gerekli bilgiler)</li>
                <li>Kullanıcının açık rızası ile</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Veri Güvenliği</h2>
              <p className="text-slate-300 leading-relaxed">
                Kişisel bilgilerinizin güvenliğini sağlamak için endüstri standardı güvenlik önlemleri alıyoruz:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4 mt-4">
                <li>SSL/TLS şifreleme</li>
                <li>Güvenli veritabanı depolama (Firebase)</li>
                <li>Düzenli güvenlik güncellemeleri</li>
                <li>Erişim kontrolü ve yetkilendirme</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Çerezler (Cookies)</h2>
              <p className="text-slate-300 leading-relaxed">
                Web sitemizde kullanıcı deneyimini iyileştirmek için çerezler kullanıyoruz. 
                Çerezler, web sitesi tercihlerinizi hatırlamak ve analitik veriler toplamak için kullanılır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Kullanıcı Hakları</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                KVKK kapsamında aşağıdaki haklara sahipsiniz:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>İşlenen verileriniz hakkında bilgi talep etme</li>
                <li>Verilerinizin silinmesini veya düzeltilmesini talep etme</li>
                <li>Verilerinizin üçüncü taraflara aktarılmasına itiraz etme</li>
                <li>Verilerinizin eksik veya yanlış işlenmesi durumunda düzeltme talep etme</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Veri Saklama Süresi</h2>
              <p className="text-slate-300 leading-relaxed">
                Kişisel verileriniz, hesabınız aktif olduğu sürece saklanır. Hesabınızı sildiğinizde, 
                yasal saklama yükümlülükleri dışında tüm verileriniz 30 gün içinde kalıcı olarak silinir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">9. Çocukların Gizliliği</h2>
              <p className="text-slate-300 leading-relaxed">
                Uygulamamız 13 yaş altındaki çocuklardan bilerek veri toplamaz. 
                13 yaş altındaki bir çocuğun kişisel bilgilerini topladığımızı fark edersek, 
                bu bilgileri derhal sileriz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">10. Politika Değişiklikleri</h2>
              <p className="text-slate-300 leading-relaxed">
                Bu Gizlilik Politikası zaman zaman güncellenebilir. Önemli değişiklikler yapıldığında, 
                kullanıcılarımızı e-posta veya uygulama içi bildirim ile bilgilendiririz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">11. İletişim</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Gizlilik politikamız hakkında sorularınız veya verilerinizle ilgili talepleriniz için bizimle iletişime geçebilirsiniz:
              </p>
              <div className="bg-[#0B0A0A] rounded-lg p-4 border border-[#2a1f1a]">
                <p className="text-slate-300">
                  <strong className="text-white">E-posta:</strong> randevum.iletisim@gmail.com
                </p>
                <p className="text-slate-300 mt-2">
                  <strong className="text-white">Telefon:</strong> 0539 240 11 11
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

