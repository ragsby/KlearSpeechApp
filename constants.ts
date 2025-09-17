export const TOTAL_LEVELS = 8;

export const motivationalQuotes: { [key: number]: string } = {
    1: "Your voice matters - let it shine today!",
    2: "Small steps lead to big wins in speech therapy.",
    3: "Every practice session brings you closer to your goals.",
    4: "Consistency is the key to unlocking your potential.",
    5: "Your dedication today shapes your success tomorrow.",
    6: "Progress, not perfection - celebrate every achievement!",
    7: "You're stronger than you think - keep going!",
    8: "Each exercise builds confidence in your communication.",
    9: "Your commitment to practice is inspiring!",
    10: "Great speakers weren't born, they practiced.",
    11: "Today's effort is tomorrow's strength.",
    12: "Your voice has power - embrace it fully!",
    13: "Persistence pays off - you're doing amazing!",
    14: "Every day you practice, you grow stronger.",
    15: "Halfway through the month - you're unstoppable!",
    16: "Your journey is unique and beautiful.",
    17: "Speaking with confidence starts with practice.",
    18: "You're building habits that will last a lifetime.",
    19: "Your progress is worth celebrating!",
    20: "Keep pushing forward - success is near!",
    21: "Three weeks strong - you're a champion!",
    22: "Your dedication is transforming your speech.",
    23: "Every word you practice matters.",
    24: "You're not just practicing, you're evolving.",
    25: "Your consistency is your superpower!",
    26: "Almost there - finish the month strong!",
    27: "Your voice deserves to be heard clearly.",
    28: "You've come so far - be proud of yourself!",
    29: "Tomorrow's success starts with today's practice.",
    30: "One more day - you're almost at your goal!",
    31: "Month complete - you're a speech therapy warrior!"
};

export const neckExercises = [
    "Neck Side Turn + Swallow: Turn head 45° right, lift glottis (swallow), hold 5s. Repeat left. (10×)",
    "Neck Up/Down (hold 5s, ×10)",
    "Neck Rotation (clockwise/anticlockwise ×5)",
    "Jaw Press & Relax (press molars 2s, release ×10)",
    "Tongue-Palate Glide (lips closed, glide tongue ×20)",
    "Cheek Blow with 'PHA' (press lips, blow cheeks ×10)",
    "Lip Shapes for आ, ए, ई, ऊ, ओ (with/without sound ×3–5)",
    "Tongue Stretches + Rotation (corners/up/down/circle ×10)"
];

