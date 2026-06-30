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

const TESTS = { test01: TEST01, test02: TEST02 };

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
