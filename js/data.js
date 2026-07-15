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
      instructions: 'Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
      questions: [
        { n:1,  label:'Guest surname',        answer:'HENDERSON',                    alt:['henderson'] },
        { n:2,  label:'Arrival date',         answer:'14TH',                         alt:['14th','fourteenth','14'] },
        { n:3,  label:'Number of nights',     answer:'3',                            alt:['three'] },
        { n:4,  label:'Room type',            answer:'TWIN',                         alt:['twin room'] },
        { n:5,  label:'Special requirement',  answer:'GROUND',                       alt:['ground floor'] },
        { n:6,  label:'Nightly rate (£)',     answer:'89',                           alt:['£89','89 pounds'] },
        { n:7,  label:'Breakfast',            answer:'INCLUDED',                     alt:['included'] },
        { n:8,  label:'Payment method',       answer:'CREDIT',                       alt:['credit card'] },
        { n:9,  label:'Email address',        answer:'david.henderson@techcorp.com', alt:['david.henderson@techcorp.com'] },
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
            { n:11, label:'Education Centre',      answer:'A', alt:['a'] },
            { n:12, label:'Gift Shop',             answer:'B', alt:['b'] },
            { n:13, label:'Temporary Exhibitions', answer:'C', alt:['c'] },
            { n:14, label:'Dinosaur Gallery',      answer:'D', alt:['d'] },
            { n:15, label:'Restaurant',            answer:'F', alt:['f'] },
          ]
        },
        {
          type: 'mc',
          instructions: 'Choose the correct letter, A, B or C.',
          questions: [
            { n:16, text:'Which new exhibition will open at the museum next month?',
              options:['Rare Gemstones','Deep Ocean Creatures','Antarctic Wildlife'], answer:1 },
            { n:17, text:"What time does the last guided tour of the day now start?",
              options:['2:30 pm','3:00 pm','3:30 pm'], answer:1 },
            { n:18, text:'How much do the audio guides now cost?',
              options:['Nothing, they are free','£2','£5'], answer:0 },
            { n:19, text:'Which part of the museum is currently closed?',
              options:['The Dinosaur Gallery','The East Wing','The Members\' Lounge'], answer:1 },
            { n:20, text:'What are groups of 15 or more asked to do?',
              options:['Book in advance','Use the side entrance on Meridian Road','Pay a group fee'], answer:1 },
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
          instructions: 'Which researcher does each statement apply to? Write A (Patel), B (Mukamura), C (Ofor), D (Santos), or E (Williams).',
          options: ['A — Patel','B — Mukamura','C — Ofor','D — Santos','E — Williams'],
          questions: [
            { n:21, text:"Studies how rooftop vegetation lowers a building's energy use", answer:'A', alt:['a'] },
            { n:22, text:'Found vertical farms use far less water than traditional agriculture', answer:'B', alt:['b'] },
            { n:23, text:'Researches the biodiversity benefits of community gardens', answer:'C', alt:['c'] },
            { n:24, text:'Emphasises the social value of urban food production', answer:'D', alt:['d'] },
            { n:25, text:'Documents large increases in crop yield', answer:'E', alt:['e'] },
          ]
        },
        {
          type: 'mc',
          instructions: 'Choose the correct letter, A, B or C.',
          questions: [
            { n:26, text:'What do James and Maya see as the main weakness of vertical farming?',
              options:['The energy cost of lighting and climate control','The amount of water it uses','Its low crop yield'], answer:0 },
            { n:27, text:'Where do they agree vertical and community farming work best?',
              options:['In city centres','In suburban areas','In rural areas'], answer:1 },
            { n:28, text:'What is their final recommendation for their project?',
              options:['Focus only on vertical farming','Focus only on community gardens','Integrate different methods for different contexts'], answer:2 },
            { n:29, text:'What do they identify as the main barrier to adoption?',
              options:['Public opposition','Technical limitations','Funding and political will'], answer:2 },
            { n:30, text:'According to the Netherlands and Singapore examples, the key enabler was',
              options:['Private investment','Government commitment','High consumer demand'], answer:1 },
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
      instructions: 'Write NO MORE THAN THREE WORDS for each answer.',
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
  id: "test02",
  title: "Listening Test 02",
  date: null,
  sections: [
    {
      number: 1,
      title: "Harbourview Leisure Centre — Membership Enquiry",
      audio: "audio/test02/section1.mp3",
      type: "form",
      formTitle: "HARBOURVIEW LEISURE CENTRE — MEMBERSHIP FORM · Q1–10",
      instructions: "Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.",
      questions: [
        {
          n: 1,
          label: "Surname",
          answer: "PELLETIER",
          alt: [
            "pelletier"
          ]
        },
        {
          n: 2,
          label: "Membership type",
          answer: "OFF-PEAK",
          alt: [
            "off peak",
            "offpeak"
          ]
        },
        {
          n: 3,
          label: "Start date",
          answer: "3 MARCH",
          alt: [
            "third of march",
            "3rd march",
            "march 3",
            "3/3"
          ]
        },
        {
          n: 4,
          label: "Contact number",
          answer: "0491 552 019",
          alt: [
            "0491552019"
          ]
        },
        {
          n: 5,
          label: "Street",
          answer: "WATTLE AVENUE",
          alt: [
            "24 wattle avenue",
            "wattle ave"
          ]
        },
        {
          n: 6,
          label: "Suburb",
          answer: "NEWPORT",
          alt: [
            "newport"
          ]
        },
        {
          n: 7,
          label: "How they heard of us",
          answer: "NEIGHBOUR",
          alt: [
            "a neighbour",
            "neighbor"
          ]
        },
        {
          n: 8,
          label: "Activity of interest",
          answer: "SWIMMING",
          alt: [
            "swim"
          ]
        },
        {
          n: 9,
          label: "Preferred time",
          answer: "EVENINGS",
          alt: [
            "evening",
            "in the evening"
          ]
        },
        {
          n: 10,
          label: "Membership number",
          answer: "HV4712",
          alt: [
            "hv 4712"
          ]
        }
      ]
    },
    {
      number: 2,
      title: "Riverside Community Garden — Volunteer Induction",
      audio: "audio/test02/section2.mp3",
      type: "mixed",
      groups: [
        {
          type: "form",
          formTitle: "RIVERSIDE COMMUNITY GARDEN — SITE MAP · Q11–15",
          instructions: "Label the map below. Write the correct letter, A–H, next to each feature.",
          questions: [
            {
              n: 11,
              label: "Compost area",
              answer: "F",
              alt: [
                "f"
              ]
            },
            {
              n: 12,
              label: "Herb spiral",
              answer: "B",
              alt: [
                "b"
              ]
            },
            {
              n: 13,
              label: "Children's plot",
              answer: "D",
              alt: [
                "d"
              ]
            },
            {
              n: 14,
              label: "Greenhouse",
              answer: "G",
              alt: [
                "g"
              ]
            },
            {
              n: 15,
              label: "Pond",
              answer: "A",
              alt: [
                "a"
              ]
            }
          ]
        },
        {
          type: "mc",
          instructions: "Choose the correct letter, A, B or C.",
          questions: [
            {
              n: 16,
              text: "What must volunteers always bring themselves?",
              options: [
                "Tools",
                "Gloves",
                "A water bottle"
              ],
              answer: 1
            },
            {
              n: 17,
              text: "How often do volunteer sessions take place?",
              options: [
                "Every weekday",
                "Every Saturday",
                "Every weekend"
              ],
              answer: 1
            },
            {
              n: 18,
              text: "What is NOT allowed in the growing beds?",
              options: [
                "Food",
                "Pets",
                "Bicycles"
              ],
              answer: 1
            },
            {
              n: 19,
              text: "Where should watering water be taken from?",
              options: [
                "The tap by the shed",
                "The rainwater tank",
                "The pond"
              ],
              answer: 1
            },
            {
              n: 20,
              text: "How should volunteers report an absence?",
              options: [
                "By email",
                "By phone",
                "By text"
              ],
              answer: 2
            }
          ]
        }
      ]
    },
    {
      number: 3,
      title: "Tutorial — Urban Noise Field Study",
      audio: "audio/test02/section3.mp3",
      type: "mixed",
      groups: [
        {
          type: "mc",
          instructions: "Choose the correct letter, A, B or C.",
          questions: [
            {
              n: 21,
              text: "The students will focus on noise near",
              options: [
                "hospitals",
                "schools",
                "offices"
              ],
              answer: 1
            },
            {
              n: 22,
              text: "How will they measure the noise?",
              options: [
                "with a phone app",
                "with a sound level meter",
                "with a video camera"
              ],
              answer: 1
            },
            {
              n: 23,
              text: "Over what period will they collect data?",
              options: [
                "two days",
                "two weeks",
                "two months"
              ],
              answer: 1
            },
            {
              n: 24,
              text: "What do they expect to be their main difficulty?",
              options: [
                "rain",
                "wind",
                "traffic"
              ],
              answer: 1
            },
            {
              n: 25,
              text: "How often will they log a reading?",
              options: [
                "every five minutes",
                "every fifteen minutes",
                "every thirty minutes"
              ],
              answer: 1
            }
          ]
        },
        {
          type: "matching",
          instructions: "Who is responsible for each task? Write A (Tom), B (Maya) or C (Dr Hollis).",
          options: [
            "A — Tom",
            "B — Maya",
            "C — Dr Hollis"
          ],
          questions: [
            {
              n: 26,
              text: "Plotting the readings onto a site map",
              answer: "A",
              alt: [
                "a"
              ]
            },
            {
              n: 27,
              text: "Interviewing teachers and pupils",
              answer: "B",
              alt: [
                "b"
              ]
            },
            {
              n: 28,
              text: "Recommending background reading",
              answer: "C",
              alt: [
                "c"
              ]
            }
          ]
        },
        {
          type: "form",
          formTitle: "PROJECT DETAILS · Q29–30",
          instructions: "Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
          questions: [
            {
              n: 29,
              label: "Required length of the report",
              answer: "2000 WORDS",
              alt: [
                "two thousand words",
                "2000"
              ]
            },
            {
              n: 30,
              label: "Submission deadline",
              answer: "12 MAY",
              alt: [
                "twelfth of may",
                "may 12",
                "12th may"
              ]
            }
          ]
        }
      ]
    },
    {
      number: 4,
      title: "Lecture — The Rise of Urban Beekeeping",
      audio: "audio/test02/section4.mp3",
      type: "form",
      formTitle: "THE RISE OF URBAN BEEKEEPING — LECTURE NOTES · Q31–40",
      instructions: "Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
      questions: [
        {
          n: 31,
          label: "Trend took off in",
          answer: "PARIS",
          alt: [
            "paris"
          ]
        },
        {
          n: 32,
          label: "Bees forage up to",
          answer: "5 KILOMETRES",
          alt: [
            "five kilometres",
            "5 km",
            "5km"
          ]
        },
        {
          n: 33,
          label: "Cities warmer: heat ___ effect",
          answer: "ISLAND",
          alt: [
            "heat island"
          ]
        },
        {
          n: 34,
          label: "Urban honey praised for its",
          answer: "FLAVOUR",
          alt: [
            "flavor",
            "taste"
          ]
        },
        {
          n: 35,
          label: "Main threat to city bees",
          answer: "PESTICIDES",
          alt: [
            "pesticide"
          ]
        },
        {
          n: 36,
          label: "A hive can hold up to",
          answer: "50000 BEES",
          alt: [
            "fifty thousand",
            "50,000",
            "50000"
          ]
        },
        {
          n: 37,
          label: "Register hives with the local",
          answer: "COUNCIL",
          alt: [
            "local council"
          ]
        },
        {
          n: 38,
          label: "Place hives facing",
          answer: "SOUTH-EAST",
          alt: [
            "southeast",
            "south east"
          ]
        },
        {
          n: 39,
          label: "Swarming most common in",
          answer: "SPRING",
          alt: [
            "in spring"
          ]
        },
        {
          n: 40,
          label: "Future idea: bee-friendly",
          answer: "CORRIDORS",
          alt: [
            "corridor"
          ]
        }
      ]
    }
  ]
};

// ── TEST 03 DATA — TTS (SpeechSynthesis, no MP3 required) ────────────────────
// script[] = [{t:'text', r:rate, p:pitch}]  r=0.85 staff/lecturer  r=0.92 student
// lang = accent de la section (comme le vrai IELTS, qui mélange les accents
// entre sections). Repli automatique sur en-GB si la voix n'existe pas sur la
// machine du candidat, voir resolveAccent() dans listening.html.
const TEST03 = {
  id: 'test03',
  title: 'Listening Test 03',
  sections: [
    {
      number: 1,
      title: 'CycleCity — Membership Registration',
      type: 'form',
      lang: 'en-GB',
      formTitle: 'CYCLECITY MEMBERSHIP FORM — Q1–10',
      instructions: 'Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.',
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
      lang: 'en-AU',
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
      lang: 'en-US',
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
      lang: 'en-GB',
      formTitle: 'SLEEP & COGNITIVE PERFORMANCE — LECTURE NOTES',
      instructions: 'Write NO MORE THAN TWO WORDS for each answer.',
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

// ── PROGRESS (localStorage, incremental save per section/passage) ────────────
// Aucune donnée personnelle : uniquement réponses de test + statut de
// progression. Namespace par module (listening/reading) pour éviter toute
// collision de testId entre les deux.
function saveProgress(module, testId, data) {
  const key = `ielts_progress_${module}_${testId}`;
  localStorage.setItem(key, JSON.stringify({ ...data, updatedAt: Date.now() }));
}
function loadProgress(module, testId) {
  const raw = localStorage.getItem(`ielts_progress_${module}_${testId}`);
  return raw ? JSON.parse(raw) : null;
}
function clearProgress(module, testId) {
  localStorage.removeItem(`ielts_progress_${module}_${testId}`);
}
