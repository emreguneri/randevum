import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kullanım Koşulları | Randevum",
  description: "Randevum kullanım koşulları ve hizmet şartları.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0A0A] via-[#131010] to-[#1C1411] py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#1C1411]/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-[#2a1f1a] shadow-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Kullanım Koşulları
          </h1>
          <p className="text-slate-400 mb-8">
            Son güncelleme: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Genel Hükümler</h2>
              <p className="text-slate-300 leading-relaxed">
                Bu Kullanım Koşulları, Randevum uygulaması ve web sitesi ("Hizmet") kullanımınızı düzenler. 
                Hizmeti kullanarak, bu koşulları kabul etmiş sayılırsınız. Eğer bu koşulları kabul etmiyorsanız, 
                lütfen hizmeti kullanmayın.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Hizmet Tanımı</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Randevum, randevu sistemi ile çalışan işletmeler (berber, kuaför, güzellik salonu, 
                pilates, terapi merkezleri vb.) ve müşterileri arasında randevu yönetimi sağlayan bir platformdur.
              </p>
              <p className="text-slate-300 leading-relaxed">
                Platform aşağıdaki hizmetleri sunar:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4 mt-4">
                <li>Online randevu alma ve yönetimi</li>
                <li>İşletme bilgileri ve hizmet kataloğu</li>
                <li>Randevu takibi ve hatırlatmaları</li>
                <li>İşletme yönetim paneli</li>
                <li>Müşteri-işletme iletişimi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Kullanıcı Hesapları</h2>
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.1. Hesap Oluşturma</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Hizmeti kullanmak için bir hesap oluşturmanız gerekebilir. Hesap oluştururken:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Doğru, güncel ve eksiksiz bilgiler sağlamalısınız</li>
                <li>Hesap bilgilerinizi güvende tutmalısınız</li>
                <li>Hesabınızın tüm faaliyetlerinden sorumlusunuz</li>
                <li>Hesabınızın yetkisiz kullanımını derhal bildirmelisiniz</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.2. Hesap Türleri</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Platform iki tür kullanıcı hesabı destekler:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li><strong className="text-white">Müşteri Hesabı:</strong> Randevu almak için kullanılır</li>
                <li><strong className="text-white">İşletme Sahibi Hesabı:</strong> Randevu yönetimi ve işletme bilgileri için kullanılır</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Kullanıcı Yükümlülükleri</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Hizmeti kullanırken aşağıdaki kurallara uymalısınız:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Yasalara ve düzenlemelere uygun davranmalısınız</li>
                <li>Başkalarının haklarını ihlal etmemelisiniz</li>
                <li>Yanıltıcı, yanlış veya zararlı içerik paylaşmamalısınız</li>
                <li>Spam, phishing veya zararlı yazılım göndermemelisiniz</li>
                <li>Platformun güvenliğini veya işleyişini bozmaya çalışmamalısınız</li>
                <li>Başkalarının kişisel bilgilerini izinsiz kullanmamalısınız</li>
                <li>Telif hakkı, marka veya diğer fikri mülkiyet haklarını ihlal etmemelisiniz</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. İşletme Sahipleri İçin Özel Koşullar</h2>
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.1. Abonelik ve Ödeme</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                İşletme sahipleri, platformu kullanmak için aylık veya yıllık abonelik ücreti ödemekle yükümlüdür. 
                Abonelik detayları ve fiyatlandırma platform üzerinden bildirilir.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.2. İşletme Bilgileri</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                İşletme sahipleri aşağıdaki yükümlülüklere sahiptir:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Doğru ve güncel işletme bilgileri sağlamak</li>
                <li>Hizmet fiyatlarını ve sürelerini doğru belirtmek</li>
                <li>Randevuları zamanında ve profesyonelce yönetmek</li>
                <li>Müşteri verilerini gizli tutmak</li>
                <li>Yasal yükümlülüklerini yerine getirmek</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.3. İptal ve İade</h3>
              <p className="text-slate-300 leading-relaxed">
                Abonelik iptalleri ve iadeler, iyzico ödeme koşullarına tabidir. 
                İptal talepleri platform üzerinden veya destek ekibi ile iletişime geçilerek yapılabilir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Randevu Yönetimi</h2>
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.1. Randevu Alma</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Müşteriler, platform üzerinden randevu alabilir. Randevu alırken:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Doğru iletişim bilgileri sağlamalısınız</li>
                <li>Randevu saatine zamanında gelmelisiniz</li>
                <li>İptal durumunda en az 24 saat önceden bildirmelisiniz</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.2. Randevu İptali</h3>
              <p className="text-slate-300 leading-relaxed">
                Randevular, işletme sahibi tarafından yönetilir. Müşteriler randevularını iptal edebilir, 
                ancak değişiklik yapmak için işletme sahibi ile iletişime geçmelidir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Fikri Mülkiyet Hakları</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Platform ve içeriği (logo, tasarım, yazılım, metinler vb.) Randevum'a aittir ve 
                telif hakkı ve diğer fikri mülkiyet yasaları ile korunmaktadır.
              </p>
              <p className="text-slate-300 leading-relaxed">
                Kullanıcılar, platform içeriğini izinsiz kopyalayamaz, dağıtamaz, değiştiremez veya 
                ticari amaçlarla kullanamaz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Hizmet Kesintileri ve Değişiklikler</h2>
              <p className="text-slate-300 leading-relaxed">
                Randevum, hizmeti herhangi bir zamanda, önceden bildirimde bulunmaksızın değiştirme, 
                askıya alma veya sonlandırma hakkını saklı tutar. Teknik bakım, güvenlik güncellemeleri 
                veya diğer nedenlerle hizmet kesintileri yaşanabilir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">9. Sorumluluk Reddi</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Randevum, platform üzerinden sağlanan hizmetlerin kesintisiz, hatasız veya güvenli 
                olacağını garanti etmez. Platform "olduğu gibi" sağlanır.
              </p>
              <p className="text-slate-300 leading-relaxed mb-4">
                Randevum aşağıdaki durumlardan sorumlu değildir:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>İşletmeler ve müşteriler arasındaki anlaşmazlıklar</li>
                <li>Randevu hizmetlerinin kalitesi veya sonuçları</li>
                <li>Üçüncü taraf hizmetlerin (Google Maps, Firebase vb.) kesintileri</li>
                <li>Kullanıcı hatasından kaynaklanan veri kayıpları</li>
                <li>Dolaylı, özel, tesadüfi veya sonuçsal zararlar</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">10. Tazminat</h2>
              <p className="text-slate-300 leading-relaxed">
                Bu koşulları ihlal etmeniz durumunda, Randevum ve ilgili tarafların uğradığı zararlardan 
                (davalar, avukat ücretleri, tazminatlar vb.) sorumlu olursunuz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">11. Hesap Askıya Alma ve Sonlandırma</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Randevum, aşağıdaki durumlarda hesabınızı askıya alabilir veya sonlandırabilir:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Bu kullanım koşullarını ihlal etmeniz</li>
                <li>Yasalara aykırı davranışlarda bulunmanız</li>
                <li>Platformun güvenliğini veya işleyişini bozmanız</li>
                <li>Uzun süreli inaktivite</li>
                <li>Abonelik ücretlerinin ödenmemesi (işletme sahipleri için)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">12. Uygulanabilir Hukuk</h2>
              <p className="text-slate-300 leading-relaxed">
                Bu Kullanım Koşulları, Türkiye Cumhuriyeti yasalarına tabidir. 
                Bu koşullardan kaynaklanan uyuşmazlıklar, Türkiye mahkemelerinde çözülecektir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">13. Değişiklikler</h2>
              <p className="text-slate-300 leading-relaxed">
                Randevum, bu Kullanım Koşullarını herhangi bir zamanda güncelleyebilir. 
                Önemli değişiklikler yapıldığında, kullanıcılar e-posta veya uygulama içi bildirim ile bilgilendirilir. 
                Değişikliklerden sonra hizmeti kullanmaya devam etmeniz, güncellenmiş koşulları kabul ettiğiniz anlamına gelir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">14. İletişim</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Kullanım koşulları hakkında sorularınız için bizimle iletişime geçebilirsiniz:
              </p>
              <div className="bg-[#0B0A0A] rounded-lg p-4 border border-[#2a1f1a]">
                <p className="text-slate-300">
                  <strong className="text-white">E-posta:</strong> support@onlinerandevum.com
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

