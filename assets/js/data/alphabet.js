/* Arabisches Alphabet — Formen, Laute, deutsche Hörhilfen, libanesische Besonderheiten. */
var DATA = window.DATA || {};

DATA.letters = [
  { id:'l01', name:'Alif',  ar:'ا', iso:'ا', ini:'ا',  med:'ـا',  fin:'ـا',  tr:'ā / a', connects:false,
    sound:'Langes A wie in „Vater“. Trägt am Wortanfang oft nur den Vokal (a/i/u) oder ein Hamza.',
    de:'wie deutsches langes „a“', ex:{ar:'أنا', tr:'ana', de:'ich'} },
  { id:'l02', name:'Bāʾ',   ar:'ب', iso:'ب', ini:'بـ', med:'ـبـ', fin:'ـب', tr:'b', connects:true,
    sound:'B wie in „Baum“.', de:'genau wie deutsches b', ex:{ar:'بيت', tr:'bēt', de:'Haus'} },
  { id:'l03', name:'Tāʾ',   ar:'ت', iso:'ت', ini:'تـ', med:'ـتـ', fin:'ـت', tr:'t', connects:true,
    sound:'T wie in „Tisch“, aber ohne Behauchung.', de:'t ohne Hauch — eher wie in „Stein“', ex:{ar:'تلج', tr:'talj', de:'Schnee'} },
  { id:'l04', name:'Thāʾ',  ar:'ث', iso:'ث', ini:'ثـ', med:'ـثـ', fin:'ـث', tr:'th', connects:true,
    sound:'Englisches „th“ in „think“ — im Libanesischen fast immer zu t oder s.',
    de:'im Dialekt: t (z. B. تلاتة tlēte „drei“)', ex:{ar:'تلاتة', tr:'tlēte', de:'drei (gesprochen mit t!)'} },
  { id:'l05', name:'Jīm',   ar:'ج', iso:'ج', ini:'جـ', med:'ـجـ', fin:'ـج', tr:'j', connects:true,
    sound:'Wie „J“ in französisch „Journal“ / deutsch „Journal“.', de:'stimmhaftes sch, wie in „Garage“', ex:{ar:'جبل', tr:'jabal', de:'Berg'} },
  { id:'l06', name:'Ḥāʾ',   ar:'ح', iso:'ح', ini:'حـ', med:'ـحـ', fin:'ـح', tr:'ḥ (7)', connects:true,
    sound:'Scharfes, gehauchtes H tief im Rachen — kein deutscher Laut.',
    de:'wie wenn du eine Brille anhauchst, nur kräftiger', ex:{ar:'حلو', tr:'ḥelu', de:'süß, schön'} },
  { id:'l07', name:'Khāʾ',  ar:'خ', iso:'خ', ini:'خـ', med:'ـخـ', fin:'ـخ', tr:'kh (5)', connects:true,
    sound:'Wie „ch“ in „Bach“.', de:'deutsches ach-Laut — den kannst du schon', ex:{ar:'خبز', tr:'khebez', de:'Brot'} },
  { id:'l08', name:'Dāl',   ar:'د', iso:'د', ini:'د',  med:'ـد',  fin:'ـد', tr:'d', connects:false,
    sound:'D wie in „danke“.', de:'genau wie deutsches d', ex:{ar:'دار', tr:'dār', de:'Haus, Hof'} },
  { id:'l09', name:'Dhāl',  ar:'ذ', iso:'ذ', ini:'ذ',  med:'ـذ',  fin:'ـذ', tr:'dh', connects:false,
    sound:'Englisches „th“ in „this“ — im Libanesischen meist d oder z.',
    de:'im Dialekt: d (هيدا hayda „dieser“)', ex:{ar:'دهب', tr:'dahab', de:'Gold (statt ذهب)'} },
  { id:'l10', name:'Rāʾ',   ar:'ر', iso:'ر', ini:'ر',  med:'ـر',  fin:'ـر', tr:'r', connects:false,
    sound:'Gerolltes Zungenspitzen-R.', de:'bayrisches/italienisches r — nicht das deutsche Rachen-r', ex:{ar:'رايح', tr:'rāyeḥ', de:'gehend, unterwegs'} },
  { id:'l11', name:'Zāy',   ar:'ز', iso:'ز', ini:'ز',  med:'ـز',  fin:'ـز', tr:'z', connects:false,
    sound:'Stimmhaftes S wie in „Sonne“.', de:'wie deutsches s in „Rose“', ex:{ar:'زغير', tr:'zghīr', de:'klein'} },
  { id:'l12', name:'Sīn',   ar:'س', iso:'س', ini:'سـ', med:'ـسـ', fin:'ـس', tr:'s', connects:true,
    sound:'Scharfes S wie in „Bus“.', de:'wie ß', ex:{ar:'سلام', tr:'salām', de:'Frieden, Gruß'} },
  { id:'l13', name:'Shīn',  ar:'ش', iso:'ش', ini:'شـ', med:'ـشـ', fin:'ـش', tr:'sh', connects:true,
    sound:'Sch wie in „Schule“.', de:'ACHTUNG Umschrift: „sh“ = deutsches „sch“', ex:{ar:'شو', tr:'shu', de:'was'} },
  { id:'l14', name:'Ṣād',   ar:'ص', iso:'ص', ini:'صـ', med:'ـصـ', fin:'ـص', tr:'ṣ (9)', connects:true,
    sound:'Emphatisches, dunkles S — Zunge flach, Klang „hohl“.',
    de:'s mit dunklem „o“-Beiklang', ex:{ar:'صباح', tr:'ṣabāḥ', de:'Morgen'} },
  { id:'l15', name:'Ḍād',   ar:'ض', iso:'ض', ini:'ضـ', med:'ـضـ', fin:'ـض', tr:'ḍ', connects:true,
    sound:'Emphatisches, dunkles D. Arabisch heißt „die Sprache des Ḍād“.',
    de:'d mit dunklem Beiklang', ex:{ar:'ضهر', tr:'ḍahr', de:'Rücken'} },
  { id:'l16', name:'Ṭāʾ',   ar:'ط', iso:'ط', ini:'طـ', med:'ـطـ', fin:'ـط', tr:'ṭ', connects:true,
    sound:'Emphatisches, dunkles T.', de:'t mit dunklem Beiklang', ex:{ar:'طيب', tr:'ṭayyeb', de:'gut, in Ordnung'} },
  { id:'l17', name:'Ẓāʾ',   ar:'ظ', iso:'ظ', ini:'ظـ', med:'ـظـ', fin:'ـظ', tr:'ẓ', connects:true,
    sound:'Emphatisches dunkles Z/D. Im Libanesischen fällt es meist mit ض zusammen.',
    de:'dunkles z', ex:{ar:'ظرف', tr:'ẓarf', de:'Umschlag'} },
  { id:'l18', name:'ʿAyn',  ar:'ع', iso:'ع', ini:'عـ', med:'ـعـ', fin:'ـع', tr:'3', connects:true,
    sound:'Der berühmte Kehlkopflaut: Kehle zusammendrücken und stimmhaft pressen.',
    de:'kein deutscher Laut — als würdest du beim Sprechen ein Gewicht heben', ex:{ar:'عربي', tr:'3arabe', de:'arabisch'} },
  { id:'l19', name:'Ghayn', ar:'غ', iso:'غ', ini:'غـ', med:'ـغـ', fin:'ـغ', tr:'gh', connects:true,
    sound:'Wie das deutsche Rachen-R in „Rat“ — gurgelnd.',
    de:'genau dein hochdeutsches r!', ex:{ar:'غالي', tr:'ghāli', de:'teuer'} },
  { id:'l20', name:'Fāʾ',   ar:'ف', iso:'ف', ini:'فـ', med:'ـفـ', fin:'ـف', tr:'f', connects:true,
    sound:'F wie in „Feuer“.', de:'wie deutsches f', ex:{ar:'فرن', tr:'fern', de:'Bäckerei, Ofen'} },
  { id:'l21', name:'Qāf',   ar:'ق', iso:'ق', ini:'قـ', med:'ـقـ', fin:'ـق', tr:'q → ʾ', connects:true,
    sound:'Hocharabisch ein K ganz hinten am Gaumen. IM LIBANESISCHEN: Knacklaut!',
    de:'★ Kesrouan: قهوة wird „ʾahwe“, قلب wird „ʾalb“', ex:{ar:'قهوة', tr:'ʾahwe', de:'Kaffee'} },
  { id:'l22', name:'Kāf',   ar:'ك', iso:'ك', ini:'كـ', med:'ـكـ', fin:'ـك', tr:'k', connects:true,
    sound:'K wie in „Kind“.', de:'wie deutsches k', ex:{ar:'كتير', tr:'ktīr', de:'viel, sehr'} },
  { id:'l23', name:'Lām',   ar:'ل', iso:'ل', ini:'لـ', med:'ـلـ', fin:'ـل', tr:'l', connects:true,
    sound:'L wie in „Land“.', de:'wie deutsches l', ex:{ar:'لبنان', tr:'Lubnēn', de:'Libanon (mit Imāla!)'} },
  { id:'l24', name:'Mīm',   ar:'م', iso:'م', ini:'مـ', med:'ـمـ', fin:'ـم', tr:'m', connects:true,
    sound:'M wie in „Mutter“.', de:'wie deutsches m', ex:{ar:'مرحبا', tr:'marḥaba', de:'hallo'} },
  { id:'l25', name:'Nūn',   ar:'ن', iso:'ن', ini:'نـ', med:'ـنـ', fin:'ـن', tr:'n', connects:true,
    sound:'N wie in „Nacht“.', de:'wie deutsches n', ex:{ar:'نحنا', tr:'neḥna', de:'wir'} },
  { id:'l26', name:'Hāʾ',   ar:'ه', iso:'ه', ini:'هـ', med:'ـهـ', fin:'ـه', tr:'h', connects:true,
    sound:'Normales, leichtes H wie in „Haus“.', de:'wie deutsches h', ex:{ar:'هون', tr:'hōn', de:'hier'} },
  { id:'l27', name:'Wāw',   ar:'و', iso:'و', ini:'و',  med:'ـو',  fin:'ـو', tr:'w / ū / ō', connects:false,
    sound:'W wie englisch „water“, oder langes U/O.', de:'englisches w, nicht deutsches w!', ex:{ar:'ولد', tr:'walad', de:'Junge'} },
  { id:'l28', name:'Yāʾ',   ar:'ي', iso:'ي', ini:'يـ', med:'ـيـ', fin:'ـي', tr:'y / ī / ē', connects:true,
    sound:'J wie in „ja“, oder langes I/E.', de:'ACHTUNG Umschrift: „y“ = deutsches „j“', ex:{ar:'يوم', tr:'yōm', de:'Tag'} }
];

