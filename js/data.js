// IELTS Band conversion table (official Cambridge)
const BAND_TABLE = [
  [0,9,1.0],[10,13,2.0],[14,17,2.5],[18,21,3.0],[22,24,3.5],
  [25,26,4.0],[27,29,4.5],[30,31,5.0],[32,34,5.5],[35,36,6.0],
  [37,38,6.5],[39,40,7.0],[41,42,7.5],[43,44,8.0],[45,46,8.5],
  [47,47,9.0]
];
// For 40Q tests:
const BAND_40 = {
  0:1.0,1:1.0,2:1.0,3:1.0,4:1.5,5:1.5,6:2.0,7:2.0,8:2.5,
  9:2.5,10:3.0,11:3.0,12:3.0,13:3.0,14:3.5,15:3.5,16:4.0,
  17:4.0,18:4.0,19:4.0,20:4.0,21:4.0,22:4.5,23:4.5,24:5.0,
  25:5.0,26:5.0,27:5.5,28:5.5,29:5.5,30:6.0,31:6.0,32:6.5,
  33:6.5,34:6.5,35:7.0,36:7.0,37:7.5,38:7.5,39:8.0,40:9.0
};

function getBand(raw) {
  return BAND_40[Math.min(raw, 40)] || 1.0;
}

// ── TEST 01 DATA ──────────────────────────────────────────────────────────────
const TEST01 = {
  id: 'test01',
  title: 'Listening Test 01',
  date: '29 juin 2026',
  sections: [
    {
      number: 1,
      title: 'Hotel Booking — Form Completion',
      audio: 'audio/test01/section1.mp3',
      type: 'form',
      formTitle: 'THE GRAND MERIDIAN HOTEL — RESERVATION FORM',
      questions: [
        { n:1,  label:'Guest surname',        answer:'HENDERSON',                    alt:['henderson'] },
        { n:2,  label:'Arrival date',         answer:'14TH',                         alt:['14th','fourteenth','14'] },
        { n:3,  label:'Room type',            answer:'TWIN',                         alt:['twin room'] },
        { n:4,  label:'Number of nights',     answer:'3',                            alt:['three'] },
        { n:5,  label:'Special requirement',  answer:'GROUND',                       alt:['ground floor'] },
        { n:6,  label:'Payment method',       answer:'CREDIT',                       alt:['credit card'] },
        { n:7,  label:'Email address',        answer:'david.henderson@techcorp.com', alt:['david.henderson@techcorp.com'] },
        { n:8,  label:'Nightly rate (£)',     answer:'89',                           alt:['£89','89 pounds'] },
        { n:9,  label:'Breakfast',            answer:'INCLUDED',                     alt:['included'] },
        { n:10, label:'Booking reference',    answer:'BKG2749',                      alt:['bkg2749','bkg 2749'] },
      ]
    },
    {
      number: 2,
      title: 'Museum Tour — Map + Multiple Choice',
      audio: 'audio/test01/section2.mp3',
      type: 'mixed',
      groups: [
        {
          type: 'form',
          formTitle: 'MUSEUM MAP — Q11–15',
          instructions: 'Write the letter (A–H) shown on the map next to each location.',
          questions: [
            { n:11, label:'Gift Shop',           answer:'B', alt:['b'] },
            { n:12, label:'Education Centre',    answer:'A', alt:['a'] },
            { n:13, label:'Dinosaur Gallery',    answer:'D', alt:['d'] },
            { n:14, label:'Temporary Exhibitions', answer:'C', alt:['c'] },
            { n:15, label:'Restaurant',          answer:'F', alt:['f'] },
          ]
        },
        {
          type: 'mc',
          instructions: 'Choose the correct letter, A, B or C.',
          questions: [
            { n:16, text:'Which exhibition will open at the museum next month?',
              options:['Rare Gemstones','Deep Ocean Creatures','Antarctic Wildlife'], answer:1 },
            { n:17, text:"What time does the last guided tour of the day start?",
              options:['2:30 pm','3:00 pm','3:30 pm'], answer:2 },
            { n:18, text:'What does the museum offer children under 5?',
              options:['Free entry','A free guidebook','A free activity pack'], answer:0 },
            { n:19, text:'What is the museum café known for?',
              options:['Local seasonal produce','Low prices','Views of the garden'], answer:0 },
            { n:20, text:'What restriction applies to the Members\' Lounge?',
              options:['Booking required','Adults only','No food allowed'], answer:1 },
          ]
        }
      ]
    },
    {
      number: 3,
      title: 'Urban Farming Discussion — Matching + MC',
      audio: 'audio/test01/section3.mp3',
      type: 'mixed',
      groups: [
        {
          type: 'matching',
          instructions: 'Which researcher does each statement apply to? Write A (Patel), B (Nakamura), C (Osei), D (Fischer), or E (Becker).',
          options: ['A — Patel','B — Nakamura','C — Osei','D — Fischer','E — Becker'],
          questions: [
            { n:21, text:'Focuses on water usage efficiency', answer:'A', alt:['a'] },
            { n:22, text:'Studies community well-being benefits', answer:'B', alt:['b'] },
            { n:23, text:'Analyses cost vs yield in urban settings', answer:'E', alt:['e'] },
            { n:24, text:'Researches soil contamination risks', answer:'C', alt:['c'] },
            { n:25, text:'Investigates biodiversity impact', answer:'D', alt:['d'] },
          ]
        },
        {
          type: 'mc',
          instructions: 'Choose the correct letter, A, B or C.',
          questions: [
            { n:26, text:"What is Maya's main concern about the project scope?",
              options:['It is too broad','It lacks a clear focus','It needs more funding'], answer:0 },
            { n:27, text:'What does Professor Walsh say about vertical farms?',
              options:['They use too much energy','They are cheaper than expected','They produce more than traditional farms'], answer:0 },
            { n:28, text:"James's proposed case study is located in",
              options:['Singapore','Tokyo','Berlin'], answer:1 },
            { n:29, text:"What does Maya suggest they should add to the literature review?",
              options:['Policy documents','More recent studies','Industry reports'], answer:1 },
            { n:30, text:"What do James and Maya agree the project still needs?",
              options:['A stronger conclusion','A primary data collection phase','More academic references'], answer:1 },
          ]
        }
      ]
    },
    {
      number: 4,
      title: 'Cognitive Load Theory — Notes Completion',
      audio: 'audio/test01/section4.mp3',
      type: 'form',
      formTitle: 'COGNITIVE LOAD THEORY — LECTURE NOTES',
      questions: [
        { n:31, label:'Theory founder',                           answer:'SWELLER',              alt:['sweller','john sweller'] },
        { n:32, label:'Decade of development',                    answer:'1980S',                alt:['1980s','1980'] },
        { n:33, label:'Working memory is',                        answer:'LIMITED',              alt:['limited capacity','strictly limited'] },
        { n:34, label:'Long-term memory stores',                  answer:'MATERIAL',             alt:['material','information'] },
        { n:35, label:'Main application field',                   answer:'INSTRUCTIONAL DESIGN', alt:['instructional design'] },
        { n:36, label:'Organised knowledge structures',           answer:'SCHEMAS',              alt:['schemas','schema'] },
        { n:37, label:'Most effective format for complex topics', answer:'TEXT AND DIAGRAMS',    alt:['text and diagrams','diagrams and text'] },
        { n:38, label:'Introduce complexity',                     answer:'EARLY',                alt:['early'] },
        { n:39, label:'Avoid presenting same info twice',         answer:'REDUNDANT',            alt:['redundant effect','redundant'] },
        { n:40, label:'Growing area of application',              answer:'E-LEARNING',           alt:['e-learning','elearning','online learning'] },
      ]
    }
  ]
};

