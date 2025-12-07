import { AnimatedTabScreen } from '@/components/animated-tab-screen';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { db } from '@/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { router, useFocusEffect } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Dimensions, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const { width } = Dimensions.get('window');

const GOOGLE_MAPS_API_KEY = 'AIzaSyCEtk1HSycs-zPTNAQxrkLqBBw45tERfCQ';

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const ALLOWED_CITY = 'Balıkesir';
const ALLOWED_DISTRICTS = ['Karesi'];
const ALLOWED_CITY_NORMALIZED = normalizeText(ALLOWED_CITY);
const ALLOWED_DISTRICTS_NORMALIZED = ALLOWED_DISTRICTS.map((d) => normalizeText(d));

// Kategori mapping - Google Places API için
const CATEGORY_MAPPING: { [key: string]: { query: string; type: string } } = {
  'Berber': {
    query: 'berber',
    type: 'hair_care'
  },
  'Kuaför': {
    query: 'kuaför',
    type: 'beauty_salon'
  },
  'Güzellik Salonu': {
    query: 'güzellik salonu',
    type: 'beauty_salon'
  },
  'Pilates': {
    query: 'pilates',
    type: 'gym'
  },
  'Spor Salonu': {
    query: 'spor salonu',
    type: 'gym'
  },
  'Masaj': {
    query: 'masaj',
    type: 'spa'
  },
  'Estetik': {
    query: 'estetik',
    type: 'beauty_salon'
  },
  'Cilt Bakımı': {
    query: 'cilt bakımı',
    type: 'beauty_salon'
  }
};

// Kullanılabilir kategoriler
const AVAILABLE_CATEGORIES = Object.keys(CATEGORY_MAPPING);

const isAllowedCity = (city?: string) =>
  !!city && normalizeText(city) === normalizeText(ALLOWED_CITY);

const isAllowedDistrict = (district?: string) =>
  !!district && ALLOWED_DISTRICTS.some((allowed) => normalizeText(allowed) === normalizeText(district));

const isShopInAllowedArea = (shop: Shop) => {
  if (!shop.placeId) {
    return true;
  }

  if (!shop.address) {
    return false;
  }

  const normalizedAddress = normalizeText(shop.address);
  const matchesCity = normalizedAddress.includes(ALLOWED_CITY_NORMALIZED);
  const matchesDistrict = ALLOWED_DISTRICTS_NORMALIZED.some((district) =>
    normalizedAddress.includes(district)
  );

  return matchesCity && matchesDistrict;
};