DATA.specials = [
  { ar:'ء', name:'Hamza', tr:'ʾ', info:'Knacklaut wie in deutsch „be-achten“. Sitzt oft auf أ إ ؤ ئ.' },
  { ar:'ة', name:'Tāʾ marbūṭa', tr:'-a / -e', info:'Endung weiblicher Wörter. Im Libanesischen fast immer -e gesprochen: قهوة „ʾahwe“, مدرسة „madrase“. Nach dunklen Lauten -a: سيارة „sayyāra“.' },
  { ar:'ى', name:'Alif maqṣūra', tr:'-a', info:'Ein A am Wortende, geschrieben wie ein Yāʾ ohne Punkte: على „3ala“.' },
  { ar:'ال', name:'Artikel al-', tr:'el- / l-', info:'Der bestimmte Artikel. Vor „Sonnenbuchstaben“ (t,th,d,dh,r,z,s,sh,ṣ,ḍ,ṭ,ẓ,l,n) verschmilzt er: الشمس = „esh-shams“, nicht „el-shams“.' },
  { ar:'لا', name:'Lām-Alif', tr:'lā', info:'Pflicht-Ligatur: ل + ا wird immer zu لا zusammengeschrieben.' }
];

DATA.harakat = [
  { ar:'بَ', name:'Fatḥa',  tr:'a', info:'Kurzes a — Strich über dem Buchstaben.' },
  { ar:'بِ', name:'Kasra',  tr:'i', info:'Kurzes i — Strich unter dem Buchstaben.' },
  { ar:'بُ', name:'Ḍamma',  tr:'u', info:'Kurzes u — kleines Wāw über dem Buchstaben.' },
  { ar:'بْ', name:'Sukūn',  tr:'—', info:'Kein Vokal — der Buchstabe steht „nackt“.' },
  { ar:'بّ', name:'Shadda', tr:'bb', info:'Verdoppelung. Wichtig: محمّد „Muḥammad“, بدّي „baddi“.' },
  { ar:'بً', name:'Tanwīn', tr:'-an', info:'Endung -an, vor allem in Adverbien: شكراً „shukran“.' }
];

/* Arabizi / Chat-Alphabet — so schreiben Libanesen auf WhatsApp. */
DATA.arabizi = [
  { n:'2', ar:'ء / ق', info:'Hamza oder libanesisches Qāf: 2ahwe = Kaffee' },
  { n:'3', ar:'ع', info:'ʿAyn: 3am, 3arabe, ma3lesh' },
  { n:'5', ar:'خ', info:'Khāʾ (auch „kh“): 5alas = fertig' },
  { n:'7', ar:'ح', info:'Ḥāʾ: 7abibi, 7elu' },
  { n:'8', ar:'غ', info:'Ghayn (auch „gh“): 8ali = teuer' },
  { n:'9', ar:'ص', info:'Ṣād: 9aba7 el 5eir' },
  { n:'6', ar:'ط', info:'Ṭāʾ: 6ayeb = ok' }
];
