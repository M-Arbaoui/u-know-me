export interface QuizTemplate {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: 'friendship' | 'family' | 'work' | 'fun';
  difficulty: 'easy' | 'medium' | 'hard';
  questions: {
    question: string;
    questionAr: string;
    options: string[];
    optionsAr: string[];
    correctAnswer: number;
  }[];
  estimatedTime: number; // in minutes
  tags: string[];
}

export const quizTemplates: QuizTemplate[] = [
  {
    id: 'easy-questions',
    title: 'Easy Questions Quiz',
    titleAr: 'اختبار الأسئلة السهلة',
    description: 'Fun and relatable easy questions about everyday life.',
    descriptionAr: 'أسئلة سهلة وممتعة عن الحياة اليومية.',
    category: 'fun',
    difficulty: 'easy',
    estimatedTime: 5,
    tags: ['fun', 'easy', 'relatable', 'life'],
    questions: [
      {
        question: 'What\'s my favorite way to waste time and still pretend I\'m being productive?',
        questionAr: 'ما طريقتي المفضلة في تضييع الوقت وأنا متظاهر بالشغل؟',
        options: ['Rearranging my desktop icons', 'Opening Google Docs and typing nothing', 'Watching productivity videos for 3 hours', 'Deleting old emails from 2015 like it matters'],
        optionsAr: ['إعادة ترتيب سطح المكتب', 'فتح Google Docs وعدم كتابة شيء', 'مشاهدة فيديوهات "كيف تكون أكثر إنتاجية"', 'تنظيف الإيميل من رسائل سنة 2015'],
        correctAnswer: 2
      },
      {
        question: 'How many alarms do I set before I actually wake up?',
        questionAr: 'كم من منبه أحتاج لأستيقظ؟',
        options: ['One… which I ignore', 'Three alarms spaced 10 minutes apart', 'Seven alarms + divine intervention', 'I don\'t wake up. I just ascend.'],
        optionsAr: ['واحد… وأتجاهله', '3: كل 10 دقائق', '7 منبهات + دعاء الوالدين', 'لا أستيقظ أساسًا'],
        correctAnswer: 2
      },
      {
        question: 'What food do I say I hate, but secretly love like a hypocrite?',
        questionAr: 'ما هو الأكل اللي أسبّه قدام الناس لكن آكله بالسر؟',
        options: ['Mayonnaise', 'Liver', 'Instant noodles', 'Stale bread with spreadable cheese'],
        optionsAr: ['المايونيز', 'كبدة', 'نودلز جاهز', 'خبز يابس مع جبن سايل'],
        correctAnswer: 0
      },
      {
        question: 'If laziness were an Olympic sport, what medal would I win?',
        questionAr: 'لو الكسل رياضة أولمبية، أي ميدالية كنت سأفوز بها؟',
        options: ['Gold — didn\'t even move', 'Silver — missed the finals but tried', 'Bronze — replied late', 'Honorary mention: "Showed up mentally, not physically"'],
        optionsAr: ['ذهبية وأنا نائم', 'فضية… نسيت أروح النهائي', 'برونزية بسبب تأخر الرد', 'ميدالية شرفية: "شارك وما تحركش"'],
        correctAnswer: 0
      },
      {
        question: 'Which app drains my soul and my battery the fastest?',
        questionAr: 'أي تطبيق يستنزف بطاريتي وحياتي؟',
        options: ['TikTok', 'Instagram Reels', 'Family WhatsApp Group', 'The weather app… just to check for rain that never comes'],
        optionsAr: ['TikTok', 'Instagram Reels', 'WhatsApp العائلة', 'تطبيق الطقس… عشان أشوف المطر اللي ما يجي'],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 'medium-questions',
    title: 'Medium Questions Quiz',
    titleAr: 'اختبار الأسئلة المتوسطة',
    description: 'Medium difficulty questions that dig deeper into personality quirks.',
    descriptionAr: 'أسئلة متوسطة الصعوبة تتعمق في صفات الشخصية.',
    category: 'fun',
    difficulty: 'medium',
    estimatedTime: 6,
    tags: ['fun', 'medium', 'personality', 'quirks'],
    questions: [
      {
        question: 'What\'s the weirdest Google search I\'ve probably made?',
        questionAr: 'أغرب شيء بحثت عنه؟',
        options: ['"Is it normal to sleep 17 hours?"', '"Do cats really love me?"', '"Why do I cry for no reason?"', '"How to legally escape reality"'],
        optionsAr: ['"هل النوم 17 ساعة طبيعي؟"', '"هل القطط تحبني فعلًا؟"', '"أسباب البكاء بدون سبب"', '"كيف أهرب من الواقع قانونيًا؟"'],
        correctAnswer: 3
      },
      {
        question: 'If I had to fight one animal barehanded, which would I choose to lose against?',
        questionAr: 'لو قاتلت حيوان بيدي فقط، من أختار يهزمني؟',
        options: ['A dignified penguin', 'An anxious koala', 'An angry turtle', 'A moody rooster'],
        optionsAr: ['بطريق محترم', 'كوالا قلقان', 'سلحفاة غاضبة', 'ديك مزاجي'],
        correctAnswer: 0
      },
      {
        question: 'What\'s my most irrational fear that makes zero evolutionary sense?',
        questionAr: 'ما خوفي الغريب غير المبرر؟',
        options: ['Voicemails', 'Unexpected phone calls', 'Random kids staring at me', 'The last bubble in a juice box'],
        optionsAr: ['فتح البريد الصوتي', 'مكالمة هاتفية بدون تحذير مسبق', 'أطفال غرباء يطالعون فيّ', 'الفقاعة الأخيرة في زجاجة العصير'],
        correctAnswer: 1
      },
      {
        question: 'What\'s the dumbest reason I\'ve ever cried?',
        questionAr: 'أغبى سبب خلاني أبكي؟',
        options: ['My favorite character died after 5 episodes', 'The food arrived… without the sauce', 'Forgot my password right after changing it', 'Washed the clothes, forgot to press start'],
        optionsAr: ['ماتت الشخصية المفضلة بعد 5 حلقات فقط', 'الأكل وصل بدون صوص', 'نسيت كلمة السر بعد ما غيّرتها للتو', 'غسلت الملابس ونسيت أضغط تشغيل'],
        correctAnswer: 1
      },
      {
        question: 'If my life were a reality show, what would be its most repeated scene?',
        questionAr: 'لو حياتي برنامج، شو المشهد المتكرر؟',
        options: ['Me opening the fridge for no reason', 'Me saying "Let\'s get started" and falling asleep', 'Me reading messages and not replying', 'Me ordering food while already full'],
        optionsAr: ['أنا أفتح الثلاجة بلا سبب', 'أنا أقول "يلا نبدأ"… وأنام', 'أنا أقرأ رسالة وما أرد', 'أنا أطلب أكل وأنا شبعان'],
        correctAnswer: 0
      }
    ]
  },
  {
    id: 'hard-questions',
    title: 'Hard Questions Quiz',
    titleAr: 'اختبار الأسئلة الصعبة',
    description: 'Challenging questions that reveal deep personality insights.',
    descriptionAr: 'أسئلة صعبة تكشف عن رؤى عميقة في الشخصية.',
    category: 'fun',
    difficulty: 'hard',
    estimatedTime: 7,
    tags: ['fun', 'hard', 'personality', 'insights'],
    questions: [
      {
        question: 'What\'s my go-to excuse when I want to cancel plans?',
        questionAr: 'ما هي حجتي المفضلة لإلغاء الخطط؟',
        options: ['My stomach feels... weird', 'I forgot I had something important (vague)', 'The weather doesn\'t match my mood', 'My Wi-Fi is acting up so I can\'t go out'],
        optionsAr: ['بطني أحس فيه شيء غريب', 'نسيت عندي التزام… غامض', 'الجو مش مريح لي نفسيًا', 'الإنترنت تعبان وما قدرت أطلع من البيت'],
        correctAnswer: 1
      },
      {
        question: 'If I disappeared suddenly, where\'s the weirdest place you\'d find me?',
        questionAr: 'لو اختفيت، وين أغرب مكان ممكن أكون؟',
        options: ['Asleep inside a closet', 'Sitting alone at a closed restaurant', 'Reading a novel in a public bathroom', 'Watching a webinar I didn\'t sign up for'],
        optionsAr: ['نائم في خزانة', 'في مطعم مهجور أراجع اختياراتي', 'داخل حمام عام أقرأ رواية', 'مستمع في كورس أونلاين ما سجلت فيه أصلًا'],
        correctAnswer: 2
      },
      {
        question: 'What\'s my internal monologue during "let\'s introduce ourselves"?',
        questionAr: 'ما هو كلامي الداخلي لما يقولوا "عرف نفسك"؟',
        options: ['No no no no not again', 'Say something smart… never mind', 'Just say anything and survive', 'Wait, what\'s my name again?'],
        optionsAr: ['لا لا لاااااا مش تاني', 'قل شي ذكي… لا مش هيك', 'قل أي شي وخلاص', 'إيش اسمي أنا أصلًا؟'],
        correctAnswer: 0
      },
      {
        question: 'What personality trait do I pretend is a strength but is clearly a red flag?',
        questionAr: 'ما الصفة اللي أعتبرها ميزة بس هي علم أحمر؟',
        options: ['I\'m "too honest"', 'I "like control" because I\'m detail-oriented', 'I "need space" so I ghost people', 'I reply after 3 days because "I value calm"'],
        optionsAr: ['أحب أكون "صريح زيادة"', 'أتحكم في التفاصيل لأن "أنا دقيق"', 'أتجاهل الناس لأني "أحتاج مساحة"', 'أرد بعد 3 أيام لأن "ما أحب الضغط"'],
        correctAnswer: 2
      },
      {
        question: 'If I were a villain, what would be my totally unthreatening evil plan?',
        questionAr: 'لو كنت شرير، شو هي خطتي الفاشلة؟',
        options: ['Turn off the internet after 11pm', 'Change everyone\'s alarm to baby crying', 'Delete every file named "final_v2"', 'Rotate the Wi-Fi router 5 degrees every day'],
        optionsAr: ['أقفل الإنترنت بعد 11 مساءً', 'أغير نغمة التنبيه إلى بكاء طفل', 'أحذف كل الملفات باسم "final_v2"', 'أغيّر اتجاه الواي فاي كل يوم'],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 'dark-brutal-questions',
    title: 'Dark & Brutal Questions Quiz',
    titleAr: 'اختبار الأسئلة المظلمة والقاسية',
    description: 'Hilariously brutal questions with dark humor and sarcasm.',
    descriptionAr: 'أسئلة قاسية ومضحكة مع فكاهة سوداء وسخرية.',
    category: 'fun',
    difficulty: 'hard',
    estimatedTime: 8,
    tags: ['fun', 'dark', 'brutal', 'sarcasm', 'humor'],
    questions: [
      {
        question: 'What\'s the most self-destructive thing I do while pretending it\'s "self-care"?',
        questionAr: 'ما أكثر عادة مدمّرة لنفسي أمارسها وأنا أقنع نفسي بأنها "اهتمام ذاتي"؟',
        options: ['Ignoring all messages for "mental health"', 'Binge-eating while watching documentaries on discipline', 'Buying books I\'ll never read', 'Sleeping 14 hours as "healing"'],
        optionsAr: ['تجاهل كل الرسائل من أجل "الصحة النفسية"', 'أكل بشراهة وأنا أشاهد أفلام وثائقية عن الانضباط', 'شراء كتب لن أقرأها أبداً', 'النوم 14 ساعة كـ "شفاء"'],
        correctAnswer: 0
      },
      {
        question: 'If I had a therapist, what would they most likely say about me after one session?',
        questionAr: 'لو كان عندي طبيب نفسي، ماذا سيقول عني بعد أول جلسة؟',
        options: ['"Fascinating case of denial"', '"Textbook avoidant personality"', '"Should I call someone?"', '"They laughed… a lot… while crying."'],
        optionsAr: ['"حالة مثيرة للاهتمام من الإنكار"', '"شخصية تجنبية نموذجية"', '"هل يجب أن أتصل بشخص ما؟"', '"ضحكوا... كثيراً... أثناء البكاء."'],
        correctAnswer: 3
      },
      {
        question: 'What\'s my most toxic coping mechanism disguised as a "quirk"?',
        questionAr: 'ما هو أكثر سلوك سام عندي وأنا أعتبره "شيء ظريف عني"؟',
        options: ['I disappear instead of replying', 'I joke about everything including death', 'I overshare to avoid intimacy', 'I sabotage myself before others do'],
        optionsAr: ['أختفي بدلاً من الرد', 'أمزح حول كل شيء بما في ذلك الموت', 'أشارك الكثير لتجنب العلاقات الحميمة', 'أخرب نفسي قبل أن يخربني الآخرون'],
        correctAnswer: 1
      },
      {
        question: 'If my mind had a loading screen, what would it say 90% of the time?',
        questionAr: 'لو كان عندي شاشة تحميل ذهنية، ماذا ستكون الرسالة ٩٠٪ من الوقت؟',
        options: ['"Overthinking update: 87% complete"', '"Existential dread loading…"', '"Too many tabs open, none useful"', '"Rebooting social skills…"'],
        optionsAr: ['"تحديث التفكير الزائد: 87% مكتمل"', '"تحميل القلق الوجودي..."', '"كثير من التبويبات مفتوحة، ولا واحدة مفيدة"', '"إعادة تشغيل المهارات الاجتماعية..."'],
        correctAnswer: 0
      },
      {
        question: 'What do I secretly hope people never notice about me?',
        questionAr: 'ما الشيء الذي أتمنى سرًا ألا يلاحظه أحد عني؟',
        options: ['I mirror their personality because I have none', 'I forgot how to make new friends', 'I have no hobbies, just coping mechanisms', 'I Google "how to act normal" weekly'],
        optionsAr: ['أقلد شخصيتهم لأنني لا أملك واحدة', 'نسيت كيف أصنع أصدقاء جدد', 'ليس لدي هوايات، فقط آليات تعامل', 'أبحث في جوجل "كيف أتصرف بشكل طبيعي" أسبوعياً'],
        correctAnswer: 0
      },
      {
        question: 'If I wrote a memoir, what would the brutally honest title be?',
        questionAr: 'لو كتبت مذكراتي، ما هو العنوان الصادق جدًا؟',
        options: ['"I Swear I Had Potential"', '"Mostly Tired, Occasionally Funny"', '"Unsent Messages & Unfinished Projects"', '"Overthinking: A Love Story"'],
        optionsAr: ['"أقسم أنني كنت أملك إمكانيات"', '"معظم الوقت متعب، أحياناً مضحك"', '"رسائل لم ترسل ومشاريع لم تكتمل"', '"التفكير الزائد: قصة حب"'],
        correctAnswer: 2
      },
      {
        question: 'What do I do when I feel overwhelmed by responsibilities?',
        questionAr: 'ماذا أفعل عندما تغمرني المسؤوليات؟',
        options: ['Watch 3-hour video essays I don\'t care about', 'Clean random drawers for no reason', 'Take a nap I didn\'t earn', 'Create a to-do list... then abandon it'],
        optionsAr: ['مشاهدة فيديوهات 3 ساعات لا أهتم بها', 'تنظيف أدراج عشوائية بلا سبب', 'أخذ قيلولة لم أكسبها', 'إنشاء قائمة مهام... ثم التخلي عنها'],
        correctAnswer: 3
      },
      {
        question: 'What\'s my backup life plan if everything fails?',
        questionAr: 'ما هو خطتي البديلة لو فشل كل شيء؟',
        options: ['Move to a forest and blame society', 'Become that weird neighbor with conspiracy theories', 'Start a podcast with no audience', 'Marry rich and disappear from social media'],
        optionsAr: ['الانتقال إلى غابة وإلقاء اللوم على المجتمع', 'أصبح ذلك الجار الغريب بنظريات المؤامرة', 'بدء بودكاست بلا جمهور', 'الزواج من غني والاختفاء من وسائل التواصل'],
        correctAnswer: 1
      },
      {
        question: 'What\'s the personality trait I post about but absolutely don\'t have?',
        questionAr: 'ما هي الصفة اللي أتباهى بها على الإنترنت، بس ما أملكها أصلًا؟',
        options: ['Discipline', 'Emotional intelligence', 'Confidence', '"Grindset mentality"'],
        optionsAr: ['الانضباط', 'الذكاء العاطفي', 'الثقة', '"عقلية العمل الجاد"'],
        correctAnswer: 0
      },
      {
        question: 'What is my superpower that no one asked for?',
        questionAr: 'ما هي قوتي الخارقة التي لم يطلبها أحد؟',
        options: ['Detecting awkward silence from 5km away', 'Ghosting people I actually like', 'Remembering embarrassing moments from 2009', 'Arguing with myself and losing'],
        optionsAr: ['اكتشاف الصمت المحرج من مسافة 5 كم', 'تجاهل الأشخاص الذين أحبهم فعلاً', 'تذكر اللحظات المحرجة من 2009', 'الجدال مع نفسي والخسارة'],
        correctAnswer: 2
      }
    ]
  }
];

export const getTemplatesByCategory = (category: string) => {
  return quizTemplates.filter(template => template.category === category);
};

export const getTemplatesByDifficulty = (difficulty: string) => {
  return quizTemplates.filter(template => template.difficulty === difficulty);
};

export const getTemplateById = (id: string) => {
  return quizTemplates.find(template => template.id === id);
}; 