// ── TEST 02 DATA ──────────────────────────────────────────────────────────────
const TEST02 = {
  id: 'test02',
  title: 'Listening Test 02',
  date: null,
  sections: [
    {
      number: 1,
      title: 'Fitness Centre Registration — Form Completion',
      audio: 'audio/test02/section1.mp3',
      type: 'form',
      formTitle: 'WESTSIDE FITNESS CENTRE — NEW MEMBER FORM',
      questions: [
        { n:1,  label:'Surname',                 answer:'GRIFFITHS',                  alt:['griffiths'] },
        { n:2,  label:'Date of birth',           answer:'23RD MARCH',                 alt:['23rd march','march 23','23 march'] },
        { n:3,  label:'Type of membership',      answer:'MONTHLY',                    alt:['monthly'] },
        { n:4,  label:'Start date',              answer:'7TH JULY',                   alt:['7th july','july 7','7 july'] },
        { n:5,  label:'Swimming lesson day',     answer:'THURSDAY',                   alt:['thursday'] },
        { n:6,  label:'Lesson start time',       answer:'7AM',                        alt:['7am','7 am','7:00','seven'] },
        { n:7,  label:'Email address',           answer:'D.GRIFFITHS@CITYMAIL.COM',   alt:['d.griffiths@citymail.com'] },
        { n:8,  label:'Emergency contact name',  answer:'PATRICIA',                   alt:['patricia'] },
        { n:9,  label:'Emergency contact number',answer:'07734 892116',               alt:['07734892116','07734 892 116'] },
        { n:10, label:'Locker reference',        answer:'247',                        alt:['247'] },
      ]
    },
    {
      number: 2,
      title: 'Science Museum — Map + Multiple Choice',
      audio: 'audio/test02/section2.mp3',
      type: 'mixed',
      groups: [
        {
          type: 'form',
          formTitle: 'RIVERSIDE SCIENCE MUSEUM — GROUND FLOOR',
          instructions: 'Write the letter (A–F) shown on the map next to each room.',
          questions: [
            { n:11, label:'Ocean Life',           answer:'B', alt:['b'] },
            { n:12, label:'Space Technology',     answer:'C', alt:['c'] },
            { n:13, label:'Café',                 answer:'D', alt:['d'] },
            { n:14, label:'Temporary Exhibition', answer:'E', alt:['e'] },
            { n:15, label:'Human Biology',        answer:'F', alt:['f'] },
          ]
        },
        {
          type: 'mc',
          instructions: 'Choose the correct letter, A, B or C.',
          questions: [
            { n:16, text:'What is the theme of the current temporary exhibition?',
              options:['Ancient Egypt','Robotics and Artificial Intelligence','Deep sea exploration'], answer:1 },
            { n:17, text:'What is included in the standard entry ticket?',
              options:['Audio guide','Planetarium show','Guided tour'], answer:0 },
            { n:18, text:"When does the children's science workshop take place?",
              options:['Weekday afternoons','Saturday afternoons','Sunday mornings'], answer:1 },
            { n:19, text:"What is the main purpose of the museum's new app?",
              options:['To book tickets online','To navigate the building','To access additional information about exhibits'], answer:2 },
            { n:20, text:'What does the museum offer specifically for school groups?',
              options:['Free entry for all pupils','A dedicated education officer','Early access before opening'], answer:1 },
          ]
        }
      ]
    },
    {
      number: 3,
      title: 'Climate Policy Tutorial — Matching + MC',
      audio: 'audio/test02/section3.mp3',
      type: 'mixed',
      groups: [
        {
          type: 'matching',
          instructions: 'What position does each researcher hold? Write A, B, C, D, or E.',
          options: [
            'A — Carbon taxation as primary tool',
            'B — Behavioural change over regulation',
            'C — Technology investment priority',
            'D — International cooperation',
            'E — Adaptation over mitigation'
          ],
          questions: [
            { n:21, text:'Torres',    answer:'A', alt:['a'] },
            { n:22, text:'Nakamura', answer:'C', alt:['c'] },
            { n:23, text:'Fischer',  answer:'B', alt:['b'] },
            { n:24, text:'Osei',     answer:'D', alt:['d'] },
            { n:25, text:'Lindqvist',answer:'E', alt:['e'] },
          ]
        },
        {
          type: 'mc',
          instructions: 'Choose the correct letter, A, B or C.',
          questions: [
            { n:26, text:"What does Dr. Marsh say the students should prioritise?",
              options:['The literature review','The methodology section','The case study selection'], answer:0 },
            { n:27, text:"Alex thinks Fischer's behavioural approach is",
              options:['too idealistic','well-supported by evidence','difficult to measure empirically'], answer:2 },
            { n:28, text:'What concern does Fatima raise about carbon taxation?',
              options:['It is regressive without compensatory measures','It is difficult to enforce','It has not succeeded in any country'], answer:0 },
            { n:29, text:'What is the main weakness of international cooperation frameworks according to Dr. Marsh?',
              options:['They are implemented too slowly','They lack enforcement mechanisms','They favour wealthier nations'], answer:1 },
            { n:30, text:'What do Alex and Fatima agree on regarding their project?',
              options:['The scope needs to be narrowed','They need more primary data','The deadline is too tight'], answer:0 },
          ]
        }
      ]
    },
    {
      number: 4,
      title: 'Behavioural Economics — Notes Completion',
      audio: 'audio/test02/section4.mp3',
      type: 'form',
      formTitle: 'BEHAVIOURAL ECONOMICS — LECTURE NOTES',
      questions: [
        { n:31, label:'Combines economics with',                  answer:'PSYCHOLOGY',           alt:['psychology'] },
        { n:32, label:'Classical assumption: humans are',         answer:'RATIONAL',             alt:['rational','perfectly rational'] },
        { n:33, label:'Overvalue losses relative to gains',       answer:'LOSS AVERSION',        alt:['loss aversion'] },
        { n:34, label:'Kahneman & Tversky key model',             answer:'PROSPECT THEORY',      alt:['prospect theory'] },
        { n:35, label:'Relying on first information encountered', answer:'ANCHORING',            alt:['anchoring'] },
        { n:36, label:'Preference for current state of affairs',  answer:'STATUS QUO BIAS',      alt:['status quo bias'] },
        { n:37, label:'Alter behaviour through choice design',    answer:'NUDGE',                alt:['nudge'] },
        { n:38, label:'How options are presented = ',             answer:'CHOICE ARCHITECTURE',  alt:['choice architecture'] },
        { n:39, label:'Limited ability to process information',   answer:'BOUNDED RATIONALITY',  alt:['bounded rationality'] },
        { n:40, label:"Year 'Nudge' published",                   answer:'2008',                 alt:['2008'] },
      ]
    }
  ]
};