export const consonants = ['च', 'छ', 'झ', 'ट', 'ठ', 'ड', 'ढ', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह'];
export const bvClusters = ['क्र', 'प्र', 'फ्र', 'ब्र', 'स्क', 'स्त्र', 'ज्ञ', 'क्व', 'थ्र', 'त्र', 'क्ष', 'द्र', 'ग्र', 'ब्ल', 'क्ल', 'फ्ल', 'ग्ल', 'प्ल', 'स्ल'];
export const vowels = ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ', 'अं'];
export const PHONATION_VOWELS = ['आ', 'ई', 'ऊ', 'ए', 'ओ'];

export const cvSentences: { [key: string]: string } = {
    'च': "चाचा ने चीनी में चुटकी भर चूना मिलाकर चेहरे पर चोट के निशान को चौकस होकर छुआ",
    'छ': "छाता लेकर छोटी छिपकली छत पर छूने गई और छींक मारकर छुप गई",
    'झ': "झाड़ू से झीरों को झाड़ते हुए झुमका गिरा और झोंपड़ी में झनकार हुई",
    'ट': "टाटा की टीम ने टुकड़ों में टेढ़े टोकरे को टोका और टिकट काटी",
    'ठ': "ठाकुर ने ठीक से ठुमका लगाया और ठेले पर ठोकर मारी",
    'ड': "डाकिया ने डिब्बा डुबोया और डेरे में डोरी से डमरू बांधा",
    'ढ': "ढाबे में ढीला ढुलता ढेर देखकर ढोल बजाने वाले ने ढक्कन बंद किया",
    'त': "ताऊ ने तीन तुरंत तेल में तोता का तैरना देखा",
    'थ': "थाली में थीम पार्क का थूकना मना है थैले में रखो",
    'द': "दादा ने दीवार पर दुकान के देर से दोपहर में दाना डाला",
    'ध': "धागे से धीरे धुआं धेनु के धोने से धमाका हुआ",
    'न': "नाना ने नीम की नुकीली नेक नोक से नाक साफ की",
    'प': "पापा ने पीला पुराना पेड़ का पोस्टर पकड़ा",
    'फ': "फूफा ने फल फेंका और फादर ने फौलादी फेन को फोड़ा फिर गुब्बारा फुला के फिसला",
    'ब': "बाबा ने बीच में बुलबुला बेचने वाले को बोतल से बाहर भेजा",
    'भ': "भाई ने भीड़ में भुट्टा भेजकर भोजन में भिंडी मिलाई",
    'म': "मामा ने मीठी मुरली में मेला मोड़ पर मजा लिया",
    'य': "यात्री ने यीशु से युवा येन योजना की बात की",
    'र': "राजा ने रीति से रुपये रेत में रोज़ रखे",
    'ल': "लाला ने लीची लुढ़काकर लेमन लोटे में लपेटा",
    'व': "वाह वीर ने वुड़ में वेतन वो वक्त पर लिया",
    'श': "शाम को शीशे में शुभ शेर शोर मचाता रहा",
    'ष': "षट्कोण में षष्ठी को षड्यंत्र की बात हुई",
    'स': "सारा ने सीधे सुबह सेब सोने से पहले खाया",
    'ह': "हाथी ने हीरा हुक्का हेलीकॉप्टर में होली पर देखा"
};

export const bvSentences: { [key: string]: string } = {
    'क्र': "क्रिकेट में क्राउड ने क्रिस्टल क्लीयर क्राई सुनी और क्रेज़ी हो गई",
    'प्र': "प्रिंस ने प्राइज़ में प्रेशर कुकर और प्रोजेक्टर प्राप्त किया",
    'फ्र': "फ्रेंड ने फ्रूट फ्रेश फ्राई करके फ्रिज में रखा",
    'ब्र': "ब्रदर ने ब्राउन ब्रेड ब्रेकफास्ट में ब्रश करने के बाद खाई",
    'स्क': "स्कूल में स्कॉलर ने स्कीम के बारे में स्केच बनाया",
    'स्त्र': "स्त्री ने स्त्रोत से स्त्रीत्व की बात कही और शास्त्र पढ़ा",
    'ज्ञ': "ज्ञानी ने ज्ञान की बात कहकर अज्ञात विषय पर प्रज्ञा दिखाई",
    'क्व': "क्वालिटी क्वेश्चन में क्वार्टर क्विक आंसर मिला",
    'थ्र': "थ्री थ्रेड से थ्रो करके थ्रिल मिला",
    'त्र': "त्रिशूल लेकर त्रिदेव ने त्रिकोण में मंत्र पढ़ा और पत्र लिखा",
    'क्ष': "क्षत्रिय ने क्षमा मांगकर क्षेत्र में शिक्षा का क्षय रोका",
    'द्र': "द्रव्य लेकर द्रोण ने इंद्र से भद्र व्यवहार किया",
    'ग्र': "ग्राम में ग्रह पर ग्रंथ पढ़कर अग्रणी बना",
    'ब्ल': "ब्लैक ब्लॉक में ब्लू ब्लेड से ब्लास्ट हुआ",
    'क्ल': "क्लास में क्लीन क्लॉथ क्लैप करके रखे",
    'फ्ल': "फ्लाइट में फ्लोर पर फ्लावर फ्लैट रखा था",
    'ग्ल': "ग्लास में ग्लोब का ग्लिटर ग्लू से चिपका",
    'प्ल': "प्लेट में प्लास्टिक प्लान प्लेस किया",
    'स्ल': "स्लो स्लाइड में स्लीप स्लिप हो गई"
};

export const vowelSentences: { [key: string]: string } = {
    'अ': "अमर अगर अचल अटल रहकर अनमोल कहलाता है",
    'आ': "आम आदमी आज आराम से आधा आटा खाता है",
    'इ': "इमली इधर इतनी मिली कि किसान खिल गया",
    'ई': "ईमानदार आदमी ईंट से मकान बनाकर खुशी से जीता है",
    'उ': "उल्लू उधर उछलकर उन गुलाबों में छुप गया",
    'ऊ': "ऊंट ऊंचे पहाड़ पर चढ़कर दूर से ऊन देखता है",
    'ए': "एक केले के पेड़ के नीचे मेरे गेंद गिरे थे",
    'ऐ': "ऐनक पहनकर वैज्ञानिक ने तैयारी की और पैसे गिने",
    'ओ': "ओस की बूंदों को छोड़कर मोर ने शोर मचाया",
    'औ': "औरत ने कौवे को देखकर मौसम की बात सोची",
    'अं': "अंगूर के गुच्छे में रंग भरकर संग में रखा"
};