import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Teslimat ve İade Şartları | Randevum",
  description: "Randevum teslimat ve iade şartları.",
};

export default function DeliveryReturnPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0A0A] via-[#131010] to-[#1C1411] py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#1C1411]/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-[#2a1f1a] shadow-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Teslimat ve İade Şartları
          </h1>
          <p className="text-slate-400 mb-8">
            Son güncelleme: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Genel Hükümler</h2>
              <p className="text-slate-300 leading-relaxed">
                Randevum, dijital bir randevu yönetim platformudur ve fiziksel ürün teslimatı yapmamaktadır. 
                Platform üzerinden satın alınan hizmetler (işletme sahibi abonelikleri) dijital hizmetlerdir 
                ve anında aktif hale gelir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Hizmet Teslimatı</h2>
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.1. Abonelik Hizmetleri</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                İşletme sahibi abonelikleri, ödeme onaylandıktan sonra anında aktif hale gelir. 
                Abonelik süresi boyunca platformun tüm özelliklerine erişim sağlanır.
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Ödeme onayından sonra hesap anında aktif edilir</li>
                <li>E-posta ile aktivasyon bilgisi gönderilir</li>
                <li>Abonelik süresi boyunca kesintisiz hizmet sağlanır</li>
                <li>Teknik destek 7/24 ulaşılabilir</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.2. Randevu Hizmetleri</h3>
              <p className="text-slate-300 leading-relaxed">
                Platform üzerinden alınan randevular, işletme tarafından sağlanan fiziksel hizmetlerdir. 
                Randevu onayı, işletme tarafından yapılır ve müşteriye bildirilir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. İade ve İptal Koşulları</h2>
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.1. Abonelik İptali</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                İşletme sahibi abonelikleri için iptal ve iade koşulları:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Abonelik iptali, abonelik süresi bitmeden önce yapılabilir</li>
                <li>İptal edilen abonelikler, mevcut dönem sonuna kadar geçerlidir</li>
                <li>Kullanılan süre için iade yapılmaz</li>
                <li>Yeni abonelik dönemi başlamadan önce iptal edilirse, yeni dönem için ücret alınmaz</li>
                <li>İptal talepleri platform üzerinden veya e-posta ile yapılabilir</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.2. Randevu İptali</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Randevu iptalleri işletme politikalarına tabidir:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Müşteriler randevularını platform üzerinden iptal edebilir</li>
                <li>İptal koşulları işletme tarafından belirlenir</li>
                <li>Geç iptaller için işletme politikası geçerlidir</li>
                <li>Randevu iptalleri için ücret iadesi yapılmaz (işletme politikasına göre)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Ödeme İadeleri</h2>
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.1. İade Süreci</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Ödeme iadeleri, iyzico ödeme altyapısı üzerinden gerçekleştirilir:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>İade talepleri 7 iş günü içinde değerlendirilir</li>
                <li>Onaylanan iadeler, ödeme yöntemine göre 3-10 iş günü içinde hesaba yansır</li>
                <li>Kredi kartı iadeleri, kartınıza geri yüklenir</li>
                <li>Banka havalesi iadeleri, belirtilen hesaba yapılır</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.2. İade Edilemeyen Durumlar</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Aşağıdaki durumlarda iade yapılamaz:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Abonelik süresi tamamen kullanılmışsa</li>
                <li>Platform kullanım koşulları ihlal edilmişse</li>
                <li>Yasal süre (14 gün) geçmişse</li>
                <li>Teknik destek talepleri karşılanmışsa</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Mesafeli Satış Sözleşmesi</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Randevum, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Satış Sözleşmeleri 
                Yönetmeliği kapsamında hizmet sunmaktadır. Detaylı bilgi için{" "}
                <Link href="/distance-sales" className="text-[#c49a6c] hover:text-[#d4b896] underline">
                  Mesafeli Satış Sözleşmesi
                </Link>{" "}
                sayfasını inceleyebilirsiniz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. İletişim ve Destek</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                İade ve iptal talepleriniz için bizimle iletişime geçebilirsiniz:
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