// ── TEST 03 DATA — TTS (SpeechSynthesis, no MP3 required) ────────────────────
// script[] = [{t:'text', r:rate, p:pitch}]  r=0.85 staff/lecturer  r=0.92 student
const TEST03 = {
  id: 'test03',
  title: 'Listening Test 03',
  sections: [
    {
      number: 1,
      title: 'CycleCity — Membership Registration',
      type: 'form',
      formTitle: 'CYCLECITY MEMBERSHIP FORM — Q1–10',
      script: [
        {t:"Good morning, CycleCity membership, how can I help you today?", r:0.85, p:1.1},
        {t:"Hi there — I'd like to sign up for a bike hire membership, please.", r:0.92, p:0.88},
        {t:"Of course! I'll take a few details to get you registered. Could I start with your surname?", r:0.85, p:1.1},
        {t:"It's Brennan — B-R-E-N-N-A-N.", r:0.92, p:0.88},
        {t:"Thank you, Mr Brennan. And which membership type would you like? We have daily, monthly, and annual options.", r:0.85, p:1.1},
        {t:"I'll go for the annual membership — much better value if you cycle regularly.", r:0.92, p:0.88},
        {t:"Excellent. And your date of birth, please?", r:0.85, p:1.1},
        {t:"The fourth of June, nineteen eighty-eight.", r:0.92, p:0.88},
        {t:"Fourth of June 1988 — noted. A mobile number we can reach you on?", r:0.85, p:1.1},
        {t:"Yes, it's zero seven seven five three, four two six, eight nine one.", r:0.92, p:0.88},
        {t:"Zero seven seven five three, four two six, eight nine one — perfect. And your home address?", r:0.85, p:1.1},
        {t:"Seventeen Maple Street.", r:0.92, p:0.88},
        {t:"Seventeen Maple Street, thank you. And the postcode?", r:0.85, p:1.1},
        {t:"EC2R 7BP — that's E-C 2 R, 7, B-P.", r:0.92, p:0.88},
        {t:"Got it. We have three collection points — Central Park, the Train Station, and City Hall. Which would you prefer?", r:0.85, p:1.1},
        {t:"The Train Station would be most convenient for me.", r:0.92, p:0.88},
        {t:"Train Station, noted. And for payment — cash, bank transfer, or card?", r:0.85, p:1.1},
        {t:"Card, please.", r:0.92, p:0.88},
        {t:"Of course. Lastly, for safety, could I take an emergency contact surname?", r:0.85, p:1.1},
        {t:"Sure — Walsh, W-A-L-S-H.", r:0.92, p:0.88},
        {t:"Walsh, thank you. You're all set! Your membership number is CY3845. Please make a note of that.", r:0.85, p:1.1},
        {t:"CY3845 — brilliant. Thanks very much!", r:0.92, p:0.88}
      ],
      questions: [
        { n:1,  label:'Customer surname',          answer:'BRENNAN',        alt:['brennan'] },
        { n:2,  label:'Membership type',           answer:'ANNUAL',         alt:['annual'] },
        { n:3,  label:'Date of birth',             answer:'4TH JUNE 1988',  alt:['4 june 1988','fourth june 1988','4/06/1988','4th june','4 june'] },
        { n:4,  label:'Contact number',            answer:'07753 426 891',  alt:['07753426891','07753 426891'] },
        { n:5,  label:'Street',                    answer:'MAPLE STREET',   alt:['maple','17 maple street','maple street'] },
        { n:6,  label:'Postcode',                  answer:'EC2R 7BP',       alt:['ec2r 7bp','ec2r7bp'] },
        { n:7,  label:'Preferred collection point',answer:'TRAIN STATION',  alt:['train station','station'] },
        { n:8,  label:'Payment method',            answer:'CARD',           alt:['card','credit card','debit card'] },
        { n:9,  label:'Emergency contact surname', answer:'WALSH',          alt:['walsh'] },
        { n:10, label:'Membership number',         answer:'CY3845',         alt:['cy 3845','cy3845'] },
      ]
    },
    {
      number: 2,
      title: 'Westfield Library — Orientation & Services',
      type: 'mixed',
      script: [
        {t:"Welcome to Westfield Public Library. I'm going to give you a quick tour and explain how everything works.", r:0.85, p:1.05},
        {t:"If you look at the map you've been given, you'll see areas labelled A to H. Let me tell you where the key facilities are.", r:0.85, p:1.05},
        {t:"The Issue Desk — where you borrow and return books — is marked C on your map, right in the central area as you come through the main entrance.", r:0.85, p:1.05},
        {t:"The Local History Room, containing archives going back to 1850, is in section E — that's the quiet wing on the east side.", r:0.85, p:1.05},
        {t:"The Computer Suite, with 24 workstations on high-speed internet, is at position G, upstairs near the periodicals.", r:0.85, p:1.05},
        {t:"The Study Pods — our individual study rooms — are at position B, just off the main reading area to the left.", r:0.85, p:1.05},
        {t:"And the Children's Corner, with picture books and audio stories for under-twelves, is in section H near the rear exit.", r:0.85, p:1.05},
        {t:"Now a few important points about our services.", r:0.85, p:1.05},
        {t:"The main library is open Monday to Friday until eight in the evening. On Saturdays we open from nine to five, but we are closed on Sundays.", r:0.85, p:1.05},
        {t:"Regarding the Study Pods — they are extremely popular and must be booked in advance through our website or at the Issue Desk.", r:0.85, p:1.05},
        {t:"We recently introduced digital lending. With your card, you can borrow up to three e-readers per month, available for two weeks at a time.", r:0.85, p:1.05},
        {t:"And I'm delighted to tell you that last month we launched our newest service — a 3D printing station on the first floor. It's completely free for current members.", r:0.85, p:1.05}
      ],
      groups: [
        {
          type: 'form',
          formTitle: 'LIBRARY MAP — Q11–15',
          instructions: 'Write the letter (A–H) shown on the map next to each location.',
          questions: [
            { n:11, label:'Issue Desk',          answer:'C', alt:['c'] },
            { n:12, label:'Local History Room',  answer:'E', alt:['e'] },
            { n:13, label:'Computer Suite',      answer:'G', alt:['g'] },
            { n:14, label:'Study Pods',          answer:'B', alt:['b'] },
            { n:15, label:"Children's Corner",   answer:'H', alt:['h'] },
          ]
        },
        {
          type: 'mc',
          instructions: 'Choose the correct letter, A, B or C.',
          questions: [
            { n:16, text:'The main library closes at what time on weekdays?',
              options:['7:00 pm','8:00 pm','9:00 pm'], answer:1 },
            { n:17, text:'Which day is the library closed?',
              options:['Saturday','Sunday','Monday'], answer:1 },
            { n:18, text:'Which facility must be booked in advance?',
              options:['Regular reading seats','Computer workstations','Study Pods'], answer:2 },
            { n:19, text:'With their membership card, members can borrow up to three:',
              options:['audiobooks','e-readers','DVDs'], answer:1 },
            { n:20, text:'The newest library service is:',
              options:['an in-house café','a digital archive room','a 3D printing station'], answer:2 },
          ]
        }
      ]
    },
    {
      number: 3,
      title: 'Environmental Science — Research Discussion',
      type: 'mixed',
      script: [
        {t:"Right, Sarah, Marcus — let's check in on where you are with the research project. What's the focus again?", r:0.85, p:1.0},
        {t:"We're researching Arctic ice coverage — specifically how the rate of decline has accelerated over the past thirty years.", r:0.9, p:1.15},
        {t:"Good. And Marcus, what's your role been so far?", r:0.85, p:1.0},
        {t:"I've been working on the graphs and visualisations — turning the raw data into charts for the report and presentation.", r:0.92, p:0.85},
        {t:"Excellent. Now, who's going to reach out to Doctor Okafor at the Marine Institute for an expert quote?", r:0.85, p:1.0},
        {t:"I'll do that — I've already emailed her once before for a different module.", r:0.9, p:1.15},
        {t:"Perfect, Sarah. Now, the introduction — have you decided who's writing it?", r:0.85, p:1.0},
        {t:"We thought we'd write it together, actually — that way we both understand the framing from the start.", r:0.9, p:1.15},
        {t:"Yes, that makes sense for an introduction — joint effort is fine.", r:0.85, p:1.0},
        {t:"And for the final symposium presentation at the end of term — who's leading that?", r:0.85, p:1.0},
        {t:"Marcus is doing that — he's much more comfortable presenting in front of a group.", r:0.9, p:1.15},
        {t:"Happy to. I've already started preparing the slides.", r:0.92, p:0.85},
        {t:"Good. Now — the word count. You're aiming for three thousand words for the written report, correct?", r:0.85, p:1.0},
        {t:"Yes, three thousand — no more, no less.", r:0.9, p:1.15},
        {t:"And Sarah, why are you including a case study in section three? Some students skip it.", r:0.85, p:1.0},
        {t:"Because abstract data alone can be hard to interpret. A specific real-world case makes it far more accessible for the reader.", r:0.9, p:1.15},
        {t:"Marcus, do you have any suggestions for strengthening the research?", r:0.85, p:1.0},
        {t:"I'd like us to include ten years of temperature records — not just five. That would give the trend much more statistical weight.", r:0.92, p:0.85},
        {t:"Good point. Now — when is the first draft due?", r:0.85, p:1.0},
        {t:"This Friday — we have a tutorial on Monday so we need it ready by then.", r:0.9, p:1.15},
        {t:"Good. I'll look forward to reading it.", r:0.85, p:1.0}
      ],
      groups: [
        {
          type: 'matching',
          instructions: 'Who is responsible for each task? Write A (Sarah), B (Marcus), or C (Both students).',
          options: ['A — Sarah','B — Marcus','C — Both students'],
          questions: [
            { n:21, text:'Research satellite data on Arctic ice decline',    answer:'A', alt:['a'] },
            { n:22, text:'Create graphs and visual presentations',           answer:'B', alt:['b'] },
            { n:23, text:'Contact external expert for a quote',              answer:'A', alt:['a'] },
            { n:24, text:'Write the introduction to the report',            answer:'C', alt:['c'] },
            { n:25, text:'Lead the end-of-term symposium presentation',     answer:'B', alt:['b'] },
          ]
        },
        {
          type: 'mc',
          instructions: 'Choose the correct letter, A, B or C.',
          questions: [
            { n:26, text:"What is the main focus of the students' research project?",
              options:['Arctic ice coverage decline','Ocean temperature rise','Coastal erosion patterns'], answer:0 },
            { n:27, text:'What is the required word count for the written report?',
              options:['2,000 words','3,000 words','5,000 words'], answer:1 },
            { n:28, text:'Why does Sarah want to include a case study?',
              options:['The department requires it','A previous examiner suggested it','It makes abstract data more accessible'], answer:2 },
            { n:29, text:"What is Marcus's suggestion for strengthening the research?",
              options:['Conducting a student survey','Including ten years of temperature data','Visiting a coastal research station'], answer:1 },
            { n:30, text:'When is the first draft of the report due?',
              options:['This Friday','Next Thursday','End of the month'], answer:0 },
          ]
        }
      ]
    },
    {
      number: 4,
      title: 'Lecture — Sleep & Cognitive Performance',
      type: 'form',
      formTitle: 'SLEEP & COGNITIVE PERFORMANCE — LECTURE NOTES',
      script: [
        {t:"Good afternoon, and welcome to today's lecture on sleep and cognitive performance.", r:0.85, p:1.0},
        {t:"We all know sleep matters for physical health, but today we focus specifically on its impact on cognitive performance — our ability to think, reason, and remember.", r:0.85, p:1.0},
        {t:"Let's start with requirements. Research consistently shows that adults need between seven and nine hours of sleep per night. Less than six hours, sustained over several days, produces measurable cognitive impairment.", r:0.85, p:1.0},
        {t:"Now, the most critical stage for cognitive function is REM sleep — Rapid Eye Movement. It is during REM sleep that the brain consolidates memories, filing and organising information from the day.", r:0.85, p:1.0},
        {t:"What deteriorates first under sleep deprivation? Consistently, the evidence points to decision-making. Studies show that after eighteen hours of wakefulness, decision-making performance matches someone at the legal alcohol limit.", r:0.85, p:1.0},
        {t:"At a hormonal level, deep slow-wave sleep triggers the release of growth hormone — essential for tissue repair and immune regulation.", r:0.85, p:1.0},
        {t:"By contrast, sleep loss raises cortisol — the primary stress hormone. Chronically elevated cortisol is linked to impaired memory, anxiety, and poor concentration.", r:0.85, p:1.0},
        {t:"Now — naps. Can a short nap help? Yes, but timing matters. A nap of twenty minutes — what we call a power nap — restores alertness effectively without causing post-sleep grogginess.", r:0.85, p:1.0},
        {t:"On light exposure: the blue light emitted by screens suppresses melatonin — the hormone that tells your brain it's time to sleep. Reducing screen use for an hour before bed significantly improves sleep onset.", r:0.85, p:1.0},
        {t:"Temperature also matters. Research recommends sleeping in a cool environment — ideally between fifteen and nineteen degrees Celsius — to assist the natural drop in core body temperature during sleep.", r:0.85, p:1.0},
        {t:"And finally, the body's twenty-four-hour internal clock — called the circadian rhythm — regulates alertness, temperature, and sleep drive. Disrupting it through irregular schedules or night-shift work has serious cognitive consequences.", r:0.85, p:1.0},
        {t:"To summarise: protect your REM sleep, avoid late screens, and respect your circadian rhythm. These are evidence-based strategies for peak cognitive performance.", r:0.85, p:1.0}
      ],
      questions: [
        { n:31, label:'Main focus beyond physical health',          answer:'COGNITIVE PERFORMANCE', alt:['cognitive performance','cognition','cognitive'] },
        { n:32, label:'Maximum recommended hours per night',        answer:'NINE',                  alt:['9','nine hours'] },
        { n:33, label:'Sleep stage responsible for memory',         answer:'REM',                   alt:['rem sleep'] },
        { n:34, label:'First cognitive function to deteriorate',    answer:'DECISION-MAKING',       alt:['decision making','decisions'] },
        { n:35, label:'Hormone released during deep sleep',         answer:'GROWTH HORMONE',        alt:['growth hormone'] },
        { n:36, label:'Hormone elevated by sleep deprivation',      answer:'CORTISOL',              alt:['cortisol'] },
        { n:37, label:'Optimal nap duration (minutes)',             answer:'TWENTY',                alt:['20','twenty minutes','20 minutes'] },
        { n:38, label:'Hormone suppressed by screens',              answer:'MELATONIN',             alt:['melatonin'] },
        { n:39, label:'Recommended sleep environment',              answer:'COOL',                  alt:['cool','cool environment','15-19 degrees','cool room'] },
        { n:40, label:"Body's 24-hour internal clock",              answer:'CIRCADIAN RHYTHM',      alt:['circadian rhythm','circadian'] },
      ]
    }
  ]
};

const TESTS = { test01: TEST01, test02: TEST02, test03: TEST03 };

// ── SCORES (localStorage) ─────────────────────────────────────────────────────
function saveScore(testId, sectionScores, total) {
  const scores = JSON.parse(localStorage.getItem('ielts_scores') || '{}');
  scores[testId] = { sectionScores, total, band: getBand(total), date: new Date().toLocaleDateString('fr-FR') };
  localStorage.setItem('ielts_scores', JSON.stringify(scores));
}
function getScore(testId) {
  const scores = JSON.parse(localStorage.getItem('ielts_scores') || '{}');
  return scores[testId] || null;
}
function getAllScores() {
  return JSON.parse(localStorage.getItem('ielts_scores') || '{}');
}