// Türkiye şehir ve ilçeleri
const TURKEY_CITIES_AND_DISTRICTS: { [key: string]: string[] } = {
  'Adana': ['Seyhan', 'Çukurova', 'Yüreğir', 'Sarıçam', 'Karaisalı', 'Aladağ', 'Ceyhan', 'Feke', 'İmamoğlu', 'Karataş', 'Kozan', 'Pozantı', 'Saimbeyli', 'Tufanbeyli', 'Yumurtalık'],
  'Adıyaman': ['Merkez', 'Besni', 'Çelikhan', 'Gerger', 'Gölbaşı', 'Kahta', 'Samsat', 'Sincik', 'Tut'],
  'Afyonkarahisar': ['Merkez', 'Başmakçı', 'Bayat', 'Bolvadin', 'Çay', 'Çobanlar', 'Dazkırı', 'Dinar', 'Emirdağ', 'Evciler', 'Hocalar', 'İhsaniye', 'İscehisar', 'Kızılören', 'Sandıklı', 'Sinanpaşa', 'Sultandağı', 'Şuhut'],
  'Ağrı': ['Merkez', 'Diyadin', 'Doğubayazıt', 'Eleşkirt', 'Hamur', 'Patnos', 'Taşlıçay', 'Tutak'],
  'Amasya': ['Merkez', 'Göynücek', 'Gümüşhacıköy', 'Hamamözü', 'Merzifon', 'Suluova', 'Taşova'],
  'Ankara': ['Altındağ', 'Ayaş', 'Bala', 'Beypazarı', 'Çamlıdere', 'Çankaya', 'Çubuk', 'Elmadağ', 'Güdül', 'Haymana', 'Kalecik', 'Kızılcahamam', 'Nallıhan', 'Polatlı', 'Şereflikoçhisar', 'Yenimahalle', 'Gölbaşı', 'Keçiören', 'Mamak', 'Sincan', 'Etimesgut', 'Pursaklar', 'Kazan', 'Akyurt', 'Akyurt'],
  'Antalya': ['Muratpaşa', 'Konyaaltı', 'Kepez', 'Döşemealtı', 'Aksu', 'Alanya', 'Demre', 'Elmalı', 'Finike', 'Gazipaşa', 'Gündoğmuş', 'İbradı', 'Kaş', 'Kemer', 'Korkuteli', 'Kumluca', 'Manavgat', 'Serik'],
  'Balıkesir': ['Altıeylül', 'Karesi', 'Ayvalık', 'Balya', 'Bandırma', 'Bigadiç', 'Burhaniye', 'Dursunbey', 'Edremit', 'Erdek', 'Gömeç', 'Gönen', 'Havran', 'İvrindi', 'Kepsut', 'Manyas', 'Marmara', 'Savaştepe', 'Sındırgı', 'Susurluk'],
  'Bilecik': ['Merkez', 'Bozüyük', 'Gölpazarı', 'İnhisar', 'Osmaneli', 'Pazaryeri', 'Söğüt', 'Yenipazar'],
  'Bingöl': ['Merkez', 'Adaklı', 'Genç', 'Karlıova', 'Kiğı', 'Solhan', 'Yayladere', 'Yedisu'],
  'Bitlis': ['Merkez', 'Adilcevaz', 'Ahlat', 'Güroymak', 'Hizan', 'Mutki', 'Tatvan'],
  'Bolu': ['Merkez', 'Dörtdivan', 'Gerede', 'Göynük', 'Kıbrıscık', 'Mengen', 'Mudurnu', 'Seben', 'Yeniçağa'],
  'Burdur': ['Merkez', 'Ağlasun', 'Altınyayla', 'Bucak', 'Çavdır', 'Çeltikçi', 'Gölhisar', 'Karamanlı', 'Kemer', 'Tefenni', 'Yeşilova'],
  'Bursa': ['Osmangazi', 'Nilüfer', 'Yıldırım', 'Mudanya', 'Gemlik', 'İnegöl', 'Mustafakemalpaşa', 'Orhangazi', 'Karacabey', 'M.Kemalpaşa', 'Gürsu', 'Kestel', 'Yenişehir', 'İznik', 'Orhaneli', 'Büyükorhan', 'Harmancık', 'Keles'],
  'Çanakkale': ['Merkez', 'Ayvacık', 'Bayramiç', 'Biga', 'Bozcaada', 'Çan', 'Eceabat', 'Ezine', 'Gelibolu', 'Gökçeada', 'Lapseki', 'Yenice'],
  'Çankırı': ['Merkez', 'Atkaracalar', 'Bayramören', 'Çerkeş', 'Eldivan', 'Ilgaz', 'Kızılırmak', 'Korgun', 'Kurşunlu', 'Orta', 'Şabanözü', 'Yapraklı'],
  'Çorum': ['Merkez', 'Alaca', 'Bayat', 'Boğazkale', 'Dodurga', 'İskilip', 'Kargı', 'Laçin', 'Mecitözü', 'Oğuzlar', 'Ortaköy', 'Osmancık', 'Sungurlu', 'Uğurludağ'],
  'Denizli': ['Merkez', 'Acıpayam', 'Babadağ', 'Baklan', 'Bekilli', 'Beyağaç', 'Bozkurt', 'Buldan', 'Çal', 'Çameli', 'Çardak', 'Çivril', 'Güney', 'Honaz', 'Kale', 'Sarayköy', 'Serinhisar', 'Tavas'],
  'Diyarbakır': ['Bağlar', 'Kayapınar', 'Sur', 'Yenişehir', 'Bismil', 'Çermik', 'Çınar', 'Çüngüş', 'Dicle', 'Eğil', 'Ergani', 'Hani', 'Hazro', 'Kocaköy', 'Kulp', 'Lice', 'Silvan'],
  'Edirne': ['Merkez', 'Enez', 'Havsa', 'İpsala', 'Keşan', 'Lalapaşa', 'Meriç', 'Süloğlu', 'Uzunköprü'],
  'Elazığ': ['Merkez', 'Ağın', 'Alacakaya', 'Arıcak', 'Baskil', 'Karakoçan', 'Keban', 'Kovancılar', 'Maden', 'Palu', 'Sivrice'],
  'Erzincan': ['Merkez', 'Çayırlı', 'İliç', 'Kemah', 'Kemaliye', 'Otlukbeli', 'Refahiye', 'Tercan', 'Üzümlü'],
  'Erzurum': ['Yakutiye', 'Palandöken', 'Aziziye', 'Aşkale', 'Çat', 'Hınıs', 'Horasan', 'İspir', 'Karaçoban', 'Karayazı', 'Köprüköy', 'Narman', 'Oltu', 'Olur', 'Pasinler', 'Şenkaya', 'Tekman', 'Tortum', 'Uzundere'],
  'Eskişehir': ['Odunpazarı', 'Tepebaşı', 'Alpu', 'Beylikova', 'Çifteler', 'Günyüzü', 'Han', 'İnönü', 'Mahmudiye', 'Mihalgazi', 'Mihalıççık', 'Sarıcakaya', 'Seyitgazi', 'Sivrihisar'],
  'Gaziantep': ['Şahinbey', 'Şehitkamil', 'Oğuzeli', 'Araban', 'İslahiye', 'Karkamış', 'Nizip', 'Nurdağı', 'Yavuzeli'],
  'Giresun': ['Merkez', 'Alucra', 'Bulancak', 'Çanakçı', 'Dereli', 'Doğankent', 'Espiye', 'Eynesil', 'Görele', 'Güce', 'Keşap', 'Piraziz', 'Şebinkarahisar', 'Tirebolu', 'Yağlıdere'],
  'Gümüşhane': ['Merkez', 'Kelkit', 'Köse', 'Kürtün', 'Şiran', 'Torul'],
  'Hakkari': ['Merkez', 'Çukurca', 'Şemdinli', 'Yüksekova'],
  'Hatay': ['Antakya', 'Altınözü', 'Arsuz', 'Belen', 'Defne', 'Dörtyol', 'Erzin', 'Hassa', 'İskenderun', 'Kırıkhan', 'Kumlu', 'Payas', 'Reyhanlı', 'Samandağ', 'Yayladağı'],
  'Iğdır': ['Merkez', 'Aralık', 'Karakoyunlu', 'Tuzluca'],
  'Isparta': ['Merkez', 'Aksu', 'Atabey', 'Eğirdir', 'Gelendost', 'Gönen', 'Keçiborlu', 'Senirkent', 'Sütçüler', 'Şarkikaraağaç', 'Uluborlu', 'Yalvaç', 'Yenişarbademli'],
  'İstanbul': ['Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar', 'Bahçelievler', 'Bakırköy', 'Başakşehir', 'Bayrampaşa', 'Beşiktaş', 'Beykoz', 'Beylikdüzü', 'Beyoğlu', 'Büyükçekmece', 'Çatalca', 'Çekmeköy', 'Esenler', 'Esenyurt', 'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kağıthane', 'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer', 'Silivri', 'Sultanbeyli', 'Sultangazi', 'Şile', 'Şişli', 'Tuzla', 'Ümraniye', 'Üsküdar', 'Zeytinburnu'],
  'İzmir': ['Aliağa', 'Bayındır', 'Bergama', 'Bornova', 'Çeşme', 'Çiğli', 'Dikili', 'Foça', 'Gaziemir', 'Güzelbahçe', 'Karabağlar', 'Karaburun', 'Karşıyaka', 'Kemalpaşa', 'Kınık', 'Kiraz', 'Konak', 'Menderes', 'Menemen', 'Narlıdere', 'Ödemiş', 'Seferihisar', 'Selçuk', 'Tire', 'Torbalı', 'Urla'],
  'Kahramanmaraş': ['Dulkadiroğlu', 'Onikişubat', 'Afşin', 'Andırın', 'Çağlayancerit', 'Ekinözü', 'Elbistan', 'Göksun', 'Nurhak', 'Pazarcık', 'Türkoğlu'],
  'Karabük': ['Merkez', 'Eflani', 'Eskipazar', 'Ovacık', 'Safranbolu', 'Yenice'],
  'Karaman': ['Merkez', 'Ayrancı', 'Başyayla', 'Ermenek', 'Kazımkarabekir', 'Sarıveliler'],
  'Kars': ['Merkez', 'Akyaka', 'Arpaçay', 'Digor', 'Kağızman', 'Sarıkamış', 'Selim', 'Susuz'],
  'Kastamonu': ['Merkez', 'Abana', 'Ağlı', 'Araç', 'Azdavay', 'Bozkurt', 'Cide', 'Çatalzeytin', 'Daday', 'Devrekani', 'Doğanyurt', 'Hanönü', 'İhsangazi', 'İnebolu', 'Küre', 'Pınarbaşı', 'Seydiler', 'Şenpazar', 'Taşköprü', 'Tosya'],
  'Kayseri': ['Kocasinan', 'Melikgazi', 'Talas', 'Akkışla', 'Bünyan', 'Develi', 'Felahiye', 'Hacılar', 'İncesu', 'Özvatan', 'Pınarbaşı', 'Sarıoğlan', 'Sarız', 'Tomarza', 'Yahyalı', 'Yeşilhisar'],
  'Kırıkkale': ['Merkez', 'Bahşılı', 'Balışeyh', 'Çelebi', 'Delice', 'Karakeçili', 'Keskin', 'Sulakyurt', 'Yahşihan'],
  'Kırklareli': ['Merkez', 'Babaeski', 'Demirköy', 'Kofçaz', 'Lüleburgaz', 'Pehlivanköy', 'Pınarhisar', 'Vize'],
  'Kırşehir': ['Merkez', 'Akçakent', 'Akpınar', 'Boztepe', 'Çiçekdağı', 'Kaman', 'Mucur'],
  'Kilis': ['Merkez', 'Elbeyli', 'Musabeyli', 'Polateli'],
  'Kocaeli': ['İzmit', 'Gebze', 'Gölcük', 'Kandıra', 'Karamürsel', 'Körfez', 'Derince', 'Başiskele', 'Çayırova', 'Dilovası', 'Kartepe', 'Kartepe'],
  'Konya': ['Meram', 'Karatay', 'Selçuklu', 'Akşehir', 'Beyşehir', 'Bozkır', 'Cihanbeyli', 'Çeltik', 'Çumra', 'Derbent', 'Derebucak', 'Doğanhisar', 'Emirgazi', 'Ereğli', 'Güneysinir', 'Hadim', 'Halkapınar', 'Hüyük', 'Ilgın', 'Kadınhanı', 'Karapınar', 'Kulu', 'Sarayönü', 'Seydişehir', 'Taşkent', 'Tuzlukçu', 'Yalıhüyük', 'Yunak'],
  'Kütahya': ['Merkez', 'Altıntaş', 'Aslanapa', 'Çavdarhisar', 'Domaniç', 'Dumlupınar', 'Emet', 'Gediz', 'Hisarcık', 'Pazarlar', 'Simav', 'Şaphane', 'Tavşanlı'],
  'Malatya': ['Battalgazi', 'Yeşilyurt', 'Akçadağ', 'Arapgir', 'Arguvan', 'Darende', 'Doğanşehir', 'Doğanyol', 'Hekimhan', 'Kale', 'Kuluncak', 'Pütürge', 'Yazıhan'],
  'Manisa': ['Yunusemre', 'Şehzadeler', 'Ahmetli', 'Akhisar', 'Alaşehir', 'Demirci', 'Gölmarmara', 'Gördes', 'Kırkağaç', 'Köprübaşı', 'Kula', 'Salihli', 'Sarıgöl', 'Saruhanlı', 'Selendi', 'Soma', 'Turgutlu'],
  'Mardin': ['Artuklu', 'Dargeçit', 'Derik', 'Kızıltepe', 'Mazıdağı', 'Midyat', 'Nusaybin', 'Ömerli', 'Savur', 'Yeşilli'],
  'Mersin': ['Akdeniz', 'Mezitli', 'Toroslar', 'Yenişehir', 'Anamur', 'Aydıncık', 'Bozyazı', 'Çamlıyayla', 'Erdemli', 'Gülnar', 'Mut', 'Silifke', 'Tarsus'],
  'Muğla': ['Bodrum', 'Dalaman', 'Datça', 'Fethiye', 'Kavaklıdere', 'Köyceğiz', 'Marmaris', 'Milas', 'Ortaca', 'Ula', 'Yatağan', 'Menteşe', 'Seydikemer'],
  'Muş': ['Merkez', 'Bulanık', 'Hasköy', 'Korkut', 'Malazgirt', 'Varto'],
  'Nevşehir': ['Merkez', 'Acıgöl', 'Avanos', 'Derinkuyu', 'Gülşehir', 'Hacıbektaş', 'Kozaklı', 'Ürgüp'],
  'Niğde': ['Merkez', 'Altunhisar', 'Bor', 'Çamardı', 'Çiftlik', 'Ulukışla'],
  'Ordu': ['Altınordu', 'Akkuş', 'Aybastı', 'Çamaş', 'Çatalpınar', 'Çaybaşı', 'Fatsa', 'Gölköy', 'Gülyalı', 'Gürgentepe', 'İkizce', 'Kabadüz', 'Kabataş', 'Korgan', 'Kumru', 'Mesudiye', 'Perşembe', 'Ulubey', 'Ünye'],
  'Osmaniye': ['Merkez', 'Bahçe', 'Düziçi', 'Hasanbeyli', 'Kadirli', 'Sumbas', 'Toprakkale'],
  'Rize': ['Merkez', 'Ardeşen', 'Çamlıhemşin', 'Çayeli', 'Derepazarı', 'Fındıklı', 'Güneysu', 'Hemşin', 'İkizdere', 'İyidere', 'Kalkandere', 'Pazar'],
  'Sakarya': ['Adapazarı', 'Akyazı', 'Arifiye', 'Erenler', 'Ferizli', 'Geyve', 'Hendek', 'Karapürçek', 'Karasu', 'Kaynarca', 'Kocaali', 'Pamukova', 'Sapanca', 'Serdivan', 'Söğütlü', 'Taraklı'],
  'Samsun': ['İlkadım', 'Atakum', 'Canik', 'Tekkeköy', 'Alaçam', 'Asarcık', 'Ayvacık', 'Bafra', 'Çarşamba', 'Havza', 'Kavak', 'Ladik', 'Ondokuzmayıs', 'Salıpazarı', 'Terme', 'Vezirköprü', 'Yakakent'],
  'Siirt': ['Merkez', 'Baykan', 'Eruh', 'Kurtalan', 'Pervari', 'Şirvan', 'Tillo'],
  'Sinop': ['Merkez', 'Ayancık', 'Boyabat', 'Dikmen', 'Durağan', 'Erfelek', 'Gerze', 'Saraydüzü', 'Türkeli'],
  'Sivas': ['Merkez', 'Akıncılar', 'Altınyayla', 'Divriği', 'Doğanşar', 'Gemerek', 'Gölova', 'Gürün', 'Hafik', 'İmranlı', 'Kangal', 'Koyulhisar', 'Şarkışla', 'Suşehri', 'Ulaş', 'Yıldızeli', 'Zara'],
  'Şanlıurfa': ['Eyyübiye', 'Haliliye', 'Karaköprü', 'Akçakale', 'Birecik', 'Bozova', 'Ceylanpınar', 'Halfeti', 'Harran', 'Hilvan', 'Siverek', 'Suruç', 'Viranşehir'],
  'Şırnak': ['Merkez', 'Beytüşşebap', 'Cizre', 'Güçlükonak', 'İdil', 'Silopi', 'Uludere'],
  'Tekirdağ': ['Süleymanpaşa', 'Çerkezköy', 'Çorlu', 'Ergene', 'Hayrabolu', 'Kapaklı', 'Malkara', 'Marmaraereğlisi', 'Muratlı', 'Saray', 'Şarköy'],
  'Tokat': ['Merkez', 'Almus', 'Artova', 'Başçiftlik', 'Erbaa', 'Niksar', 'Pazar', 'Reşadiye', 'Sulusaray', 'Turhal', 'Yeşilyurt', 'Zile'],
  'Trabzon': ['Ortahisar', 'Akçaabat', 'Araklı', 'Arsin', 'Beşikdüzü', 'Çarşıbaşı', 'Çaykara', 'Dernekpazarı', 'Düzköy', 'Hayrat', 'Köprübaşı', 'Maçka', 'Of', 'Şalpazarı', 'Sürmene', 'Tonya', 'Vakfıkebir', 'Yomra'],
  'Tunceli': ['Merkez', 'Çemişgezek', 'Hozat', 'Mazgirt', 'Nazımiye', 'Ovacık', 'Pertek', 'Pülümür'],
  'Uşak': ['Merkez', 'Banaz', 'Eşme', 'Karahallı', 'Sivaslı', 'Ulubey'],
  'Van': ['İpekyolu', 'Tuşba', 'Edremit', 'Bahçesaray', 'Başkale', 'Çaldıran', 'Çatak', 'Erciş', 'Gevaş', 'Gürpınar', 'Muradiye', 'Özalp', 'Saray'],
  'Yalova': ['Merkez', 'Altınova', 'Armutlu', 'Çınarcık', 'Çiftlikköy', 'Termal'],
  'Yozgat': ['Merkez', 'Akdağmadeni', 'Aydıncık', 'Boğazlıyan', 'Çandır', 'Çayıralan', 'Çekerek', 'Kadışehri', 'Saraykent', 'Sarıkaya', 'Sorgun', 'Şefaatli', 'Yerköy', 'Yenifakılı'],
  'Zonguldak': ['Merkez', 'Alaplı', 'Çaycuma', 'Devrek', 'Gökçebey', 'Kilimli', 'Kozlu'],
};

