import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi | Randevum",
  description: "Randevum mesafeli satış sözleşmesi ve tüketici hakları.",
};

export default function DistanceSalesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0A0A] via-[#131010] to-[#1C1411] py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#1C1411]/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-[#2a1f1a] shadow-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Mesafeli Satış Sözleşmesi
          </h1>
          <p className="text-slate-400 mb-8">
            Son güncelleme: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Taraflar</h2>
              <div className="bg-[#0B0A0A] rounded-lg p-4 border border-[#2a1f1a] mb-4">
                <p className="text-slate-300 mb-2">
                  <strong className="text-white">SATICI:</strong>
                </p>
                <p className="text-slate-300">Randevum</p>
                <p className="text-slate-300">Web: www.onlinerandevum.com</p>
                <p className="text-slate-300">E-posta: randevum.iletisim@gmail.com</p>
                <p className="text-slate-300">Telefon: 0539 240 11 11</p>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Bu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Satış Sözleşmeleri 
                Yönetmeliği hükümlerine tabidir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Konu</h2>
              <p className="text-slate-300 leading-relaxed">
                Bu sözleşmenin konusu, SATICI'nın sahip olduğu www.onlinerandevum.com web sitesi üzerinden 
                sunulan dijital randevu yönetim hizmeti (işletme sahibi abonelik hizmeti) ve platform 
                kullanım hizmetlerinin satışı ve teslimi ile ilgili tarafların hak ve yükümlülüklerinin 
                belirlenmesidir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Sözleşmenin Kurulması</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Sözleşme, TÜKETİCİ'nin web sitesinde yer alan ürün/hizmeti seçerek ödeme adımlarını 
                tamamlaması ve ödemenin onaylanması ile kurulur. Sözleşme, TÜKETİCİ'nin elektronik 
                ortamda "Siparişi Onayla" butonuna tıklaması ile kurulmuş sayılır.
              </p>
              <p className="text-slate-300 leading-relaxed">
                SATICI, sözleşmenin kurulmasından sonra sözleşme özetini ve faturayı e-posta adresine gönderir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Hizmetin Özellikleri ve Fiyatı</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Satışa konu hizmetin özellikleri, fiyatı ve ödeme bilgileri web sitesinde açıkça 
                belirtilmiştir. Fiyatlar, KDV dahil olarak gösterilir. SATICI, önceden haber vermeksizin 
                fiyat değişikliği yapabilir, ancak sipariş verilmiş hizmetler için değişiklik yapılamaz.
              </p>
              <p className="text-slate-300 leading-relaxed">
                Hizmet fiyatları, web sitesinde belirtilen fiyatlardır. Ödeme, iyzico ödeme altyapısı 
                üzerinden güvenli şekilde yapılır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Ödeme</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Ödeme, iyzico ödeme altyapısı üzerinden aşağıdaki yöntemlerle yapılabilir:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Kredi kartı (Visa, MasterCard)</li>
                <li>Banka kartı</li>
                <li>iyzico ile Öde</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                Ödeme işlemi, SSL sertifikası ile korunan güvenli ödeme sayfasında gerçekleştirilir. 
                Kart bilgileri SATICI tarafından saklanmaz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Teslimat</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Dijital hizmetler, ödeme onayından sonra anında aktif hale gelir. Hizmet aktivasyonu 
                e-posta ile bildirilir.
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Ödeme onayından sonra hesap anında aktif edilir</li>
                <li>Aktivasyon bilgisi e-posta ile gönderilir</li>
                <li>Hizmet, abonelik süresi boyunca kesintisiz sağlanır</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Cayma Hakkı</h2>
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.1. Cayma Hakkının Kullanımı</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                TÜKETİCİ, sözleşmeden, sözleşmenin kurulduğu tarihten itibaren 14 (on dört) gün içinde, 
                hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin cayma hakkını kullanabilir.
              </p>
              <p className="text-slate-300 leading-relaxed mb-4">
                Cayma hakkını kullanmak için, aşağıdaki bilgileri içeren bir bildirim yapılmalıdır:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Ad, soyad</li>
                <li>E-posta adresi</li>
                <li>Telefon numarası</li>
                <li>Cayma talebinin nedeni (opsiyonel)</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.2. Cayma Hakkının Kullanılamayacağı Durumlar</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Aşağıdaki durumlarda cayma hakkı kullanılamaz:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Hizmetin tamamen kullanılmış olması</li>
                <li>14 günlük sürenin geçmiş olması</li>
                <li>TÜKETİCİ'nin onayı ile hizmetin anında ifa edilmesi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. İade</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Cayma hakkı kullanıldığında, SATICI, ödemeyi aldığı tarihten itibaren 14 (on dört) gün 
                içinde TÜKETİCİ'ye iade eder. İade, TÜKETİCİ'nin ödeme yaptığı yönteme göre yapılır.
              </p>
              <p className="text-slate-300 leading-relaxed">
                İade işlemi, iyzico ödeme altyapısı üzerinden gerçekleştirilir ve 3-10 iş günü içinde 
                hesaba yansır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">9. Şikayet ve İtiraz Hakkı</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                TÜKETİCİ, şikayet ve itirazlarını aşağıdaki yollarla iletebilir:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>E-posta: randevum.iletisim@gmail.com</li>
                <li>Telefon: 0539 240 11 11</li>
                <li>Web: www.onlinerandevum.com</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                TÜKETİCİ, ayrıca Tüketici Hakem Heyetlerine veya Tüketici Mahkemelerine başvurabilir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">10. Kişisel Verilerin Korunması</h2>
              <p className="text-slate-300 leading-relaxed">
                Kişisel verilerin korunması hakkında detaylı bilgi için{" "}
                <Link href="/privacy" className="text-[#c49a6c] hover:text-[#d4b896] underline">
                  Gizlilik Politikası
                </Link>{" "}
                sayfasını inceleyebilirsiniz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">11. Uygulanabilir Hukuk ve Yetkili Mahkeme</h2>
              <p className="text-slate-300 leading-relaxed">
                Bu sözleşme, Türkiye Cumhuriyeti yasalarına tabidir. Bu sözleşmeden kaynaklanan 
                uyuşmazlıkların çözümünde İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">12. İletişim</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Sözleşme hakkında sorularınız için:
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

