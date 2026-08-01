/* Konjugationstabellen der wichtigsten libanesischen Verben. */
var DATA = window.DATA || {};

DATA.pronouns = [
  {k:'ana',   ar:'أنا',  de:'ich'},
  {k:'enta',  ar:'إنت',  de:'du (m)'},
  {k:'enti',  ar:'إنتي', de:'du (f)'},
  {k:'huwwe', ar:'هو',   de:'er'},
  {k:'hiyye', ar:'هي',   de:'sie'},
  {k:'neḥna', ar:'نحنا', de:'wir'},
  {k:'ento',  ar:'إنتو', de:'ihr'},
  {k:'henne', ar:'هنّي', de:'sie (Pl.)'}
];

/* Reihenfolge der Formen entspricht DATA.pronouns */
DATA.verbs = [
{ id:'vb01', de:'sein / werden', ar:'كان', tr:'kēn', note:'Im Präsens weggelassen. Vergangenheit „kēn“ mit Imāla — sehr typisch für den Berg.',
  past:['كنت kenet','كنت kenet','كنتي kente','كان kēn','كانت kēnet','كنا kenna','كنتوا kentu','كانوا kēnu'],
  pres:['بكون bkūn','بتكون betkūn','بتكوني betkūne','بيكون bikūn','بتكون betkūn','منكون mnkūn','بتكونوا betkūnu','بيكونوا bikūnu'],
  imp:['كون kūn','كوني kūne','كونوا kūnu'] },

{ id:'vb02', de:'gehen / fahren', ar:'راح', tr:'rāḥ', note:'Das häufigste Bewegungsverb. „rāyeḥ“ = unterwegs (Partizip).',
  past:['رحت reḥet','رحت reḥet','رحتي reḥte','راح rāḥ','راحت rāḥet','رحنا reḥna','رحتوا reḥtu','راحوا rāḥu'],
  pres:['بروح brūḥ','بتروح betrūḥ','بتروحي betrūḥe','بيروح birūḥ','بتروح betrūḥ','منروح mnrūḥ','بتروحوا betrūḥu','بيروحوا birūḥu'],
  imp:['روح rūḥ','روحي rūḥe','روحوا rūḥu'] },

{ id:'vb03', de:'kommen', ar:'إجا', tr:'eja', note:'Der Imperativ ist unregelmäßig: ta3a!',
  past:['إجيت ejīt','إجيت ejīt','إجيتي ejīte','إجا eja','إجت ejet','إجينا ejīna','إجيتوا ejītu','إجوا eju'],
  pres:['بجي beje','بتجي betje','بتجي betje','بيجي beje','بتجي betje','منجي mneje','بتجوا betju','بيجوا beju'],
  imp:['تعا ta3a','تعي ta3e','تعوا ta3u'] },

{ id:'vb04', de:'essen', ar:'أكل', tr:'akal', note:'Präsens mit Imāla: bēkol.',
  past:['أكلت akalet','أكلت akalet','أكلتي akalte','أكل akal','أكلت akalet','أكلنا akalna','أكلتوا akaltu','أكلوا akalu'],
  pres:['بآكل bēkol','بتاكل tēkol','بتاكلي tēkle','بياكل byēkol','بتاكل tēkol','مناكل mnēkol','بتاكلوا tēklu','بياكلوا byēklu'],
  imp:['كول kōl','كولي kūle','كولوا kūlu'] },

{ id:'vb05', de:'trinken', ar:'شرب', tr:'shereb', note:'Regelmäßiges Muster — Vorlage für viele Verben.',
  past:['شربت shrebet','شربت shrebet','شربتي shrebte','شرب shereb','شربت sherbet','شربنا shrebna','شربتوا shrebtu','شربوا sherbu'],
  pres:['بشرب beshrab','بتشرب betshrab','بتشربي betshrabe','بيشرب byeshrab','بتشرب betshrab','منشرب mneshrab','بتشربوا betshrabu','بيشربوا byeshrabu'],
  imp:['اشرب shrab','اشربي shrabe','اشربوا shrabu'] },

{ id:'vb06', de:'sprechen / reden', ar:'حكي', tr:'ḥeke', note:'★ Das levantinische Wort für sprechen. „beḥkīk“ = ich rufe dich an.',
  past:['حكيت ḥkīt','حكيت ḥkīt','حكيتي ḥkīte','حكى ḥeke','حكت ḥeket','حكينا ḥkīna','حكيتوا ḥkītu','حكوا ḥeku'],
  pres:['بحكي beḥke','بتحكي betḥke','بتحكي betḥke','بيحكي byeḥke','بتحكي betḥke','منحكي mneḥke','بتحكوا betḥku','بيحكوا byeḥku'],
  imp:['احكي ḥke','احكي ḥke','احكوا ḥku'] },

{ id:'vb07', de:'sehen', ar:'شاف', tr:'shēf', note:'„bshūfak“ = bis bald.',
  past:['شفت sheft','شفت sheft','شفتي shefte','شاف shēf','شافت shēfet','شفنا shefna','شفتوا sheftu','شافوا shēfu'],
  pres:['بشوف bshūf','بتشوف betshūf','بتشوفي betshūfe','بيشوف bishūf','بتشوف betshūf','منشوف mnshūf','بتشوفوا betshūfu','بيشوفوا bishūfu'],
  imp:['شوف shūf','شوفي shūfe','شوفوا shūfu'] },

{ id:'vb08', de:'machen / tun', ar:'عمل', tr:'3emel', note:'„shu 3am ta3mel?“ = was machst du gerade?',
  past:['عملت 3melet','عملت 3melet','عملتي 3melte','عمل 3emel','عملت 3emlet','عملنا 3melna','عملتوا 3meltu','عملوا 3emlu'],
  pres:['بعمل be3mel','بتعمل bta3mel','بتعملي bta3mle','بيعمل bya3mel','بتعمل bta3mel','منعمل mna3mel','بتعملوا bta3mlu','بيعملوا bya3mlu'],
  imp:['اعمل 3mūl','اعملي 3mūle','اعملوا 3mūlu'] },

{ id:'vb09', de:'wissen / kennen', ar:'عرف', tr:'3eref', note:'„ma ba3ref“ ist die häufigste Antwort im Libanon.',
  past:['عرفت 3reft','عرفت 3reft','عرفتي 3refte','عرف 3eref','عرفت 3erfet','عرفنا 3refna','عرفتوا 3reftu','عرفوا 3erfu'],
  pres:['بعرف ba3ref','بتعرف bta3ref','بتعرفي bta3rfe','بيعرف bya3ref','بتعرف bta3ref','منعرف mna3ref','بتعرفوا bta3rfu','بيعرفوا bya3rfu'],
  imp:['اعرف 3raf','اعرفي 3rafe','اعرفوا 3rafu'] },

{ id:'vb10', de:'mögen / lieben', ar:'حب', tr:'ḥabb', note:'Verdoppeltes Verb (Shadda). „bḥebbak/bḥebbik“ = ich liebe dich.',
  past:['حبيت ḥabbēt','حبيت ḥabbēt','حبيتي ḥabbēte','حب ḥabb','حبت ḥabbet','حبينا ḥabbēna','حبيتوا ḥabbētu','حبوا ḥabbu'],
  pres:['بحب bḥebb','بتحب betḥebb','بتحبي betḥebbe','بيحب biḥebb','بتحب betḥebb','منحب mnḥebb','بتحبوا betḥebbu','بيحبوا biḥebbu'],
  imp:['حب ḥebb','حبي ḥebbe','حبوا ḥebbu'] },

{ id:'vb11', de:'lernen', ar:'تعلم', tr:'t3allam', note:'Genau das, was ihr gerade macht: „3am net3allam sawa“.',
  past:['تعلمت t3allamet','تعلمت t3allamet','تعلمتي t3allamte','تعلم t3allam','تعلمت t3allamet','تعلمنا t3allamna','تعلمتوا t3allamtu','تعلموا t3allamu'],
  pres:['بتعلم bet3allam','بتتعلم btet3allam','بتتعلمي btet3allame','بيتعلم byet3allam','بتتعلم btet3allam','منتعلم mnet3allam','بتتعلموا btet3allamu','بيتعلموا byet3allamu'],
  imp:['اتعلم t3allam','اتعلمي t3allame','اتعلموا t3allamu'] },

{ id:'vb12', de:'schreiben', ar:'كتب', tr:'katab', note:'Die Wurzel k-t-b steckt auch in ktēb (Buch) und makteb (Büro).',
  past:['كتبت katabet','كتبت katabet','كتبتي katabte','كتب katab','كتبت katbet','كتبنا katabna','كتبتوا katabtu','كتبوا katabu'],
  pres:['بكتب bekteb','بتكتب btekteb','بتكتبي btektbe','بيكتب byekteb','بتكتب btekteb','منكتب mnekteb','بتكتبوا btektbu','بيكتبوا byektbu'],
  imp:['اكتب kteb','اكتبي ktebe','اكتبوا ktebu'] },

{ id:'vb13', de:'lesen', ar:'قرا', tr:'ʾara', note:'ق als Knacklaut: „beʾra“, nicht „aqra“.',
  past:['قريت ʾrīt','قريت ʾrīt','قريتي ʾrīte','قرا ʾara','قرت ʾaret','قرينا ʾrīna','قريتوا ʾrītu','قروا ʾaru'],
  pres:['بقرا beʾra','بتقرا betʾra','بتقري betʾre','بيقرا byeʾra','بتقرا betʾra','منقرا mneʾra','بتقروا betʾru','بيقروا byeʾru'],
  imp:['اقرا ʾra','اقري ʾre','اقروا ʾru'] },

{ id:'vb14', de:'nehmen', ar:'أخد', tr:'akhad', note:'Wie akal mit Imāla im Präsens: bēkhod.',
  past:['أخدت akhadet','أخدت akhadet','أخدتي akhadte','أخد akhad','أخدت akhadet','أخدنا akhadna','أخدتوا akhadtu','أخدوا akhadu'],
  pres:['بآخد bēkhod','بتاخد tēkhod','بتاخدي tēkhde','بياخد byēkhod','بتاخد tēkhod','مناخد mnēkhod','بتاخدوا tēkhdu','بياخدوا byēkhdu'],
  imp:['خود khod','خودي khode','خودوا khodu'] },

{ id:'vb15', de:'geben', ar:'عطى', tr:'3aṭa', note:'„alla ya3ṭīk el-3āfye“ kommt von diesem Verb.',
  past:['عطيت 3aṭēt','عطيت 3aṭēt','عطيتي 3aṭēte','عطى 3aṭa','عطت 3aṭet','عطينا 3aṭēna','عطيتوا 3aṭētu','عطوا 3aṭu'],
  pres:['بعطي ba3ṭe','بتعطي bta3ṭe','بتعطي bta3ṭe','بيعطي bya3ṭe','بتعطي bta3ṭe','منعطي mna3ṭe','بتعطوا bta3ṭu','بيعطوا bya3ṭu'],
  imp:['عطي 3ṭe','عطي 3ṭe','عطوا 3ṭu'] }
];