// Türkiye şehir koordinatları (merkez noktalar)
const CITY_COORDINATES: { [key: string]: { latitude: number; longitude: number } } = {
  'Adana': { latitude: 36.9914, longitude: 35.3308 },
  'Adıyaman': { latitude: 37.7636, longitude: 38.2786 },
  'Afyonkarahisar': { latitude: 38.7569, longitude: 30.5387 },
  'Ağrı': { latitude: 39.7217, longitude: 43.0567 },
  'Amasya': { latitude: 40.6514, longitude: 35.8331 },
  'Ankara': { latitude: 39.9334, longitude: 32.8597 },
  'Antalya': { latitude: 36.8841, longitude: 30.7056 },
  'Balıkesir': { latitude: 39.6484, longitude: 27.8826 },
  'Bilecik': { latitude: 40.1429, longitude: 29.9793 },
  'Bingöl': { latitude: 38.8847, longitude: 40.4986 },
  'Bitlis': { latitude: 38.4006, longitude: 42.1097 },
  'Bolu': { latitude: 40.7396, longitude: 31.6086 },
  'Burdur': { latitude: 37.7183, longitude: 30.2813 },
  'Bursa': { latitude: 40.1826, longitude: 29.0665 },
  'Çanakkale': { latitude: 40.1553, longitude: 26.4142 },
  'Çankırı': { latitude: 40.6013, longitude: 33.6134 },
  'Çorum': { latitude: 40.5489, longitude: 34.9533 },
  'Denizli': { latitude: 37.7765, longitude: 29.0864 },
  'Diyarbakır': { latitude: 37.9100, longitude: 40.2300 },
  'Edirne': { latitude: 41.6772, longitude: 26.5557 },
  'Elazığ': { latitude: 38.6748, longitude: 39.2225 },
  'Erzincan': { latitude: 39.7500, longitude: 39.5000 },
  'Erzurum': { latitude: 39.9042, longitude: 41.2679 },
  'Eskişehir': { latitude: 39.7767, longitude: 30.5206 },
  'Gaziantep': { latitude: 37.0662, longitude: 37.3833 },
  'Giresun': { latitude: 40.9128, longitude: 38.3895 },
  'Gümüşhane': { latitude: 40.4603, longitude: 39.5100 },
  'Hakkari': { latitude: 37.5744, longitude: 43.7408 },
  'Hatay': { latitude: 36.4018, longitude: 36.3498 },
  'Iğdır': { latitude: 39.9234, longitude: 44.0448 },
  'Isparta': { latitude: 37.7648, longitude: 30.5566 },
  'İstanbul': { latitude: 41.0082, longitude: 28.9784 },
  'İzmir': { latitude: 38.4192, longitude: 27.1287 },
  'Kahramanmaraş': { latitude: 37.5753, longitude: 36.9378 },
  'Karabük': { latitude: 41.2044, longitude: 32.6274 },
  'Karaman': { latitude: 37.1759, longitude: 33.2187 },
  'Kars': { latitude: 40.6012, longitude: 43.0975 },
  'Kastamonu': { latitude: 41.3767, longitude: 33.7765 },
  'Kayseri': { latitude: 38.7312, longitude: 35.4787 },
  'Kırıkkale': { latitude: 39.8468, longitude: 33.5153 },
  'Kırklareli': { latitude: 41.7350, longitude: 27.2250 },
  'Kırşehir': { latitude: 39.1458, longitude: 34.1606 },
  'Kilis': { latitude: 36.7184, longitude: 37.1212 },
  'Kocaeli': { latitude: 40.7667, longitude: 29.9167 },
  'Konya': { latitude: 37.8746, longitude: 32.4932 },
  'Kütahya': { latitude: 39.4167, longitude: 29.9833 },
  'Malatya': { latitude: 38.3552, longitude: 38.3095 },
  'Manisa': { latitude: 38.6140, longitude: 27.4296 },
  'Mardin': { latitude: 37.3131, longitude: 40.7350 },
  'Mersin': { latitude: 36.8121, longitude: 34.6415 },
  'Muğla': { latitude: 37.2153, longitude: 28.3636 },
  'Muş': { latitude: 38.7433, longitude: 41.5065 },
  'Nevşehir': { latitude: 38.6244, longitude: 34.7239 },
  'Niğde': { latitude: 37.9667, longitude: 34.6833 },
  'Ordu': { latitude: 40.9839, longitude: 37.8764 },
  'Osmaniye': { latitude: 37.0742, longitude: 36.2478 },
  'Rize': { latitude: 41.0201, longitude: 40.5234 },
  'Sakarya': { latitude: 40.7569, longitude: 30.3781 },
  'Samsun': { latitude: 41.2867, longitude: 36.3300 },
  'Siirt': { latitude: 37.9333, longitude: 41.9500 },
  'Sinop': { latitude: 42.0269, longitude: 35.1551 },
  'Sivas': { latitude: 39.7477, longitude: 37.0179 },
  'Şanlıurfa': { latitude: 37.1674, longitude: 38.7955 },
  'Şırnak': { latitude: 37.5164, longitude: 42.4611 },
  'Tekirdağ': { latitude: 40.9833, longitude: 27.5167 },
  'Tokat': { latitude: 40.3167, longitude: 36.5500 },
  'Trabzon': { latitude: 41.0015, longitude: 39.7178 },
  'Tunceli': { latitude: 39.1079, longitude: 39.5401 },
  'Uşak': { latitude: 38.6823, longitude: 29.4082 },
  'Van': { latitude: 38.4891, longitude: 43.4089 },
  'Yalova': { latitude: 40.6500, longitude: 29.2667 },
  'Yozgat': { latitude: 39.8183, longitude: 34.8147 },
  'Zonguldak': { latitude: 41.4564, longitude: 31.7986 },
};

