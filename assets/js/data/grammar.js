/* Grammatik des libanesischen Arabisch — als Nachschlagewerk, nicht zum Auswendiglernen.
   Jede Lektion: title, tag, intro, blocks (table | note | examples), quiz (optional). */
var DATA = window.DATA || {};

DATA.grammar = [
{ id:'g01', title:'Der Kesrouan-Klang', tag:'Aussprache', level:1,
  intro:'Bevor du irgendetwas lernst: Diese fünf Regeln verwandeln Hocharabisch in das, was in Rayfoun und Jounieh gesprochen wird. Wenn du sie beherrschst, klingst du sofort einheimisch.',
  blocks:[
   {type:'table', head:['Regel','Hocharabisch','Kesrouan','Beispiel'], rows:[
     ['ق wird zum Knacklaut','qahwa','ʾahwe','قهوة — „ahwe“ mit Stocken davor'],
     ['Imāla: ā wird zu ē','bāb, lubnān, kān','bēb, Lubnēn, kēn','★ Das Erkennungszeichen des Bergs'],
     ['ة am Ende wird -e','madrasa','madrase','außer nach dunklen Lauten: sayyāra'],
     ['ث wird t','thalātha','tlēte','drei'],
     ['ذ wird d','hādha','hayda','dieser']
   ]},
   {type:'note', text:'★ Die Imāla ist der Unterschied zwischen Beirut und dem Berg. In Beirut hörst du eher „bāb“, in Kesrouan „bēb“. Beides ist richtig — aber „bēb“ verortet dich sofort oben bei euch.'},
   {type:'note', text:'Merkhilfe für die Umschrift in dieser App: sh = deutsch „sch“, y = deutsch „j“, j = französisch „j“ wie in Journal, 3 = ع (Kehlpressen), ḥ = ح (scharfes Hauch-H), kh = ch wie in „Bach“, gh = das deutsche Rachen-r.'}
  ]},

{ id:'g02', title:'Personalpronomen', tag:'Grundlagen', level:1,
  intro:'Acht Formen — im Libanesischen gibt es keinen Dual und keine eigenen weiblichen Pluralformen. Das macht es leichter als Hocharabisch.',
  blocks:[
   {type:'table', head:['Deutsch','Arabisch','Umschrift'], rows:[
     ['ich','أنا','ana'],['du (m)','إنت','enta'],['du (f)','إنتي','enti'],
     ['er','هو','huwwe'],['sie','هي','hiyye'],
     ['wir','نحنا','neḥna'],['ihr','إنتو','ento'],['sie (Pl.)','هنّي','henne']
   ]},
   {type:'note', text:'„sein“ gibt es im Präsens nicht: أنا منيح = „ich gut“ = mir geht es gut. Kein Verb nötig.'},
   {type:'examples', items:[
     {ar:'أنا من ألمانيا',tr:'ana men Almānya',de:'Ich bin aus Deutschland.'},
     {ar:'هي مرتي',tr:'hiyye marte',de:'Sie ist meine Frau.'},
     {ar:'نحنا من الريفون',tr:'neḥna men Rayfūn',de:'Wir sind aus Rayfoun.'}
   ]},
   {type:'quiz', q:'Wie sagst du „wir“?', options:['neḥna','ento','henne','huwwe'], a:0}
  ]},

{ id:'g03', title:'Possessivsuffixe — mein, dein, sein', tag:'Grundlagen', level:1,
  intro:'Besitz wird angehängt, nicht davorgestellt. Ein Suffix pro Person — und es funktioniert bei Nomen, Präpositionen und sogar bei „wollen“ und „haben“.',
  blocks:[
   {type:'table', head:['Person','Suffix','بيت (Haus)','Bedeutung'], rows:[
     ['ich','ـي / ـe','بيتي bēte','mein Haus'],
     ['du (m)','ـَك -ak','بيتك bētak','dein Haus'],
     ['du (f)','ـِك -ik','بيتك bētik','dein Haus'],
     ['er','ـو -o','بيتو bēto','sein Haus'],
     ['sie','ـا -a','بيتا bēta','ihr Haus'],
     ['wir','ـنا -na','بيتنا bētna','unser Haus'],
     ['ihr','ـكن -kon','بيتكن bētkon','euer Haus'],
     ['sie (Pl.)','ـن -on','بيتن bēton','ihr Haus']
   ]},
   {type:'note', text:'★ Das gleiche Muster steckt in baddi (ich will), 3ende (ich habe), fīne (ich kann), ma3e (bei mir). Lerne es einmal, und du hast vier Konstruktionen gratis.'},
   {type:'examples', items:[
     {ar:'شو اسمك؟',tr:'shu esmak?',de:'Wie heißt du? (zum Mann)'},
     {ar:'هيدا كتابا',tr:'hayda ktēba',de:'Das ist ihr Buch.'},
     {ar:'سيارتن جديدة',tr:'sayyārton jdīde',de:'Ihr Auto (Pl.) ist neu.'}
   ]},
   {type:'quiz', q:'„dein Haus“ zu einer Frau gesagt:', options:['bētik','bētak','bēto','bētna'], a:0}
  ]},

{ id:'g04', title:'Das b-Präsens', tag:'Verben', level:2,
  intro:'Der wichtigste Unterschied zum Hocharabischen: Die Alltagsgegenwart bekommt ein b- vorgesetzt. Damit kannst du sofort über Gewohnheiten und Tatsachen reden.',
  blocks:[
   {type:'table', head:['Person','Präfix','شرب (trinken)','حكي (reden)'], rows:[
     ['ana','b-','بشرب beshrab','بحكي beḥke'],
     ['enta','bt-','بتشرب betshrab','بتحكي betḥke'],
     ['enti','bt- + -e','بتشربي betshrabe','بتحكي betḥke'],
     ['huwwe','by-','بيشرب byeshrab','بيحكي byeḥke'],
     ['hiyye','bt-','بتشرب betshrab','بتحكي betḥke'],
     ['neḥna','mn-','منشرب mneshrab','منحكي mneḥke'],
     ['ento','bt- + -u','بتشربوا betshrabu','بتحكوا betḥku'],
     ['henne','by- + -u','بيشربوا byeshrabu','بيحكوا byeḥku']
   ]},
   {type:'note', text:'★ Merke dir vor allem „mn-“ für wir — das ist typisch levantinisch und klingt sofort richtig: mnrūḥ (wir gehen), mnēkol (wir essen), mnshūfak (wir sehen dich).'},
   {type:'examples', items:[
     {ar:'بشرب قهوة كل صبح',tr:'beshrab ʾahwe kell ṣebeḥ',de:'Ich trinke jeden Morgen Kaffee.'},
     {ar:'بتحكي عربي؟',tr:'betḥke 3arabe?',de:'Sprichst du Arabisch?'},
     {ar:'منروح عالضيعة',tr:'mnrūḥ 3aḍ-ḍay3a',de:'Wir fahren ins Dorf.'}
   ]},
   {type:'quiz', q:'„wir gehen“ heißt:', options:['mnrūḥ','brūḥ','byrūḥ','btrūḥ'], a:0}
  ]},

{ id:'g05', title:'3am — genau jetzt', tag:'Verben', level:2,
  intro:'Für „ich bin gerade dabei“ setzt du einfach 3am vor das Verb. Das b- fällt dabei oft weg.',
  blocks:[
   {type:'table', head:['Form','Beispiel','Bedeutung'], rows:[
     ['3am + Verb','عم بتعلم 3am bet3allam','Ich lerne gerade'],
     ['3am + Verb (ohne b)','عم تعلم 3am t3allam','dieselbe Bedeutung'],
     ['Verneint','ما عم بفهم ma 3am befham','Ich verstehe gerade nicht']
   ]},
   {type:'examples', items:[
     {ar:'شو عم تعمل؟',tr:'shu 3am ta3mel?',de:'Was machst du gerade?'},
     {ar:'عم تشتي برا',tr:'3am tshette barra',de:'Draußen regnet es gerade.'},
     {ar:'عم نتعلم عربي سوا',tr:'3am net3allam 3arabe sawa',de:'Wir lernen gerade zusammen Arabisch.'}
   ]},
   {type:'quiz', q:'Wie sagst du „Ich esse gerade“?', options:['3am bēkol','raḥ ēkol','bēkol','akalet'], a:0}
  ]},

{ id:'g06', title:'raḥ / laḥ — Zukunft', tag:'Verben', level:2,
  intro:'Für alles, was noch kommt: raḥ (oder umgangssprachlich laḥ / ḥa) vor das Verb ohne b-.',
  blocks:[
   {type:'examples', items:[
     {ar:'رح روح عالبيت',tr:'raḥ rūḥ 3al-bēt',de:'Ich werde nach Hause gehen.'},
     {ar:'لح نشوفك بكرا',tr:'laḥ nshūfak bukra',de:'Wir sehen dich morgen.'},
     {ar:'رح تجي عالعرس؟',tr:'raḥ tije 3al-3ers?',de:'Kommst du zur Hochzeit?'},
     {ar:'ما رح قدر',tr:'ma raḥ ʾder',de:'Ich werde nicht können.'}
   ]},
   {type:'note', text:'Wichtig: Nach raḥ fällt das b- weg. Nicht „raḥ brūḥ“, sondern „raḥ rūḥ“.'},
   {type:'quiz', q:'Welcher Satz ist richtig?', options:['raḥ rūḥ','raḥ brūḥ','raḥ 3am rūḥ','raḥ mnrūḥ'], a:0}
  ]},

{ id:'g07', title:'Die Vergangenheit', tag:'Verben', level:2,
  intro:'Die Vergangenheit braucht keine Präfixe, nur Endungen. Grundform = „er hat gemacht“.',
  blocks:[
   {type:'table', head:['Person','Endung','كتب (schreiben)','راح (gehen)'], rows:[
     ['ana','-et','كتبت katabet','رحت reḥet'],
     ['enta','-et','كتبت katabet','رحت reḥet'],
     ['enti','-te','كتبتي katabte','رحتي reḥte'],
     ['huwwe','—','كتب katab','راح rāḥ'],
     ['hiyye','-et','كتبت katbet','راحت rāḥet'],
     ['neḥna','-na','كتبنا katabna','رحنا reḥna'],
     ['ento','-tu','كتبتوا katabtu','رحتوا reḥtu'],
     ['henne','-u','كتبوا katabu','راحوا rāḥu']
   ]},
   {type:'note', text:'„ana“ und „enta“ klingen gleich — der Zusammenhang klärt, wer gemeint ist. Notfalls das Pronomen dazusagen.'},
   {type:'examples', items:[
     {ar:'رحنا عحريصا مبارح',tr:'reḥna 3a Ḥarīṣa mbēreḥ',de:'Wir waren gestern in Harissa.'},
     {ar:'شو أكلتوا؟',tr:'shu akaltu?',de:'Was habt ihr gegessen?'}
   ]}
  ]},

{ id:'g08', title:'Verneinen', tag:'Grundlagen', level:2,
  intro:'Zwei Wörter reichen: ma vor Verben, mesh vor allem anderen.',
  blocks:[
   {type:'table', head:['Was','Wort','Beispiel'], rows:[
     ['Verben','ma','ما بعرف ma ba3ref — ich weiß nicht'],
     ['Nomen/Adjektive','mesh','مش منيح mesh mnīḥ — nicht gut'],
     ['es gibt nicht','ma fī','ما في وقت ma fī waʾet — keine Zeit'],
     ['haben nicht','ma 3ende','ما عندي مصاري ma 3ende maṣāre — ich habe kein Geld'],
     ['Verstärkt','ma …-sh','ما بعرفش ma ba3refsh — seltener im Libanon, eher ägyptisch']
   ]},
   {type:'examples', items:[
     {ar:'مش هيك',tr:'mesh hēk',de:'Nicht so.'},
     {ar:'ما بدي شي',tr:'ma baddi shī',de:'Ich will nichts.'},
     {ar:'هي مش هون',tr:'hiyye mesh hōn',de:'Sie ist nicht hier.'}
   ]},
   {type:'quiz', q:'„Ich bin nicht müde“:', options:['ana mesh ta3bēn','ana ma ta3bēn','ma ana ta3bēn','ana la ta3bēn'], a:0}
  ]},

{ id:'g09', title:'baddi, 3ende, fīne — die Suffixverben', tag:'Verben', level:2,
  intro:'Drei der häufigsten Ausdrücke sind gar keine Verben, sondern Wörter mit angehängten Personalsuffixen. Ein Muster, drei Bedeutungen.',
  blocks:[
   {type:'table', head:['Person','wollen','haben','können'], rows:[
     ['ana','بدي baddi','عندي 3ende','فيني fīne'],
     ['enta','بدك baddak','عندك 3endak','فيك fīk'],
     ['enti','بدك baddik','عندك 3endik','فيكي fīki'],
     ['huwwe','بدو baddo','عندو 3endo','فيه fī'],
     ['hiyye','بدا badda','عندا 3enda','فيها fīha'],
     ['neḥna','بدنا badna','عنا 3enna','فينا fīna'],
     ['ento','بدكن baddkon','عندكن 3endkon','فيكن fīkon'],
     ['henne','بدن baddon','عندن 3endon','فين fīhon']
   ]},
   {type:'examples', items:[
     {ar:'بدي قهوة لو سمحت',tr:'baddi ʾahwe law samaḥt',de:'Ich möchte einen Kaffee, bitte.'},
     {ar:'عندك ولاد؟',tr:'3endak wlēd?',de:'Hast du Kinder?'},
     {ar:'فيكي تحكي أبطأ؟',tr:'fīki teḥke abṭaʾ?',de:'Kannst du langsamer sprechen?'}
   ]},
   {type:'quiz', q:'„Sie möchte“ heißt:', options:['badda','baddo','baddak','badna'], a:0}
  ]},

{ id:'g10', title:'Es gibt: fī / ma fī', tag:'Grundlagen', level:1,
  intro:'Ein einziges Wörtchen für alle Formen von „es gibt“ — Singular wie Plural, Gegenwart wie Frage.',
  blocks:[
   {type:'examples', items:[
     {ar:'في ناس كتير',tr:'fī nēs ktīr',de:'Es sind viele Leute da.'},
     {ar:'ما في كهربا',tr:'ma fī kahraba',de:'Es gibt keinen Strom.'},
     {ar:'في حدا هون؟',tr:'fī ḥada hōn?',de:'Ist jemand hier?'},
     {ar:'كان في زحمة',tr:'kēn fī zaḥme',de:'Es war Stau. (Vergangenheit: kēn fī)'}
   ]},
   {type:'note', text:'Nicht verwechseln: „fī“ = es gibt, „fīk“ = du kannst, „fi“ als Präposition = in.'}
  ]},

{ id:'g11', title:'Demonstrativa — dieser, diese', tag:'Grundlagen', level:2,
  intro:'Drei Formen, mehr brauchst du nicht.',
  blocks:[
   {type:'table', head:['Form','Arabisch','Gebrauch'], rows:[
     ['männlich','هيدا hayda','hayda l-bēt — dieses Haus'],
     ['weiblich','هيدي haydi','haydi s-sayyāra — dieses Auto'],
     ['Plural','هيدول haydōl','haydōl el-wlēd — diese Kinder'],
     ['kurz vorangestellt','هال hal-','hal-walad — dieser Junge']
   ]},
   {type:'examples', items:[
     {ar:'شو هيدا؟',tr:'shu hayda?',de:'Was ist das?'},
     {ar:'هال قهوة زاكية',tr:'hal-ʾahwe zēkiye',de:'Dieser Kaffee ist lecker.'}
   ]}
  ]},

{ id:'g12', title:'Adjektive und ihre Angleichung', tag:'Grundlagen', level:2,
  intro:'Das Adjektiv steht hinter dem Nomen und passt sich an — weiblich bekommt -e, Plural bei Menschen -īn.',
  blocks:[
   {type:'table', head:['','männlich','weiblich','Plural (Menschen)'], rows:[
     ['groß','كبير kbīr','كبيرة kbīre','كبار kbār'],
     ['schön','حلو ḥelu','حلوة ḥelwe','حلوين ḥelwīn'],
     ['müde','تعبان ta3bēn','تعبانة ta3bēne','تعبانين ta3bēnīn']
   ]},
   {type:'note', text:'Bei Dingen im Plural steht das Adjektiv oft im weiblichen Singular: „byūt kbīre“ = große Häuser.'},
   {type:'note', text:'Mit Artikel muss beides den Artikel tragen: „el-bēt el-kbīr“ = das große Haus. Ohne Artikel am Adjektiv wird es ein Satz: „el-bēt kbīr“ = das Haus ist groß.'},
   {type:'quiz', q:'„Das Haus ist groß“ heißt:', options:['el-bēt kbīr','el-bēt el-kbīr','bēt el-kbīr','kbīr el-bēt'], a:0}
  ]},

{ id:'g13', title:'Der Artikel el- und die Sonnenbuchstaben', tag:'Aussprache', level:2,
  intro:'Der Artikel ist immer ال — aber gesprochen wird er oft ganz anders. Das ist der häufigste Aussprachefehler von Lernenden.',
  blocks:[
   {type:'note', text:'Vor den Sonnenbuchstaben (ت ث د ذ ر ز س ش ص ض ط ظ ل ن) verschwindet das „l“ und der folgende Buchstabe verdoppelt sich.'},
   {type:'table', head:['Geschrieben','Falsch','Richtig'], rows:[
     ['الشمس','el-shams','esh-shams (die Sonne)'],
     ['الطريق','el-ṭarīʾ','eṭ-ṭarīʾ (die Straße)'],
     ['الناس','el-nēs','en-nēs (die Leute)'],
     ['القمر','—','el-ʾamar (der Mond — Mondbuchstabe, bleibt)']
   ]},
   {type:'note', text:'Eselsbrücke: Sonne = shams = verschmilzt. Mond = ʾamar = bleibt.'}
  ]},

{ id:'g14', title:'Idafa — die Verbindung zweier Nomen', tag:'Aufbau', level:3,
  intro:'„Das Haus des Nachbarn“ hat kein „des“. Man stellt die Nomen einfach nebeneinander — nur das zweite bekommt den Artikel.',
  blocks:[
   {type:'examples', items:[
     {ar:'بيت الجار',tr:'bēt ej-jār',de:'das Haus des Nachbarn'},
     {ar:'مفتاح السيارة',tr:'meftēḥ es-sayyāra',de:'der Autoschlüssel'},
     {ar:'باب الكنيسة',tr:'bēb el-knīse',de:'die Kirchentür'}
   ]},
   {type:'note', text:'Alternative im Dialekt: taba3 = „von“. „el-bēt taba3 jāre“ = das Haus meines Nachbarn. Bequemer und sehr üblich, vor allem bei Fremdwörtern: „el-computer taba3e“.'},
   {type:'note', text:'★ Bei der Idafa bekommt das ERSTE Wort nie einen Artikel. „el-bēt ej-jār“ wäre falsch.'}
  ]},

{ id:'g15', title:'Der Plural', tag:'Aufbau', level:3,
  intro:'Arabisch bildet Plural meist durch Umbau des Wortinneren („gebrochener Plural“). Die muss man lernen — aber es gibt Muster.',
  blocks:[
   {type:'table', head:['Singular','Plural','Muster'], rows:[
     ['بيت bēt','بيوت byūt','Haus → Häuser'],
     ['ولد walad','ولاد wlēd','Kind → Kinder'],
     ['كتاب ktēb','كتب kteb','Buch → Bücher'],
     ['سيارة sayyāra','سيارات sayyārāt','regelmäßig weiblich: + āt'],
     ['معلم m3allem','معلمين m3allmīn','regelmäßig männlich (Menschen): + īn']
   ]},
   {type:'note', text:'Trost: Nach Zahlen ab 11 steht wieder der Singular. „khamstā3shar sene“ = fünfzehn Jahr(e).'}
  ]},

{ id:'g16', title:'Präpositionen mit Suffix', tag:'Aufbau', level:3,
  intro:'Präpositionen nehmen dieselben Suffixe wie Nomen — damit baust du halbe Sätze.',
  blocks:[
   {type:'table', head:['Präposition','Bedeutung','mit „mir/mich“'], rows:[
     ['مع ma3','mit','معي ma3e — bei mir'],
     ['عند 3end','bei','عندي 3ende — ich habe'],
     ['ل la-','für, zu','إلي ele — für mich'],
     ['من men','von, aus','مني menne — von mir'],
     ['على 3a / 3ala','auf, zu','علي 3alayye — auf mir'],
     ['ب bi-','in, mit','فيني fīne — in mir / ich kann'],
     ['بدون bidūn','ohne','بدوني bidūne — ohne mich']
   ]},
   {type:'examples', items:[
     {ar:'رايح عالبيت',tr:'rāyeḥ 3al-bēt',de:'Ich gehe nach Hause. (3a + el = 3al)'},
     {ar:'جاي معي؟',tr:'jēye ma3e?',de:'Kommst du mit mir?'}
   ]}
  ]},

{ id:'g17', title:'Der Imperativ', tag:'Verben', level:3,
  intro:'Befehle und Bitten: einfach das b- weglassen und das Präfix streichen.',
  blocks:[
   {type:'table', head:['Verb','du (m)','du (f)','ihr'], rows:[
     ['gehen','روح rūḥ','روحي rūḥe','روحوا rūḥu'],
     ['kommen','تعا ta3a','تعي ta3e','تعوا ta3u'],
     ['schauen','شوف shūf','شوفي shūfe','شوفوا shūfu'],
     ['warten','استنى stanna','استني stanne','استنوا stannu'],
     ['nicht tun','ما تروح ma trūḥ','ما تروحي ma trūḥe','ما تروحوا ma trūḥu']
   ]},
   {type:'note', text:'Ein „law samaḥt“ oder ein angehängtes „ḥabībe“ macht jeden Befehl höflich.'},
   {type:'examples', items:[
     {ar:'تعا لهون!',tr:'ta3a la-hōn!',de:'Komm her!'},
     {ar:'ما تنسى',tr:'ma tensa',de:'Vergiss nicht.'}
   ]}
  ]},

{ id:'g18', title:'Vergleich und Superlativ', tag:'Aufbau', level:3,
  intro:'Ein Muster für „größer“, ein Trick für „am größten“.',
  blocks:[
   {type:'table', head:['Adjektiv','Komparativ','Beispiel'], rows:[
     ['كبير kbīr (groß)','أكبر akbar','أكبر من akbar men — größer als'],
     ['حلو ḥelu (schön)','أحلى aḥla','أحلى من aḥla men'],
     ['كتير ktīr (viel)','أكتر aktar','أكتر من aktar men'],
     ['منيح mnīḥ (gut)','أحسن aḥsan','أحسن من aḥsan men']
   ]},
   {type:'note', text:'Superlativ: Komparativ + Nomen ohne Artikel. „aḥla manẓar“ = die schönste Aussicht. Oder: „el-aḥla“ = die/der schönste.'},
   {type:'examples', items:[
     {ar:'جونيه أحلى من بيروت',tr:'Jūniyye aḥla men Bayrūt',de:'Jounieh ist schöner als Beirut.'},
     {ar:'هيدا أحسن شي',tr:'hayda aḥsan shī',de:'Das ist das Beste.'}
   ]}
  ]},

{ id:'g19', title:'Arabizi — Arabisch mit Zahlen schreiben', tag:'Schrift', level:2,
  intro:'Auf WhatsApp schreiben Libanesen ihren Dialekt meist lateinisch — mit Zahlen für die Laute, die es im Lateinischen nicht gibt. Wenn du mit Verwandten schreibst, brauchst du das.',
  blocks:[
   {type:'table', head:['Zahl','Buchstabe','Warum','Beispiel'], rows:[
     ['2','ء / ق','sieht aus wie ein Hamza','2ahwe = Kaffee'],
     ['3','ع','gespiegeltes ع','3am, 3arabe'],
     ['5','خ','auch „kh“','5alas = fertig'],
     ['7','ح','sieht aus wie ح','7abibi, 7elu'],
     ['8','غ','auch „gh“','8ali = teuer'],
     ['9','ص','sieht aus wie ص','9aba7 el 5eir'],
     ['6','ط','sieht aus wie ط','6ayeb = ok']
   ]},
   {type:'note', text:'Diese App zeigt dir zu jedem Wort beide Schreibweisen: echtes Arabisch und Arabizi. So kannst du lesen, was in der Familiengruppe geschrieben wird — und selbst mitschreiben.'}
  ]},

{ id:'g20', title:'Sätze bauen — die Reihenfolge', tag:'Aufbau', level:3,
  intro:'Zum Schluss das Baukastenprinzip: So setzt sich ein libanesischer Satz zusammen.',
  blocks:[
   {type:'table', head:['Bauteil','Position','Beispiel'], rows:[
     ['Zeitangabe','oft vorn','بكرا bukra …'],
     ['Subjekt','vor dem Verb (Dialekt!)','أنا ana …'],
     ['Zeitpartikel','vor dem Verb','عم 3am / رح raḥ'],
     ['Verb','Mitte','بروح brūḥ'],
     ['Ort/Ziel','hinten','عالضيعة 3aḍ-ḍay3a']
   ]},
   {type:'examples', items:[
     {ar:'بكرا أنا رح روح عالضيعة مع مرتي',tr:'bukra ana raḥ rūḥ 3aḍ-ḍay3a ma3 marte',de:'Morgen werde ich mit meiner Frau ins Dorf fahren.'},
     {ar:'اليوم عم نتعلم عربي سوا بالبيت',tr:'el-yōm 3am net3allam 3arabe sawa bel-bēt',de:'Heute lernen wir zu Hause zusammen Arabisch.'}
   ]},
   {type:'note', text:'Anders als im Hocharabischen steht das Subjekt im Dialekt meistens VOR dem Verb — genau wie im Deutschen. Das macht dir den Einstieg leichter.'}
  ]}
];
