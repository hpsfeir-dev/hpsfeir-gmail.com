/* Dialoge aus dem Alltag in Kesrouan — Jounieh, Rayfoun, Harissa, Faraya. */
var DATA = window.DATA || {};

DATA.dialogues = [
{ id:'d01', title:'Beim Bäcker in Jounieh', icon:'🫓', level:1,
  scene:'Samstagmorgen, der fern im Viertel. Du holst Manouche für euch beide.',
  lines:[
   {s:'A',who:'Bäcker',ar:'صباح الخير! شو بتحب؟',tr:'ṣabāḥ el-khēr! shu betḥebb?',de:'Guten Morgen! Was hätten Sie gern?'},
   {s:'B',who:'Du',ar:'صباح النور. تنتين منقوشة زعتر لو سمحت.',tr:'ṣabāḥ en-nūr. tentēn manʾūshe za3tar law samaḥt.',de:'Guten Morgen. Zwei Manouche mit Zaatar, bitte.'},
   {s:'A',who:'Bäcker',ar:'بدك عليها بندورة وكزبرة؟',tr:'baddak 3alayha banadūra w kezbra?',de:'Möchten Sie Tomate und Koriander darauf?'},
   {s:'B',who:'Du',ar:'إيه، وكمان وحدة لبنة لمرتي.',tr:'ē, w kamēn waḥde labne la-marte.',de:'Ja, und noch eine mit Labneh für meine Frau.'},
   {s:'A',who:'Bäcker',ar:'حاضر. دقيقتين وبتكون جاهزة.',tr:'ḥāḍer. daʾīʾtēn w betkūn jēhze.',de:'Sofort. Zwei Minuten, dann ist sie fertig.'},
   {s:'B',who:'Du',ar:'قديش الحساب؟',tr:'ʾaddēsh el-ḥsēb?',de:'Wie viel macht das?'},
   {s:'A',who:'Bäcker',ar:'تفضل. صحتين!',tr:'tfaḍḍal. ṣaḥtēn!',de:'Bitte sehr. Guten Appetit!'},
   {s:'B',who:'Du',ar:'يسلمو، الله يعطيك العافية.',tr:'yislamo, alla ya3ṭīk el-3āfye.',de:'Danke, Gott gebe Ihnen Kraft.'}
  ],
  focus:['v130','v131','v132','v434','v153','v275']},

{ id:'d02', title:'Service-Taxi nach Rayfoun', icon:'🚕', level:2,
  scene:'Unten in Jounieh an der Straße. Du willst hoch ins Dorf.',
  lines:[
   {s:'B',who:'Du',ar:'سرفيس! عالريفون؟',tr:'servīs! 3a Rayfūn?',de:'Service! Nach Rayfoun?'},
   {s:'A',who:'Fahrer',ar:'إيه، تفضل. بس عم صعد لحد الضهر.',tr:'ē, tfaḍḍal. bass 3am ṣ3ad la-ḥadd eḍ-ḍaher.',de:'Ja, steig ein. Ich fahre aber nur bis zum Bergrücken hoch.'},
   {s:'B',who:'Du',ar:'ماشي. قديش السرفيس؟',tr:'mēshe. ʾaddēsh es-servīs?',de:'In Ordnung. Was kostet die Fahrt?'},
   {s:'A',who:'Fahrer',ar:'سرفيسين. الطريق طالعة وفي زحمة.',tr:'servīsēn. eṭ-ṭarīʾ ṭāl3a w fī zaḥme.',de:'Doppelter Preis. Es geht bergauf und es ist Stau.'},
   {s:'B',who:'Du',ar:'طيب. فيك تنزلني عند الكنيسة؟',tr:'ṭayyeb. fīk tnazzelne 3end el-knīse?',de:'Gut. Können Sie mich an der Kirche rauslassen?'},
   {s:'A',who:'Fahrer',ar:'أكيد. إنت ساكن هون؟',tr:'akīd. enta sēken hōn?',de:'Klar. Wohnen Sie hier?'},
   {s:'B',who:'Du',ar:'عيلة مرتي من هون. نحنا جايين كل صيف.',tr:'3ēlet marte men hōn. neḥna jēyīn kell ṣēf.',de:'Die Familie meiner Frau ist von hier. Wir kommen jeden Sommer.'},
   {s:'A',who:'Fahrer',ar:'أهلا وسهلا فيك بضيعتنا!',tr:'ahla w sahla fīk bi-ḍay3etna!',de:'Herzlich willkommen in unserem Dorf!'}
  ],
  focus:['v240','v243','v263','v247','v261','v218']},

{ id:'d03', title:'Kaffee bei den Nachbarn', icon:'☕', level:2,
  scene:'Ihr werdet spontan hereingebeten. Das passiert in der ḍay3a ständig.',
  lines:[
   {s:'A',who:'Nachbarin',ar:'تفضلوا، تفضلوا! ما بيصير تمرقوا وما تفوتوا.',tr:'tfaḍḍalu, tfaḍḍalu! ma biṣīr temerʾu w ma tfūtu.',de:'Kommt herein! Ihr könnt doch nicht vorbeigehen, ohne hereinzukommen.'},
   {s:'B',who:'Du',ar:'ولو تانت، ما بدنا نتعبك.',tr:'walaw tante, ma badna nt3ebik.',de:'Aber Tante, wir wollen keine Umstände machen.'},
   {s:'A',who:'Nachbarin',ar:'شو تعب! القهوة عالنار. بتشربوا قهوة ولا شي بارد؟',tr:'shu ta3ab! el-ʾahwe 3an-nār. betshrabu ʾahwe wella shī bāred?',de:'Was für Umstände! Der Kaffee ist auf dem Feuer. Trinkt ihr Kaffee oder etwas Kaltes?'},
   {s:'B',who:'Du',ar:'قهوة، الله يخليكي.',tr:'ʾahwe, alla ykhallīki.',de:'Kaffee, Gott erhalte Sie.'},
   {s:'A',who:'Nachbarin',ar:'ومرتك؟ عم تتعلم عربي، سمعت؟',tr:'w martak? 3am tet3allam 3arabe, sme3et?',de:'Und deine Frau? Sie lernt Arabisch, habe ich gehört?'},
   {s:'B',who:'Du',ar:'إيه، عم نتعلم سوا. بس شوي شوي.',tr:'ē, 3am net3allam sawa. bass shwayy shwayy.',de:'Ja, wir lernen zusammen. Aber langsam, langsam.'},
   {s:'A',who:'Nachbarin',ar:'عال العال! بتحكي منيح، والله.',tr:'3āl el-3āl! betḥke mnīḥ, walla.',de:'Ausgezeichnet! Du sprichst gut, wirklich.'},
   {s:'B',who:'Du',ar:'يسلمو، هيدا من ذوقك.',tr:'yislamo, hayda men zōʾik.',de:'Danke, das ist Ihre Freundlichkeit.'}
  ],
  focus:['v019','v077','v127','v380','v447','v448','v442']},

{ id:'d04', title:'Sonntagsessen bei der Familie', icon:'🍽️', level:3,
  scene:'Nach der Messe, großer Tisch, alle reden gleichzeitig.',
  lines:[
   {s:'A',who:'Schwiegermutter',ar:'يلا عالطاولة! الأكل عم يبرد.',tr:'yalla 3aṭ-ṭāwle! el-akel 3am yebrad.',de:'Los, an den Tisch! Das Essen wird kalt.'},
   {s:'B',who:'Du',ar:'شو هالمزة! كل شي بيتي؟',tr:'shu hal-mezze! kell shī bēte?',de:'Was für eine Mezze! Ist alles selbstgemacht?'},
   {s:'A',who:'Schwiegermutter',ar:'أكيد. التبولة قطفتا من الجنينة الصبح.',tr:'akīd. et-tabbūle ʾṭaftā men ej-jnēne eṣ-ṣebeḥ.',de:'Natürlich. Das Tabbouleh habe ich heute Morgen aus dem Garten geerntet.'},
   {s:'B',who:'Du',ar:'يسلمو إيديكي. زاكي كتير.',tr:'yislamo ʾidēki. zēke ktīr.',de:'Gesegnet seien Ihre Hände. Sehr lecker.'},
   {s:'A',who:'Schwiegermutter',ar:'كول كمان! ما أكلت شي.',tr:'kōl kamēn! ma akalet shī.',de:'Iss noch mehr! Du hast ja nichts gegessen.'},
   {s:'B',who:'Du',ar:'والله شبعان، ما فيني كمان.',tr:'walla shab3ēn, ma fīne kamēn.',de:'Ehrlich, ich bin satt, ich kann nicht mehr.'},
   {s:'A',who:'Schwiegermutter',ar:'لقمة زغيرة بس! عيب.',tr:'loʾme zghīre bass! 3ēb.',de:'Nur einen kleinen Bissen! Das gehört sich so.'},
   {s:'B',who:'Du',ar:'خلص، على راسي. بس هيدي الأخيرة!',tr:'khalaṣ, 3ala rāse. bass haydi l-akhīre!',de:'Also gut, sehr gern. Aber das ist die letzte!'}
  ],
  focus:['v136','v135','v149','v152','v015','v440','v446']},

{ id:'d05', title:'Schnee in Faraya', icon:'🏔️', level:3,
  scene:'Winterwochenende oben am Berg.',
  lines:[
   {s:'B',who:'Du',ar:'شو الطقس اليوم؟ في تلج؟',tr:'shu eṭ-ṭaʾes el-yōm? fī talej?',de:'Wie ist das Wetter heute? Liegt Schnee?'},
   {s:'A',who:'Freund',ar:'في كتير! نزل تلج طول الليل.',tr:'fī ktīr! nezel talej ṭūl el-lēl.',de:'Ganz viel! Es hat die ganze Nacht geschneit.'},
   {s:'B',who:'Du',ar:'الطريق مفتوحة عفاريا؟',tr:'eṭ-ṭarīʾ meftūḥa 3a Fārayya?',de:'Ist die Straße nach Faraya offen?'},
   {s:'A',who:'Freund',ar:'إيه بس لازم سلاسل. شوف الطقس قبل ما تطلع.',tr:'ē bass lēzem salēsel. shūf eṭ-ṭaʾes ʾabel ma teṭla3.',de:'Ja, aber du brauchst Ketten. Schau aufs Wetter, bevor du hochfährst.'},
   {s:'B',who:'Du',ar:'كتير برد؟',tr:'ktīr bared?',de:'Ist es sehr kalt?'},
   {s:'A',who:'Freund',ar:'تحت الصفر. خود مانطو وشال.',tr:'taḥt eṣ-ṣefr. khod manteau w shāl.',de:'Unter null. Nimm Mantel und Schal mit.'},
   {s:'B',who:'Du',ar:'ماشي. منشوفك هنيك الساعة عشرة.',tr:'mēshe. mnshūfak hunīk es-sē3a 3ashra.',de:'Alles klar. Wir sehen dich dort um zehn.'},
   {s:'A',who:'Freund',ar:'يلا، بشوفكن! خدوا بالكن عالطريق.',tr:'yalla, bshūfkon! khodu bēlkon 3aṭ-ṭarīʾ.',de:'Los, bis dann! Passt auf der Straße auf.'}
  ],
  focus:['v330','v333','v335','v398','v242','v261']},

{ id:'d06', title:'Sich vorstellen', icon:'🙋', level:1,
  scene:'Du triffst jemanden zum ersten Mal — auf einer Feier in Jounieh.',
  lines:[
   {s:'A',who:'Er',ar:'مرحبا، أنا شربل. وإنت؟',tr:'marḥaba, ana Sharbel. w enta?',de:'Hallo, ich bin Charbel. Und du?'},
   {s:'B',who:'Du',ar:'أهلا شربل. أنا من ألمانيا، بس مرتي لبنانية.',tr:'ahla Sharbel. ana men Almānya, bass marte lebnēniyye.',de:'Hallo Charbel. Ich bin aus Deutschland, aber meine Frau ist Libanesin.'},
   {s:'A',who:'Er',ar:'عن جد؟ من وين بالضبط؟',tr:'3an jadd? men wēn beḍ-ḍabṭ?',de:'Wirklich? Woher genau?'},
   {s:'B',who:'Du',ar:'عيلتا من الريفون، بكسروان.',tr:'3ēletā men Rayfūn, bi-Kesrwēn.',de:'Ihre Familie ist aus Rayfoun, im Kesrouan.'},
   {s:'A',who:'Er',ar:'ولك جيران! وكيف عم تتعلم عربي؟',tr:'walak jīrān! w kīf 3am tet3allam 3arabe?',de:'Wir sind ja Nachbarn! Und wie lernst du Arabisch?'},
   {s:'B',who:'Du',ar:'عم إتعلم مع مرتي. عم قرا وكتب كمان.',tr:'3am et3allam ma3 marte. 3am ʾra w ekteb kamēn.',de:'Ich lerne mit meiner Frau. Ich lerne auch lesen und schreiben.'},
   {s:'A',who:'Er',ar:'برافو عليك! هيدا صعب.',tr:'bravo 3alēk! hayda ṣa3eb.',de:'Bravo! Das ist schwer.'},
   {s:'B',who:'Du',ar:'شوي شوي بتصير. المهم نحكي.',tr:'shwayy shwayy betṣīr. el-mhemm neḥke.',de:'Nach und nach klappt es. Hauptsache, man redet.'}
  ],
  focus:['v086','v033','v212','v213','v214','v447']},

{ id:'d07', title:'Im Restaurant', icon:'🍷', level:2,
  scene:'Abendessen am Hafen von Jounieh.',
  lines:[
   {s:'A',who:'Kellner',ar:'مسا الخير، تفضلوا. طاولة لتنين؟',tr:'masa el-khēr, tfaḍḍalu. ṭāwle la-tnēn?',de:'Guten Abend, bitte sehr. Ein Tisch für zwei?'},
   {s:'B',who:'Du',ar:'إيه، لو سمحت. في شي طاولة عالبحر؟',tr:'ē, law samaḥt. fī shī ṭāwle 3al-baḥer?',de:'Ja bitte. Gibt es einen Tisch zum Meer?'},
   {s:'A',who:'Kellner',ar:'أكيد. شو بتشربوا؟',tr:'akīd. shu betshrabu?',de:'Natürlich. Was möchten Sie trinken?'},
   {s:'B',who:'Du',ar:'مي وعرق، ومزة لتنين.',tr:'mayy w 3araʾ, w mezze la-tnēn.',de:'Wasser und Arak, und Mezze für zwei.'},
   {s:'A',who:'Kellner',ar:'بتحبوا سمك كمان؟ اليوم طازة.',tr:'betḥebbu samak kamēn? el-yōm ṭāza.',de:'Möchten Sie auch Fisch? Er ist heute frisch.'},
   {s:'B',who:'Du',ar:'شو بتنصحنا؟',tr:'shu betenṣaḥna?',de:'Was empfehlen Sie uns?'},
   {s:'A',who:'Kellner',ar:'السلطان إبراهيم، ما في أطيب.',tr:'es-sulṭān Ibrāhīm, ma fī aṭyab.',de:'Die Meerbarbe, es gibt nichts Besseres.'},
   {s:'B',who:'Du',ar:'خلص، عليها. والحساب بعدين لو سمحت.',tr:'khalaṣ, 3alayha. wel-ḥsēb ba3dēn law samaḥt.',de:'Gut, nehmen wir. Und die Rechnung später, bitte.'}
  ],
  focus:['v154','v140','v137','v136','v275','v246']},

{ id:'d08', title:'Beim Arzt', icon:'🩺', level:3,
  scene:'Du fühlst dich seit zwei Tagen nicht gut.',
  lines:[
   {s:'A',who:'Arzt',ar:'شو في؟ شو عم توجعك؟',tr:'shu fī? shu 3am tūja3ak?',de:'Was ist los? Was tut Ihnen weh?'},
   {s:'B',who:'Du',ar:'عندي وجع راس وحرارة من يومين.',tr:'3ende waja3 rās w ḥarāra men yōmēn.',de:'Ich habe Kopfschmerzen und Fieber seit zwei Tagen.'},
   {s:'A',who:'Arzt',ar:'في وجع بالزلعوم كمان؟',tr:'fī waja3 bez-zal3ūm kamēn?',de:'Haben Sie auch Halsschmerzen?'},
   {s:'B',who:'Du',ar:'شوي. وما فيني نام منيح.',tr:'shwayy. w ma fīne nēm mnīḥ.',de:'Ein bisschen. Und ich kann nicht gut schlafen.'},
   {s:'A',who:'Arzt',ar:'ما تخاف، شي بسيط. رح كتبلك دوا.',tr:'ma tkhāf, shī basīṭ. raḥ ketbellak dawa.',de:'Keine Sorge, nichts Ernstes. Ich verschreibe Ihnen ein Medikament.'},
   {s:'B',who:'Du',ar:'قديش لازم آخدو؟',tr:'ʾaddēsh lēzem ēkhdo?',de:'Wie oft muss ich es nehmen?'},
   {s:'A',who:'Arzt',ar:'تلات مرات باليوم، بعد الأكل.',tr:'tlēt marrāt bel-yōm, ba3d el-akel.',de:'Dreimal am Tag, nach dem Essen.'},
   {s:'B',who:'Du',ar:'مرسي كتير حكيم.',tr:'merci ktīr ḥakīm.',de:'Vielen Dank, Herr Doktor.'},
   {s:'A',who:'Arzt',ar:'سلامتك.',tr:'salēmtak.',de:'Gute Besserung.'}
  ],
  focus:['v317','v318','v320','v321','v323','v220']},

{ id:'d09', title:'Zu zweit zu Hause', icon:'❤️', level:2,
  scene:'Abends auf dem Balkon — ihr übt euer Arabisch miteinander.',
  lines:[
   {s:'A',who:'Sie',ar:'حبيبي، شو عملت اليوم؟',tr:'ḥabībe, shu 3melet el-yōm?',de:'Schatz, was hast du heute gemacht?'},
   {s:'B',who:'Du',ar:'اشتغلت كتير. وإنتي؟',tr:'shteghalet ktīr. w enti?',de:'Ich habe viel gearbeitet. Und du?'},
   {s:'A',who:'Sie',ar:'حكيت مع إمي عالتلفون ساعة!',tr:'ḥkīt ma3 emme 3at-telefōn sē3a!',de:'Ich habe eine Stunde mit meiner Mutter telefoniert!'},
   {s:'B',who:'Du',ar:'كيفا؟ مشتقلا.',tr:'kīfa? meshtēʾlā.',de:'Wie geht es ihr? Ich vermisse sie.'},
   {s:'A',who:'Sie',ar:'منيحة. بتسلم عليك كتير.',tr:'mnīḥa. betsallem 3alēk ktīr.',de:'Gut. Sie lässt dich herzlich grüßen.'},
   {s:'B',who:'Du',ar:'بدنا نروح عالضيعة الصيف الجاي.',tr:'badna nrūḥ 3aḍ-ḍay3a eṣ-ṣēf ej-jēy.',de:'Wir sollten nächsten Sommer ins Dorf fahren.'},
   {s:'A',who:'Sie',ar:'يا ريت! بس لازم تحكي عربي طول الوقت.',tr:'ya rēt! bass lēzem teḥke 3arabe ṭūl el-waʾet.',de:'Wenn das ginge! Aber dann musst du die ganze Zeit Arabisch sprechen.'},
   {s:'B',who:'Du',ar:'منتعلم سوا. بحبك.',tr:'mnet3allam sawa. bḥebbik.',de:'Wir lernen zusammen. Ich liebe dich.'}
  ],
  focus:['v085','v295','v380','v370','v436','v217']},

{ id:'d10', title:'Auf dem Markt handeln', icon:'🛒', level:3,
  scene:'Gemüsestand — der Preis ist immer Verhandlungssache.',
  lines:[
   {s:'A',who:'Händler',ar:'تفضل! تفاح من الجرد، حلو كتير.',tr:'tfaḍḍal! teffēḥ men ej-jerd, ḥelu ktīr.',de:'Bitte sehr! Äpfel aus den Bergen, sehr gut.'},
   {s:'B',who:'Du',ar:'قديش الكيلو؟',tr:'ʾaddēsh el-kīlo?',de:'Was kostet das Kilo?'},
   {s:'A',who:'Händler',ar:'بس هالسعر، رخيص والله.',tr:'bass has-se3er, rkhīṣ walla.',de:'Nur dieser Preis, wirklich billig.'},
   {s:'B',who:'Du',ar:'غالي شوي. بتنزل شي؟',tr:'ghāle shwayy. betnazzel shī?',de:'Etwas teuer. Geht da noch was?'},
   {s:'A',who:'Händler',ar:'لأنك جار، منزلك شوي. تاخد تلات كيلو؟',tr:'la-annak jār, mnnazzellak shwayy. tēkhod tlēt kīlo?',de:'Weil du Nachbar bist, mache ich dir einen Preis. Nimmst du drei Kilo?'},
   {s:'B',who:'Du',ar:'خلص، تنين. وشو هول؟',tr:'khalaṣ, tnēn. w shu hōl?',de:'Gut, zwei. Und was ist das da?'},
   {s:'A',who:'Händler',ar:'كزبرة وبقدونس. بحطلك شوي هدية.',tr:'kezbra w baʾdūnes. bḥeṭṭellak shwayy hdiyye.',de:'Koriander und Petersilie. Ich lege dir etwas dazu, geschenkt.'},
   {s:'B',who:'Du',ar:'الله يعطيك العافية! يسلمو.',tr:'alla ya3ṭīk el-3āfye! yislamo.',de:'Gott gebe dir Kraft! Danke dir.'}
  ],
  focus:['v270','v271','v272','v144','v419','v434']},

{ id:'d11', title:'Am Telefon', icon:'📞', level:2,
  scene:'Kurzer Anruf — Telefonate haben eigene Formeln.',
  lines:[
   {s:'A',who:'Er',ar:'ألو؟',tr:'alō?',de:'Hallo?'},
   {s:'B',who:'Du',ar:'ألو، مرحبا. مين معي؟',tr:'alō, marḥaba. mīn ma3e?',de:'Hallo, guten Tag. Mit wem spreche ich?'},
   {s:'A',who:'Er',ar:'أنا طوني. مين عم بيحكي؟',tr:'ana Ṭōni. mīn 3am byeḥke?',de:'Ich bin Tony. Wer spricht?'},
   {s:'B',who:'Du',ar:'أهلين طوني! كيفك؟ ما عرفت صوتك.',tr:'ahlēn Ṭōni! kīfak? ma 3reft ṣōtak.',de:'Hallo Tony! Wie geht’s? Ich habe deine Stimme nicht erkannt.'},
   {s:'A',who:'Er',ar:'منيح الحمدلله. وينك؟ ما عم نشوفك.',tr:'mnīḥ el-ḥamdilla. wēnak? ma 3am nshūfak.',de:'Gut, Gott sei Dank. Wo steckst du? Wir sehen dich gar nicht.'},
   {s:'B',who:'Du',ar:'مشغول شوي. بس رح مر عليك.',tr:'mashghūl shwayy. bass raḥ merr 3alēk.',de:'Etwas beschäftigt. Aber ich komme vorbei.'},
   {s:'A',who:'Er',ar:'بنطرك. سلملي عالمدام.',tr:'benṭorak. sallemle 3al-madām.',de:'Ich warte auf dich. Grüß deine Frau von mir.'},
   {s:'B',who:'Du',ar:'بتوصل. يلا، باي!',tr:'betwaṣṣal. yalla, bye!',de:'Ich richte es aus. Also, tschüss!'}
  ],
  focus:['v167','v032','v357','v446','v228']},

{ id:'d12', title:'Aufstieg nach Harissa', icon:'⛪', level:3,
  scene:'Mit der Seilbahn hinauf zur Marienstatue über Jounieh.',
  lines:[
   {s:'A',who:'Sie',ar:'بدك نطلع بالتلفريك ولا بالسيارة؟',tr:'baddak neṭla3 bet-téléférique wella bes-sayyāra?',de:'Sollen wir mit der Seilbahn hoch oder mit dem Auto?'},
   {s:'B',who:'Du',ar:'بالتلفريك أحلى. المنظر بيجنن.',tr:'bet-téléférique aḥla. el-manẓar bijannen.',de:'Mit der Seilbahn ist schöner. Die Aussicht ist der Wahnsinn.'},
   {s:'A',who:'Sie',ar:'من فوق بتشوف كل جونيه والبحر.',tr:'men fōʾ betshūf kell Jūniyye wel-baḥer.',de:'Von oben siehst du ganz Jounieh und das Meer.'},
   {s:'B',who:'Du',ar:'في قداس اليوم بالكنيسة؟',tr:'fī ʾeddēs el-yōm bel-knīse?',de:'Gibt es heute eine Messe in der Kirche?'},
   {s:'A',who:'Sie',ar:'إيه، الساعة خمسة. بتحب نحضر؟',tr:'ē, es-sē3a khamse. betḥebb neḥḍar?',de:'Ja, um fünf. Möchtest du hingehen?'},
   {s:'B',who:'Du',ar:'أكيد. وبعدين منشرب قهوة تحت.',tr:'akīd. w ba3dēn mneshrab ʾahwe taḥet.',de:'Klar. Und danach trinken wir unten einen Kaffee.'},
   {s:'A',who:'Sie',ar:'حلو. بس خود جاكيت، بيبرد المسا.',tr:'ḥelu. bass khod jaket, byebrod el-masa.',de:'Schön. Aber nimm eine Jacke mit, abends wird es kalt.'},
   {s:'B',who:'Du',ar:'ما تخافي، كل شي معي.',tr:'ma tkhāfe, kell shī ma3e.',de:'Keine Sorge, ich habe alles dabei.'}
  ],
  focus:['v248','v249','v344','v413','v247','v261']}
];