interface Shop {
  name: string;
  address?: string;
  coordinates?: { latitude: number; longitude: number };
  workingHours?: string;
  photos?: string[];
  services?: any[];
  rating?: number;
  totalRatings?: number;
  reviews?: Array<{
    author: string;
    rating: number;
    text: string;
    time: number;
  }>;
  placeId?: string;
  phone?: string;
  ownerEmail?: string;
  isPaymentActive?: boolean;
}

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // Yeni: Kategori seçimi
  const [selectedDistrictCoords, setSelectedDistrictCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [maxDistance, setMaxDistance] = useState<number>(10); // km cinsinden maksimum mesafe
  const [citySearchText, setCitySearchText] = useState<string>('');
  const [districtSearchText, setDistrictSearchText] = useState<string>('');
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [districtSuggestions, setDistrictSuggestions] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cacheNotFound, setCacheNotFound] = useState(false); // Cache bulunamadı durumu
  const mapRef = useRef<MapView>(null);
  const districtCoordsCache = useRef<{ [key: string]: { latitude: number; longitude: number } }>({});

  useEffect(() => {
    let isMounted = true;
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (isMounted) {
            setErrorMsg('Konum erişim izni verilmedi');
          }
          return;
        }

        const lastKnownLocation = await Location.getLastKnownPositionAsync();
        if (isMounted && lastKnownLocation) {
          setLocation(lastKnownLocation);
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (isMounted && currentLocation) {
          setLocation(currentLocation);
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 100, // metre
            timeInterval: 15000, // ms
          },
          (newLocation) => {
            if (isMounted) {
              setLocation(newLocation);
            }
          }
        );
      } catch (error) {
        console.error('Konum alınırken hata oluştu:', error);
      }
    })();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Haritayı güncelleme fonksiyonu
  const updateMapRegion = useCallback(() => {
    if (!mapRef.current) return;

    if (selectedDistrict && selectedDistrictCoords) {
      mapRef.current.animateToRegion(
        {
          latitude: selectedDistrictCoords.latitude,
          longitude: selectedDistrictCoords.longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        },
        1000
      );
      return;
    }

    if (selectedCity && CITY_COORDINATES[selectedCity]) {
      const cityCoords = CITY_COORDINATES[selectedCity];
      mapRef.current.animateToRegion(
        {
          latitude: cityCoords.latitude,
          longitude: cityCoords.longitude,
          latitudeDelta: 0.15,
          longitudeDelta: 0.15,
        },
        1000
      );
      return;
    }

    if (!selectedCity && !selectedDistrict && userLocation) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        },
        1000
      );
    }
  }, [selectedCity, selectedDistrict, selectedDistrictCoords, userLocation]);

  // Şehir/ilçe seçildiğinde veya kullanıcı konumu değiştiğinde haritayı güncelle
  useEffect(() => {
    // Harita henüz render edilmemişse bekle
    if (!mapRef.current) {
      // Kısa bir süre sonra tekrar dene
      const timer = setTimeout(() => {
        if (mapRef.current) {
          updateMapRegion();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
    
    updateMapRegion();
  }, [updateMapRegion]);

  useFocusEffect(
    useCallback(() => {
      loadShops();
    }, [loadShops])
  );

  useEffect(() => {
    loadShops();
  }, [selectedCity, selectedDistrict, selectedCategory, loadShops]);

  useEffect(() => {
    if (!selectedDistrict) {
      setSelectedDistrictCoords(null);
    }
  }, [selectedDistrict]);

  const loadShops = useCallback(async () => {
    try {
      setLoadingPlaces(true);

      const businessOwnerData = await AsyncStorage.getItem('businessOwner');
      const parsedBusinessOwner = businessOwnerData ? JSON.parse(businessOwnerData) : null;
      const activeOwnerEmail = parsedBusinessOwner?.paymentStatus === 'active' ? parsedBusinessOwner.email : null;

      const shopData = await AsyncStorage.getItem('shopInfo');
      const savedShops: Shop[] = [];

      if (shopData) {
        const parsed = JSON.parse(shopData);
        if (parsed.name) {
          savedShops.push({
            ...parsed,
            isPaymentActive: activeOwnerEmail ? parsed.ownerEmail === activeOwnerEmail : false,
          });
          setIsAdmin(true);
        }
      } else {
        setIsAdmin(false);
      }

      let placesShops: Shop[] = [];
      // Kategori ve bölge seçilmişse cache'den yükle
      if (selectedCategory && (selectedCity || selectedDistrict)) {
        placesShops = await loadPlacesShops(
          selectedCategory,
          selectedCity || ALLOWED_CITY,
          selectedDistrict || ALLOWED_DISTRICTS[0]
        );
      } else {
        // Kategori veya bölge seçilmemişse boş göster
        placesShops = [];
        if (selectedCategory || selectedCity || selectedDistrict) {
          setCacheNotFound(true);
        }
      }

      const allShops = [...savedShops, ...placesShops.map((shop) => ({ ...shop, isPaymentActive: !!shop.isPaymentActive }))].map((shop) => ({
        ...shop,
        isPaymentActive: !!shop.isPaymentActive,
      }));
      setShops(allShops);
      await AsyncStorage.setItem('allShops', JSON.stringify(allShops));
    } catch (error) {
      console.error('Error loading shops:', error);
      const shopData = await AsyncStorage.getItem('shopInfo');
      if (shopData) {
        const parsed = JSON.parse(shopData);
        if (parsed.name) {
          setShops([parsed]);
        }
      }
    } finally {
      setLoadingPlaces(false);
    }
  }, [selectedCity, selectedDistrict, loadPlacesShops]);

  const getDistrictCoordinates = useCallback(
    async (city: string, district: string): Promise<{ latitude: number; longitude: number } | null> => {
      const cacheKey = `${city}-${district}`.toLowerCase();
      if (districtCoordsCache.current[cacheKey]) {
        return districtCoordsCache.current[cacheKey];
      }

      try {
        const address = `${district}, ${city}, Türkiye`;
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && Array.isArray(data.results) && data.results.length > 0) {
          const location = data.results[0].geometry.location;
          const coordinates = {
            latitude: location.lat,
            longitude: location.lng,
          };
          districtCoordsCache.current[cacheKey] = coordinates;
          return coordinates;
        }
      } catch (error) {
        console.error('Error fetching district coordinates:', error);
      }

      return null;
    },
    []
  );

  // Cache kontrolü - Firestore'dan cache'i kontrol et
  const checkCache = useCallback(async (category: string, district: string, city: string): Promise<Shop[] | null> => {
    try {
      if (!category || !district || !city) {
        return null;
      }

      const cacheKey = `${category.toLowerCase()}-${district.toLowerCase()}-${city.toLowerCase()}`;
      const cacheDocRef = doc(db, 'googlePlacesCache', cacheKey);
      const cacheDoc = await getDoc(cacheDocRef);

      if (cacheDoc.exists()) {
        const cacheData = cacheDoc.data();
        return cacheData.shops || [];
      }

      return null;
    } catch (error) {
      console.error('Error checking cache:', error);
      return null;
    }
  }, []);

  const loadPlacesShops = useCallback(async (category?: string, city?: string, district?: string): Promise<Shop[]> => {
    try {
      // Kategori ve bölge kontrolü
      if (!category) {
        setCacheNotFound(true);
        return [];
      }

      if (city && !isAllowedCity(city)) {
        setCacheNotFound(true);
        return [];
      }

      if (district && !isAllowedDistrict(district)) {
        setCacheNotFound(true);
        return [];
      }

      const searchCity = city || ALLOWED_CITY;
      const searchDistrict = district || ALLOWED_DISTRICTS[0];
      const searchCategory = category;

      // ÖNCE CACHE KONTROLÜ - Cache varsa API çağrısı YAPMA
      const cachedShops = await checkCache(searchCategory, searchDistrict, searchCity);
      if (cachedShops && cachedShops.length > 0) {
        setCacheNotFound(false);
        return cachedShops;
      }

      // Cache yok - API çağrısı YAPMA, sadece "Veri bulunamadı" göster
      setCacheNotFound(true);
      return [];
    } catch (error) {
      console.error('Error loading places shops:', error);
      setCacheNotFound(true);
      return [];
    }
  }, [checkCache]);

  // Şehir autocomplete
  const handleCitySearch = (text: string) => {
    setCitySearchText(text);
    const trimmed = text.trim();

    if (trimmed.length === 0) {
      setCitySuggestions([ALLOWED_CITY]);
      return;
    }

    const normalizedSearch = normalizeText(trimmed);
    const matches = Object.keys(TURKEY_CITIES_AND_DISTRICTS)
      .filter((city) => isAllowedCity(city))
      .filter((city) => {
        const normalizedCity = normalizeText(city);
        return (
          normalizedCity.includes(normalizedSearch) || normalizedSearch.includes(normalizedCity)
        );
      });

    setCitySuggestions(matches.slice(0, 10));

    if (matches.length === 1) {
      const cityName = matches[0];
      const normalizedCity = normalizeText(cityName);

      if (normalizedSearch.includes(normalizedCity) && normalizedSearch !== normalizedCity) {
        const remaining = normalizedSearch
          .replace(normalizedCity, '')
          .replace(/\s+/g, ' ')
          .trim();

        if (remaining.length > 0) {
          const districts = TURKEY_CITIES_AND_DISTRICTS[cityName] || [];
          const districtMatch = districts.find((district) => {
            const normalizedDistrict = normalizeText(district);
            return (
              normalizedDistrict.includes(remaining) || remaining.includes(normalizedDistrict)
            );
          });

          if (districtMatch) {
            selectCity(cityName);
            selectDistrict(districtMatch, cityName);
          }
        }
      }
    }
  };

  // İlçe autocomplete
  const handleDistrictSearch = (text: string) => {
    setDistrictSearchText(text);

    if (!selectedCity || !isAllowedCity(selectedCity)) {
      setDistrictSuggestions([]);
      return;
    }

    const trimmed = text.trim();
    const districts = ALLOWED_DISTRICTS;

    if (trimmed.length === 0) {
      setDistrictSuggestions(districts.slice(0, 10));
      return;
    }

    const normalizedSearch = normalizeText(trimmed);
    const matches = districts.filter((district) => {
      const normalizedDistrict = normalizeText(district);
      return (
        normalizedDistrict.includes(normalizedSearch) || normalizedSearch.includes(normalizedDistrict)
      );
    });

    setDistrictSuggestions(matches.slice(0, 10));

    if (matches.length === 1) {
      selectDistrict(matches[0]);
    }
  };

  const selectCity = (city: string) => {
    if (!isAllowedCity(city)) {
      Alert.alert(
        'Şimdilik Desteklenmiyor',
        'Şu anda yalnızca Balıkesir/Karesi bölgesindeki mekanları gösteriyoruz.'
      );
      return;
    }

    setSelectedCity(city);
    setCitySearchText(city);
    setCitySuggestions([]);
    setDistrictSearchText('');
    setSelectedDistrict('');
    setSelectedDistrictCoords(null);
    setDistrictSuggestions(ALLOWED_DISTRICTS);
  };

  const selectDistrict = async (district: string, cityOverride?: string) => {
    if (!isAllowedDistrict(district)) {
      Alert.alert(
        'Şimdilik Desteklenmiyor',
        'Şu anda yalnızca Balıkesir/Karesi bölgesindeki mekanları gösteriyoruz.'
      );
      return;
    }

    const targetCity = cityOverride || selectedCity;
    if (!targetCity || !isAllowedCity(targetCity)) {
      return;
    }

    setSelectedDistrict(district);
    setDistrictSearchText(district);
    setDistrictSuggestions([]);

    const coords = await getDistrictCoordinates(targetCity, district);
    if (coords) {
      setSelectedDistrictCoords(coords);
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          },
          1000
        );
      }
    }
  };

  const loadPlaceReviews = async (shops: Shop[]): Promise<Shop[]> => {
    try {
      
      // Her mekan için Place Details API çağrısı yap
      // Rate limiting için küçük batch'ler halinde işle
      const batchSize = 5;
      const shopsWithReviews: Shop[] = [];
      
      for (let i = 0; i < shops.length; i += batchSize) {
        const batch = shops.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (shop) => {
          if (!shop.placeId) {
            return shop; // placeId yoksa olduğu gibi döndür
          }
          
          try {
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${shop.placeId}&fields=rating,user_ratings_total,reviews&key=${GOOGLE_MAPS_API_KEY}`;
            const response = await fetch(detailsUrl);
            const data = await response.json();
            
            if (data.status === 'OK' && data.result) {
              const reviews = data.result.reviews?.slice(0, 5).map((review: any) => ({
                author: review.author_name,
                rating: review.rating,
                text: review.text,
                time: review.time,
              })) || [];
              
              return {
                ...shop,
                rating: data.result.rating || shop.rating,
                totalRatings: data.result.user_ratings_total || shop.totalRatings,
                reviews: reviews,
              };
            }
            
            return shop; // Hata durumunda eski shop'u döndür
          } catch (error) {
            console.error(`Error loading reviews for ${shop.name}:`, error);
            return shop; // Hata durumunda eski shop'u döndür
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        shopsWithReviews.push(...batchResults);
        
        // Rate limiting için kısa bir bekleme (opsiyonel)
        if (i + batchSize < shops.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      console.log('Yorumlar yüklendi. Toplam mekan:', shopsWithReviews.length);
      return shopsWithReviews;
    } catch (error) {
      console.error('Error loading place reviews:', error);
      return shops; // Hata durumunda yorumlar olmadan döndür
    }
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Dünya yarıçapı (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const userLocation = location?.coords;
  
  // Initial region'ı hesapla - kullanıcı konumu yüklendiğinde güncellenecek
  const initialRegion = useMemo(() => {
    // Önce seçili şehir varsa onu göster
    if (selectedCity && CITY_COORDINATES[selectedCity]) {
      const cityCoords = CITY_COORDINATES[selectedCity];
      return {
        latitude: cityCoords.latitude,
        longitude: cityCoords.longitude,
        latitudeDelta: 0.15, // İlçe için daha yakın zoom
        longitudeDelta: 0.15,
      };
    }
    
    // Şehir seçili değilse kullanıcı konumunu göster
    if (userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }
    
    // Mekanlar varsa ilk mekana zoom yap
    if (shops.length > 0 && shops[0].coordinates) {
      return {
        latitude: shops[0].coordinates.latitude,
        longitude: shops[0].coordinates.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }
    
    // Kullanıcı konumu yüklenene kadar İstanbul göster (geçici)
    // Kullanıcı konumu yüklendiğinde useEffect ile güncellenecek
    return {
      latitude: 41.0082,
      longitude: 28.9784,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
  }, [selectedCity, userLocation, shops]);

  // Koordinatları olan mekanları filtrele
  const shopsWithCoordinates = shops.filter(shop => shop.coordinates);
  
  // Yakındaki dükkanları filtrele ve sırala
  // Şehir/ilçe seçiliyse tüm mekanları göster, yoksa sadece yakındakileri göster
  const nearbyShops = selectedCity || selectedDistrict
    ? shopsWithCoordinates // Şehir/ilçe seçiliyse tüm mekanları göster
    : userLocation
    ? shopsWithCoordinates
        .filter(shop => {
          if (!shop.coordinates) return false;
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            shop.coordinates.latitude,
            shop.coordinates.longitude
          );
          return distance <= maxDistance; // Maksimum mesafe içindeki mekanlar
        })
        .sort((a, b) => {
          if (!a.coordinates || !b.coordinates) return 0;
          const distA = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            a.coordinates.latitude,
            a.coordinates.longitude
          );
          const distB = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            b.coordinates.latitude,
            b.coordinates.longitude
          );
          return distA - distB;
        })
    : shopsWithCoordinates;

  return (
    <AnimatedTabScreen>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Harita</Text>
        <View style={styles.headerRightSection}>
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => {
              setCitySearchText(selectedCity);
              setDistrictSearchText(selectedDistrict);
              if (selectedCity) {
                const districts = TURKEY_CITIES_AND_DISTRICTS[selectedCity] || [];
                setDistrictSuggestions(districts);
              }
              setShowLocationModal(true);
            }}
          >
            <IconSymbol name="magnifyingglass" size={18} color="#fff" />
            <Text style={styles.searchButtonText}>
              {selectedCity && selectedDistrict 
                ? `${selectedCity} - ${selectedDistrict}`
                : selectedCity 
                ? selectedCity
                : 'Şehir/İlçe Seç'}
            </Text>
          </TouchableOpacity>
          
          {(selectedCity || selectedDistrict) && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSelectedCity('');
                setSelectedDistrict('');
                setCitySearchText('');
                setDistrictSearchText('');
                setCitySuggestions([]);
                setDistrictSuggestions([]);
                setSelectedDistrictCoords(null);

                if (userLocation && mapRef.current) {
                  mapRef.current.animateToRegion({
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }, 1000);
                }
              }}
            >
              <IconSymbol name="xmark.circle.fill" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          showsScale={true}
        >
          {shopsWithCoordinates.map((shop, index) => {
            if (!shop.coordinates) return null;
            const displayName = shop.name || shop.address || 'Mekan';
            return (
              <Marker
                key={index}
                coordinate={{
                  latitude: shop.coordinates.latitude,
                  longitude: shop.coordinates.longitude,
                }}
                tracksViewChanges={false}
                anchor={{ x: 0.5, y: 0.5 }}
                onPress={() => {
                  router.push({
                    pathname: '/shop/[id]',
                    params: { id: shop.placeId || shop.name || index.toString() }
                  });
                }}
              >
                <View style={styles.customMarker}>
                  <View style={styles.markerPin}>
                    <View style={styles.markerDot} />
                  </View>
                  <View style={styles.markerLabel}>
                    <Text style={styles.markerLabelText} numberOfLines={1}>
                      {displayName}
                    </Text>
                  </View>
                </View>
              </Marker>
            );
          })}
        </MapView>
      </View>

      <View style={styles.nearbyContainer}>
        {loadingPlaces ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              {selectedCity && selectedDistrict 
                ? `${selectedCity} - ${selectedDistrict} dükkanları yükleniyor...`
                : selectedCity 
                ? `${selectedCity} dükkanları yükleniyor...`
                : 'Dükkanlar yükleniyor...'}
            </Text>
          </View>
        ) : nearbyShops.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.shopsScroll}>
            {nearbyShops.map((shop, index) => {
              const distance = userLocation && shop.coordinates
                ? calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    shop.coordinates.latitude,
                    shop.coordinates.longitude
                  ).toFixed(1)
                : null;
              
              return (
                <TouchableOpacity 
                  key={index}
                  style={styles.shopCard}
                  onPress={() => router.push({
                    pathname: '/shop/[id]',
                    params: { id: shop.placeId || shop.name || index.toString() }
                  })}
                >
                  <View style={styles.shopImage}>
                    {shop.photos && shop.photos.length > 0 ? (
                      <View style={styles.shopImagePlaceholder}>
                        <IconSymbol name="photo" size={20} color="#dc2626" />
                      </View>
                    ) : (
        <IconSymbol
                        name={shop.name?.toLowerCase().includes('berber') ? 'scissors' : 'sparkles'} 
                        size={30} 
                        color="#dc2626" 
                      />
                    )}
                  </View>
                  <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
                  {distance && (
                    <Text style={styles.shopDistance}>{distance} km</Text>
                  )}
                  {shop.address && (
                    <Text style={styles.shopAddress} numberOfLines={1}>{shop.address}</Text>
                  )}
                  {shop.rating && (
                    <View style={styles.ratingContainer}>
                      <IconSymbol name="star.fill" size={14} color="#FFD700" />
                      <Text style={styles.rating}>{shop.rating.toFixed(1)}</Text>
                      {shop.totalRatings && (
                        <Text style={styles.ratingCount}>({shop.totalRatings})</Text>
                      )}
                    </View>
                  )}
                  {shop.reviews && shop.reviews.length > 0 && (
                    <View style={styles.reviewsPreview}>
                      <Text style={styles.reviewText} numberOfLines={1}>
                        "{shop.reviews[0].text}"
                      </Text>
                      <Text style={styles.reviewAuthor}>- {shop.reviews[0].author}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <View style={styles.emptyShops}>
            <IconSymbol name="map" size={48} color="#cbd5e1" />
            <Text style={styles.emptyShopsText}>Henüz mekan bulunamadı</Text>
            {isAdmin && (
              <Text style={styles.emptyShopsSubtext}>
                Profil sayfasından "Mekan Ekle" butonuna tıklayarak mekanınızı ekleyebilirsiniz
              </Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.filtersContainer}>
        <Text style={styles.sectionTitle}>Filtreler</Text>
        {/* Cache bulunamadı mesajı */}
        {cacheNotFound && selectedCategory && (selectedCity || selectedDistrict) && (
          <View style={styles.cacheNotFoundContainer}>
            <IconSymbol name="info.circle" size={20} color="#f59e0b" />
            <Text style={styles.cacheNotFoundText}>
              Bu bölge/kategori için veri bulunamadı. Lütfen daha sonra tekrar deneyin.
            </Text>
          </View>
        )}
      </View>

      {/* Şehir/İlçe Seçim Modal */}
      <Modal
        visible={showLocationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Şehir ve İlçe Seç</Text>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <IconSymbol name="xmark" size={24} color="#1e293b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Kategori</Text>
              <View style={styles.categoryContainer}>
                {AVAILABLE_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category && styles.categoryButtonActive
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        selectedCategory === category && styles.categoryButtonTextActive
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { marginTop: 24 }]}>Şehir</Text>
              <View style={styles.autocompleteContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Örn: Balıkesir, İstanbul, Ankara"
                  value={citySearchText}
                  onChangeText={handleCitySearch}
                  onFocus={() => {
                    if (selectedCity) {
                      setCitySearchText(selectedCity);
                    }
                  }}
                  placeholderTextColor="#94a3b8"
                />
                {citySuggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <ScrollView style={styles.suggestionsList} nestedScrollEnabled>
                      {citySuggestions.map((city, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.suggestionItem}
                          onPress={() => selectCity(city)}
                        >
                          <Text style={styles.suggestionText}>{city}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <Text style={[styles.inputLabel, { marginTop: 24 }]}>İlçe (Opsiyonel)</Text>
              <View style={styles.autocompleteContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={selectedCity ? `Örn: ${TURKEY_CITIES_AND_DISTRICTS[selectedCity]?.[0] || 'İlçe seçin'}` : 'Önce şehir seçin'}
                  value={districtSearchText}
                  onChangeText={handleDistrictSearch}
                  onFocus={() => {
                    if (selectedDistrict) {
                      setDistrictSearchText(selectedDistrict);
                    } else if (selectedCity) {
                      const districts = TURKEY_CITIES_AND_DISTRICTS[selectedCity] || [];
                      setDistrictSuggestions(districts);
                    }
                  }}
                  editable={!!selectedCity}
                  placeholderTextColor="#94a3b8"
                />
                {districtSuggestions.length > 0 && selectedCity && (
                  <View style={styles.suggestionsContainer}>
                    <ScrollView style={styles.suggestionsList} nestedScrollEnabled>
                      {districtSuggestions.map((district, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.suggestionItem}
                          onPress={() => selectDistrict(district)}
                        >
                          <Text style={styles.suggestionText}>{district}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setSelectedCity('');
                  setSelectedDistrict('');
                  setCitySearchText('');
                  setDistrictSearchText('');
                  setCitySuggestions([]);
                  setDistrictSuggestions([]);
                  setSelectedDistrictCoords(null);
                  setShowLocationModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Temizle</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.applyButton, { marginLeft: 12 }]}
                onPress={() => {
                  const trimmedCity = citySearchText.trim();
                  const trimmedDistrict = districtSearchText.trim();

                  let appliedCity = '';

                  if (trimmedCity.length > 0) {
                    const matchedCity = Object.keys(TURKEY_CITIES_AND_DISTRICTS).find(
                      (city) => normalizeText(city) === normalizeText(trimmedCity)
                    );

                    appliedCity = matchedCity || trimmedCity;
                    selectCity(appliedCity);
                  } else {
                    setSelectedCity('');
                    setSelectedDistrict('');
                    setSelectedDistrictCoords(null);
                  }

                  if (trimmedDistrict.length > 0 && appliedCity) {
                    const districts = TURKEY_CITIES_AND_DISTRICTS[appliedCity] || [];
                    const matchedDistrict = districts.find(
                      (district) => normalizeText(district) === normalizeText(trimmedDistrict)
                    );
                    selectDistrict(matchedDistrict || trimmedDistrict, appliedCity);
                  } else if (trimmedDistrict.length === 0) {
                    setSelectedDistrict('');
                    setSelectedDistrictCoords(null);
                  }

                  setShowLocationModal(false);
                }}
              >
                <Text style={styles.applyButtonText}>Uygula</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </ScrollView>
    </AnimatedTabScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#dc2626',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  mapContainer: {
    height: 400,
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  map: {
    height: 400,
    width: '100%',
  },
  nearbyContainer: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  shopsScroll: {
    marginBottom: 24,
  },
  shopCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  shopImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  shopName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  shopDistance: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
    marginBottom: 4,
  },
  shopAddress: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 8,
    textAlign: 'center',
  },
  shopImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyShops: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  emptyShopsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyShopsSubtext: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  ratingCount: {
    marginLeft: 4,
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  reviewsPreview: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  reviewText: {
    fontSize: 11,
    color: '#475569',
    fontStyle: 'italic',
    marginBottom: 4,
    lineHeight: 14,
  },
  reviewAuthor: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
  },
  filtersContainer: {
    padding: 20,
    paddingTop: 0,
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 140,
    height: 45,
    position: 'relative',
  },
  markerLabel: {
    position: 'absolute',
    bottom: 26,
    backgroundColor: '#fff',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
    maxWidth: 120,
    minWidth: 50,
    zIndex: 1000,
  },
  markerLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e293b',
    letterSpacing: -0.15,
    textAlign: 'center',
  },
  markerPin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#dc2626',
    borderWidth: 2.5,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  markerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  headerRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  clearButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 18,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxHeight: '85%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalBody: {
    flex: 1,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#dc2626',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  autocompleteContainer: {
    position: 'relative',
    zIndex: 1,
    marginBottom: 16,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 4,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  suggestionsList: {
    maxHeight: 300,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  suggestionText: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  cacheNotFoundContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 16,
    margin: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  cacheNotFoundText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
});
