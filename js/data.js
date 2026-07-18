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

// IELTS Academic Reading, score brut /40 vers bande.
// Paliers 19 a 40 : referentiel IELTS ParrotTalk v1 (7 juil. 2026), source de verite.
// Paliers 0 a 18 : prolongement table Cambridge standard (le referentiel s'arrete a 5.5).
const BAND_40_READING_ACADEMIC = {
  40: 9.0, 39: 9.0,
  38: 8.5, 37: 8.5,
  36: 8.0, 35: 8.0,
  34: 7.5, 33: 7.5,
  32: 7.0, 31: 7.0, 30: 7.0,
  29: 6.5, 28: 6.5, 27: 6.5,
  26: 6.0, 25: 6.0, 24: 6.0, 23: 6.0,
  22: 5.5, 21: 5.5, 20: 5.5, 19: 5.5,
  18: 5.0, 17: 5.0, 16: 5.0, 15: 5.0,
  14: 4.5, 13: 4.5,
  12: 4.0, 11: 4.0, 10: 4.0,
  9: 3.5, 8: 3.5,
  7: 3.0, 6: 3.0,
  5: 2.5, 4: 2.5,
  3: 2.0, 2: 2.0,
  1: 1.0, 0: 1.0
};

// Tables de conversion par module. Listening et Reading ont des courbes brut vers
// bande distinctes (IELTS officiel). getBand route selon le module ; defaut = listening
// pour que tous les appels Listening existants restent inchanges.
const BAND_TABLES = { listening: BAND_40, reading: BAND_40_READING_ACADEMIC };

function getBand(raw, module) {
  const table = BAND_TABLES[module] || BAND_40;
  return table[Math.min(raw, 40)] || 1.0;
}

// ── TEST 01 DATA ──────────────────────────────────────────────────────────────
const TEST01 = {
  id: "test01",
  title: "Listening Test 01",
  date: null,
  sections: [
    {
      number: 1,
      title: "Greenline Coach Travel: Ticket Booking",
      audio: "audio/test01/section1.mp3",
      cues: [
        {
          t: 19.73,
          reveal: [
            1,
            5
          ],
          phase: "reading"
        },
        {
          t: 67.03,
          activate: [
            1,
            5
          ]
        },
        {
          t: 138.89,
          reveal: [
            6,
            10
          ],
          phase: "reading"
        },
        {
          t: 168.42,
          activate: [
            6,
            10
          ]
        },
        {
          t: 239.85,
          end: true
        }
      ],
      type: "form",
      formTitle: "GREENLINE COACH TRAVEL: BOOKING FORM · Q1-10",
      instructions: "Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.",
      questions: [
        {
          n: 1,
          label: "Surname",
          answer: "DONNELLY",
          alt: [
            "donnelly"
          ]
        },
        {
          n: 2,
          label: "Destination",
          answer: "EDINBURGH",
          alt: [
            "edinburgh"
          ]
        },
        {
          n: 3,
          label: "Travel date",
          answer: "12 SEPTEMBER",
          alt: [
            "twelfth of september",
            "12 sept",
            "sept 12",
            "12/9"
          ]
        },
        {
          n: 4,
          label: "Number of passengers",
          answer: "3",
          alt: [
            "three"
          ]
        },
        {
          n: 5,
          label: "Seat preference",
          answer: "WINDOW",
          alt: [
            "window seat",
            "a window seat"
          ]
        },
        {
          n: 6,
          label: "Departure time",
          answer: "11 AM",
          alt: [
            "eleven",
            "eleven am",
            "11am",
            "11:00"
          ]
        },
        {
          n: 7,
          label: "Discounted fare (£)",
          answer: "34",
          alt: [
            "£34",
            "thirty-four",
            "34 pounds"
          ]
        },
        {
          n: 8,
          label: "Discount card",
          answer: "STUDENT",
          alt: [
            "student card"
          ]
        },
        {
          n: 9,
          label: "Payment method",
          answer: "DEBIT CARD",
          alt: [
            "debit",
            "by debit card"
          ]
        },
        {
          n: 10,
          label: "Booking reference",
          answer: "GL7208",
          alt: [
            "gl 7208"
          ]
        }
      ]
    },
    {
      number: 2,
      title: "Oakmoor Country Park: Visitor Orientation",
      audio: "audio/test01/section2.mp3",
      cues: [
        {
          t: 8.02,
          reveal: [
            11,
            15
          ],
          phase: "reading"
        },
        {
          t: 37.64,
          activate: [
            11,
            15
          ]
        },
        {
          t: 102.4,
          reveal: [
            16,
            20
          ],
          phase: "reading"
        },
        {
          t: 132.24,
          activate: [
            16,
            20
          ]
        },
        {
          t: 195.5,
          end: true
        }
      ],
      type: "mixed",
      groups: [
        {
          type: "form",
          formTitle: "OAKMOOR COUNTRY PARK: MAP · Q11-15",
          instructions: "Label the map below. Write the correct letter, A-H, next to each place.",
          questions: [
            {
              n: 11,
              label: "Visitor Centre",
              answer: "C",
              alt: [
                "c"
              ]
            },
            {
              n: 12,
              label: "Bird hide",
              answer: "F",
              alt: [
                "f"
              ]
            },
            {
              n: 13,
              label: "Picnic area",
              answer: "A",
              alt: [
                "a"
              ]
            },
            {
              n: 14,
              label: "Boat hire",
              answer: "H",
              alt: [
                "h"
              ]
            },
            {
              n: 15,
              label: "Adventure playground",
              answer: "D",
              alt: [
                "d"
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
              text: "When is the park at its busiest?",
              options: [
                "On weekday mornings",
                "On Sundays",
                "On public holidays"
              ],
              answer: 1
            },
            {
              n: 17,
              text: "What are visitors asked to do with their dogs?",
              options: [
                "Leave them at home",
                "Keep them on a lead",
                "Let them run free"
              ],
              answer: 1
            },
            {
              n: 18,
              text: "The main café is currently",
              options: [
                "open every day",
                "open at weekends only",
                "closed completely"
              ],
              answer: 1
            },
            {
              n: 19,
              text: "To join a guided walk, visitors must",
              options: [
                "just turn up",
                "book at the information desk",
                "pay a fee online"
              ],
              answer: 1
            },
            {
              n: 20,
              text: "The main safety warning concerns",
              options: [
                "slippery paths",
                "deep water",
                "falling branches"
              ],
              answer: 1
            }
          ]
        }
      ]
    },
    {
      number: 3,
      title: "Tutorial: Renewable Energy Presentation",
      audio: "audio/test01/section3.mp3",
      cues: [
        {
          t: 8.52,
          reveal: [
            21,
            25
          ],
          phase: "reading"
        },
        {
          t: 39.1,
          activate: [
            21,
            25
          ]
        },
        {
          t: 118.85,
          reveal: [
            26,
            30
          ],
          phase: "reading"
        },
        {
          t: 149.53,
          activate: [
            26,
            30
          ]
        },
        {
          t: 199.47,
          end: true
        }
      ],
      type: "mixed",
      groups: [
        {
          type: "mc",
          instructions: "Choose the correct letter, A, B or C.",
          questions: [
            {
              n: 21,
              text: "Which type of energy did the students finally choose?",
              options: [
                "tidal power",
                "wind energy",
                "solar power"
              ],
              answer: 1
            },
            {
              n: 22,
              text: "What was their main source of evidence?",
              options: [
                "government reports",
                "a survey they ran",
                "published interviews"
              ],
              answer: 1
            },
            {
              n: 23,
              text: "What surprised them most?",
              options: [
                "the high cost",
                "the level of public support",
                "the technical problems"
              ],
              answer: 1
            },
            {
              n: 24,
              text: "What is the main weakness of their draft?",
              options: [
                "it is too short",
                "it has no visuals",
                "it is off the topic"
              ],
              answer: 1
            },
            {
              n: 25,
              text: "How long must the presentation be?",
              options: [
                "ten minutes",
                "fifteen minutes",
                "twenty minutes"
              ],
              answer: 1
            }
          ]
        },
        {
          type: "matching",
          instructions: "Who will do each task? Write A (Ben), B (Priya) or C (Dr Reyes).",
          options: [
            "A: Ben",
            "B: Priya",
            "C: Dr Reyes"
          ],
          questions: [
            {
              n: 26,
              text: "Designing the slides",
              answer: "A",
              alt: [
                "a"
              ]
            },
            {
              n: 27,
              text: "Writing the script",
              answer: "B",
              alt: [
                "b"
              ]
            },
            {
              n: 28,
              text: "Checking the references",
              answer: "C",
              alt: [
                "c"
              ]
            }
          ]
        },
        {
          type: "form",
          formTitle: "PRESENTATION DETAILS · Q29-30",
          instructions: "Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
          questions: [
            {
              n: 29,
              label: "Slides must be submitted by",
              answer: "FRIDAY",
              alt: [
                "on friday"
              ]
            },
            {
              n: 30,
              label: "Presentation room",
              answer: "ROOM 12",
              alt: [
                "room twelve",
                "12"
              ]
            }
          ]
        }
      ]
    },
    {
      number: 4,
      title: "Lecture: A Short History of Chocolate",
      audio: "audio/test01/section4.mp3",
      cues: [
        {
          t: 5.06,
          reveal: [
            31,
            40
          ],
          phase: "reading"
        },
        {
          t: 34.9,
          activate: [
            31,
            40
          ]
        },
        {
          t: 170.77,
          end: true
        }
      ],
      type: "form",
      formTitle: "A SHORT HISTORY OF CHOCOLATE: LECTURE NOTES · Q31-40",
      instructions: "Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
      questions: [
        {
          n: 31,
          label: "Aztecs used cacao beans as a form of",
          answer: "MONEY",
          alt: [
            "currency"
          ]
        },
        {
          n: 32,
          label: "Original drink flavoured with",
          answer: "CHILLI",
          alt: [
            "chili",
            "chillies",
            "chilli and spices"
          ]
        },
        {
          n: 33,
          label: "Chocolate first reached Europe via",
          answer: "SPAIN",
          alt: [
            "spain"
          ]
        },
        {
          n: 34,
          label: "In Europe, added to sweeten it",
          answer: "SUGAR",
          alt: [
            "sugar"
          ]
        },
        {
          n: 35,
          label: "At first only affordable to the",
          answer: "WEALTHY",
          alt: [
            "rich",
            "the wealthy"
          ]
        },
        {
          n: 36,
          label: "In 1828 a Dutch chemist invented a",
          answer: "PRESS",
          alt: [
            "a press",
            "cocoa press"
          ]
        },
        {
          n: 37,
          label: "First solid eating bar made in (year)",
          answer: "1847",
          alt: [
            "1847"
          ]
        },
        {
          n: 38,
          label: "Milk chocolate created by adding",
          answer: "MILK",
          alt: [
            "milk"
          ]
        },
        {
          n: 39,
          label: "Today's largest cacao producer",
          answer: "IVORY COAST",
          alt: [
            "the ivory coast",
            "cote divoire"
          ]
        },
        {
          n: 40,
          label: "Main current concern for the industry",
          answer: "SUSTAINABILITY",
          alt: [
            "sustainable"
          ]
        }
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
      title: "Harbourview Leisure Centre: Membership",
      audio: "audio/test02/section1.mp3",
      cues: [
        {
          t: 20.28,
          reveal: [
            1,
            5
          ],
          phase: "reading"
        },
        {
          t: 66.33,
          activate: [
            1,
            5
          ]
        },
        {
          t: 127.61,
          reveal: [
            6,
            10
          ],
          phase: "reading"
        },
        {
          t: 157.14,
          activate: [
            6,
            10
          ]
        },
        {
          t: 206.31,
          end: true
        }
      ],
      type: "form",
      formTitle: "HARBOURVIEW LEISURE CENTRE: MEMBERSHIP FORM · Q1-10",
      instructions: "Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.",
      questions: [
        {
          n: 1,
          label: "Family name",
          answer: "PELLETIER",
          alt: [
            "pelletier"
          ]
        },
        {
          n: 2,
          label: "Type of membership chosen",
          answer: "OFF-PEAK",
          alt: [
            "off peak",
            "offpeak"
          ]
        },
        {
          n: 3,
          label: "Membership begins on",
          answer: "3 MARCH",
          alt: [
            "third of march",
            "3rd march",
            "march 3"
          ]
        },
        {
          n: 4,
          label: "Amount paid each month (£)",
          answer: "29",
          alt: [
            "twenty-nine",
            "£29",
            "29 pounds"
          ]
        },
        {
          n: 5,
          label: "Main activity of interest",
          answer: "SWIMMING",
          alt: [
            "swim"
          ]
        },
        {
          n: 6,
          label: "When he plans to attend",
          answer: "EVENINGS",
          alt: [
            "evening",
            "after work"
          ]
        },
        {
          n: 7,
          label: "Referral source",
          answer: "NEIGHBOUR",
          alt: [
            "a neighbour",
            "neighbor"
          ]
        },
        {
          n: 8,
          label: "Refundable locker deposit (£)",
          answer: "5",
          alt: [
            "five",
            "£5",
            "five pounds"
          ]
        },
        {
          n: 9,
          label: "Emergency contact surname",
          answer: "WALSH",
          alt: [
            "walsh"
          ]
        },
        {
          n: 10,
          label: "Membership ID",
          answer: "HV5163",
          alt: [
            "hv 5163"
          ]
        }
      ]
    },
    {
      number: 2,
      title: "Riverside Community Garden: Volunteer Induction",
      audio: "audio/test02/section2.mp3",
      cues: [
        {
          t: 6.94,
          reveal: [
            11,
            15
          ],
          phase: "reading"
        },
        {
          t: 36.56,
          activate: [
            11,
            15
          ]
        },
        {
          t: 83.66,
          reveal: [
            16,
            20
          ],
          phase: "reading"
        },
        {
          t: 113.5,
          activate: [
            16,
            20
          ]
        },
        {
          t: 156,
          end: true
        }
      ],
      type: "mixed",
      groups: [
        {
          type: "form",
          formTitle: "RIVERSIDE COMMUNITY GARDEN: MAP · Q11-15",
          instructions: "Label the map below. Write the correct letter, A-H, next to each feature.",
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
              label: "Tool shed",
              answer: "B",
              alt: [
                "b"
              ]
            },
            {
              n: 13,
              label: "Pond",
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
              label: "Herb beds",
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
              text: "When do most volunteers attend?",
              options: [
                "Wednesday evenings",
                "Saturday mornings",
                "Both days equally"
              ],
              answer: 1
            },
            {
              n: 17,
              text: "What must volunteers bring themselves?",
              options: [
                "Tools",
                "Gloves",
                "Seeds"
              ],
              answer: 1
            }
          ]
        },
        {
          type: "form",
          formTitle: "VOLUNTEER NOTES · Q18-20",
          instructions: "Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
          questions: [
            {
              n: 18,
              label: "Source of water for the plants",
              answer: "RAINWATER TANK",
              alt: [
                "rainwater",
                "the tank"
              ]
            },
            {
              n: 19,
              label: "Best way to report an absence",
              answer: "TEXT",
              alt: [
                "a text",
                "text message"
              ]
            },
            {
              n: 20,
              label: "Recommended footwear",
              answer: "BOOTS",
              alt: [
                "boots"
              ]
            }
          ]
        }
      ]
    },
    {
      number: 3,
      title: "Tutorial: Urban Noise Project",
      audio: "audio/test02/section3.mp3",
      cues: [
        {
          t: 7.94,
          reveal: [
            21,
            25
          ],
          phase: "reading"
        },
        {
          t: 38.53,
          activate: [
            21,
            25
          ]
        },
        {
          t: 79.68,
          reveal: [
            26,
            30
          ],
          phase: "reading"
        },
        {
          t: 110.36,
          activate: [
            26,
            30
          ]
        },
        {
          t: 144.17,
          end: true
        }
      ],
      type: "mixed",
      groups: [
        {
          type: "mc",
          instructions: "Choose the correct letter, A, B or C.",
          questions: [
            {
              n: 21,
              text: "Where have the students decided to focus?",
              options: [
                "the ring road",
                "near the schools",
                "the town centre"
              ],
              answer: 1
            },
            {
              n: 22,
              text: "Over what period will they collect readings?",
              options: [
                "two weeks",
                "one month",
                "two months"
              ],
              answer: 0
            },
            {
              n: 23,
              text: "What concerns them most about the fieldwork?",
              options: [
                "the traffic",
                "the wind",
                "the rain"
              ],
              answer: 1
            }
          ]
        },
        {
          type: "matching",
          instructions: "Who will carry out each task? Write A (Tom), B (Maya) or C (Dr Hollis).",
          options: [
            "A: Tom",
            "B: Maya",
            "C: Dr Hollis"
          ],
          questions: [
            {
              n: 24,
              text: "Recording the noise levels",
              answer: "A",
              alt: [
                "a"
              ]
            },
            {
              n: 25,
              text: "Interviewing residents",
              answer: "B",
              alt: [
                "b"
              ]
            },
            {
              n: 26,
              text: "Drawing the site map",
              answer: "A",
              alt: [
                "a"
              ]
            },
            {
              n: 27,
              text: "Providing the sound meter",
              answer: "C",
              alt: [
                "c"
              ]
            }
          ]
        },
        {
          type: "form",
          formTitle: "PROJECT DETAILS · Q28-30",
          instructions: "Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
          questions: [
            {
              n: 28,
              label: "A reading is logged every",
              answer: "15 MINUTES",
              alt: [
                "fifteen minutes"
              ]
            },
            {
              n: 29,
              label: "Length of the write-up",
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
                "may 12"
              ]
            }
          ]
        }
      ]
    },
    {
      number: 4,
      title: "Lecture: The Rise of Urban Beekeeping",
      audio: "audio/test02/section4.mp3",
      cues: [
        {
          t: 5.4,
          reveal: [
            31,
            40
          ],
          phase: "reading"
        },
        {
          t: 35.24,
          activate: [
            31,
            40
          ]
        },
        {
          t: 120.21,
          end: true
        }
      ],
      type: "form",
      formTitle: "THE RISE OF URBAN BEEKEEPING: LECTURE NOTES · Q31-40",
      instructions: "Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
      questions: [
        {
          n: 31,
          label: "City where the trend began",
          answer: "PARIS",
          alt: [
            "paris"
          ]
        },
        {
          n: 32,
          label: "How far bees travel to feed",
          answer: "5 KILOMETRES",
          alt: [
            "five kilometres",
            "5 km",
            "5km"
          ]
        },
        {
          n: 33,
          label: "Cities warmer due to the ___ effect",
          answer: "ISLAND",
          alt: [
            "heat island"
          ]
        },
        {
          n: 34,
          label: "Quality city honey is praised for",
          answer: "FLAVOUR",
          alt: [
            "flavor",
            "taste"
          ]
        },
        {
          n: 35,
          label: "Biggest danger to city bees",
          answer: "PESTICIDES",
          alt: [
            "pesticide"
          ]
        },
        {
          n: 36,
          label: "Maximum bees in one hive",
          answer: "50000",
          alt: [
            "fifty thousand",
            "50,000"
          ]
        },
        {
          n: 37,
          label: "Must register hives with the local",
          answer: "COUNCIL",
          alt: [
            "local council"
          ]
        },
        {
          n: 38,
          label: "Direction to face the hives",
          answer: "SOUTH-EAST",
          alt: [
            "southeast",
            "south east"
          ]
        },
        {
          n: 39,
          label: "Season when colonies split",
          answer: "SPRING",
          alt: [
            "in spring"
          ]
        },
        {
          n: 40,
          label: "Planned bee-friendly ___",
          answer: "CORRIDORS",
          alt: [
            "corridor"
          ]
        }
      ]
    }
  ]
};

// ── TEST 03 DATA: TTS (SpeechSynthesis, no MP3 required) ────────────────────
// script[] = [{t:'text', r:rate, p:pitch}]  r=0.85 staff/lecturer  r=0.92 student
// lang = accent de la section (comme le vrai IELTS, qui mélange les accents
// entre sections). Repli automatique sur en-GB si la voix n'existe pas sur la
// machine du candidat, voir resolveAccent() dans listening.html.
const TEST03 = {
  id: "test03",
  title: "Listening Test 03",
  date: null,
  sections: [
    {
      number: 1,
      title: "Meadowbank Community Hall: Event Booking",
      audio: "audio/test03/section1.mp3",
      cues: [
        {
          t: 19.7,
          reveal: [
            1,
            5
          ],
          phase: "reading"
        },
        {
          t: 68.59,
          activate: [
            1,
            5
          ]
        },
        {
          t: 134.38,
          reveal: [
            6,
            10
          ],
          phase: "reading"
        },
        {
          t: 163.91,
          activate: [
            6,
            10
          ]
        },
        {
          t: 223.61,
          end: true
        }
      ],
      type: "form",
      formTitle: "MEADOWBANK COMMUNITY HALL: BOOKING FORM · Q1-10",
      instructions: "Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.",
      questions: [
        {
          n: 1,
          label: "Surname",
          answer: "HARGREAVES",
          alt: [
            "hargreaves"
          ]
        },
        {
          n: 2,
          label: "Type of event",
          answer: "WEDDING",
          alt: [
            "wedding reception"
          ]
        },
        {
          n: 3,
          label: "Date",
          answer: "18 OCTOBER",
          alt: [
            "eighteenth of october",
            "18 oct",
            "oct 18"
          ]
        },
        {
          n: 4,
          label: "Number of guests",
          answer: "120",
          alt: [
            "a hundred and twenty",
            "one hundred twenty"
          ]
        },
        {
          n: 5,
          label: "Room booked",
          answer: "GARDEN ROOM",
          alt: [
            "garden room",
            "the garden room"
          ]
        },
        {
          n: 6,
          label: "Start time",
          answer: "6 PM",
          alt: [
            "six",
            "six pm",
            "6pm",
            "18:00"
          ]
        },
        {
          n: 7,
          label: "Catering",
          answer: "OWN",
          alt: [
            "own catering",
            "their own",
            "bring their own"
          ]
        },
        {
          n: 8,
          label: "Equipment needed",
          answer: "PROJECTOR",
          alt: [
            "a projector"
          ]
        },
        {
          n: 9,
          label: "Deposit (£)",
          answer: "150",
          alt: [
            "£150",
            "a hundred and fifty",
            "150 pounds"
          ]
        },
        {
          n: 10,
          label: "Booking reference",
          answer: "CH2291",
          alt: [
            "ch 2291"
          ]
        }
      ]
    },
    {
      number: 2,
      title: "Seabridge Aquarium: Visitor Briefing",
      audio: "audio/test03/section2.mp3",
      cues: [
        {
          t: 6.77,
          reveal: [
            11,
            15
          ],
          phase: "reading"
        },
        {
          t: 36.39,
          activate: [
            11,
            15
          ]
        },
        {
          t: 89.68,
          reveal: [
            16,
            20
          ],
          phase: "reading"
        },
        {
          t: 119.52,
          activate: [
            16,
            20
          ]
        },
        {
          t: 166.41,
          end: true
        }
      ],
      type: "mixed",
      groups: [
        {
          type: "form",
          formTitle: "SEABRIDGE AQUARIUM: MAP · Q11-15",
          instructions: "Label the map below. Write the correct letter, A-H, next to each place.",
          questions: [
            {
              n: 11,
              label: "Touch pool",
              answer: "E",
              alt: [
                "e"
              ]
            },
            {
              n: 12,
              label: "Shark tank",
              answer: "G",
              alt: [
                "g"
              ]
            },
            {
              n: 13,
              label: "Café",
              answer: "C",
              alt: [
                "c"
              ]
            },
            {
              n: 14,
              label: "Cloakroom",
              answer: "B",
              alt: [
                "b"
              ]
            },
            {
              n: 15,
              label: "Gift shop",
              answer: "H",
              alt: [
                "h"
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
              text: "On which day does the aquarium close early?",
              options: [
                "Sunday",
                "Monday",
                "Friday"
              ],
              answer: 1
            },
            {
              n: 17,
              text: "What time does the penguin feeding take place?",
              options: [
                "10:30",
                "11:30",
                "2:00"
              ],
              answer: 1
            },
            {
              n: 18,
              text: "What is the rule about photography?",
              options: [
                "No photos at all",
                "No flash near the tanks",
                "No phones"
              ],
              answer: 1
            },
            {
              n: 19,
              text: "What does annual membership include?",
              options: [
                "Free parking",
                "A café discount",
                "A free gift"
              ],
              answer: 1
            },
            {
              n: 20,
              text: "What is the main safety instruction?",
              options: [
                "Wear a wristband",
                "Don't lean over the tanks",
                "Stay with a guide"
              ],
              answer: 1
            }
          ]
        }
      ]
    },
    {
      number: 3,
      title: "Tutorial: Geography Field Trip Planning",
      audio: "audio/test03/section3.mp3",
      cues: [
        {
          t: 7.99,
          reveal: [
            21,
            25
          ],
          phase: "reading"
        },
        {
          t: 38.58,
          activate: [
            21,
            25
          ]
        },
        {
          t: 94.03,
          reveal: [
            26,
            30
          ],
          phase: "reading"
        },
        {
          t: 124.71,
          activate: [
            26,
            30
          ]
        },
        {
          t: 168.05,
          end: true
        }
      ],
      type: "mixed",
      groups: [
        {
          type: "mc",
          instructions: "Choose the correct letter, A, B or C.",
          questions: [
            {
              n: 21,
              text: "Where have the students decided to go?",
              options: [
                "to the coast",
                "to a river valley",
                "to a mountain"
              ],
              answer: 1
            },
            {
              n: 22,
              text: "What is the main focus of their study?",
              options: [
                "erosion",
                "pollution",
                "wildlife"
              ],
              answer: 0
            },
            {
              n: 23,
              text: "What will they borrow from the department?",
              options: [
                "cameras",
                "GPS units",
                "drones"
              ],
              answer: 1
            },
            {
              n: 24,
              text: "What do they see as the main risk?",
              options: [
                "traffic",
                "the weather",
                "deep water"
              ],
              answer: 1
            },
            {
              n: 25,
              text: "How long will the trip last?",
              options: [
                "one day",
                "two days",
                "a week"
              ],
              answer: 1
            }
          ]
        },
        {
          type: "matching",
          instructions: "Who will do each task? Write A (Sam), B (Nadia) or C (Dr Okafor).",
          options: [
            "A: Sam",
            "B: Nadia",
            "C: Dr Okafor"
          ],
          questions: [
            {
              n: 26,
              text: "Measuring the river",
              answer: "A",
              alt: [
                "a"
              ]
            },
            {
              n: 27,
              text: "Interviewing local farmers",
              answer: "B",
              alt: [
                "b"
              ]
            },
            {
              n: 28,
              text: "Arranging the transport",
              answer: "C",
              alt: [
                "c"
              ]
            }
          ]
        },
        {
          type: "form",
          formTitle: "FIELD TRIP DETAILS · Q29-30",
          instructions: "Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
          questions: [
            {
              n: 29,
              label: "Report due date",
              answer: "15 NOVEMBER",
              alt: [
                "fifteenth of november",
                "nov 15"
              ]
            },
            {
              n: 30,
              label: "Maximum group size",
              answer: "8 STUDENTS",
              alt: [
                "eight students",
                "eight",
                "8"
              ]
            }
          ]
        }
      ]
    },
    {
      number: 4,
      title: "Lecture: A Short History of Tea",
      audio: "audio/test03/section4.mp3",
      cues: [
        {
          t: 4.82,
          reveal: [
            31,
            40
          ],
          phase: "reading"
        },
        {
          t: 34.66,
          activate: [
            31,
            40
          ]
        },
        {
          t: 135.45,
          end: true
        }
      ],
      type: "form",
      formTitle: "A SHORT HISTORY OF TEA: LECTURE NOTES · Q31-40",
      instructions: "Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
      questions: [
        {
          n: 31,
          label: "Tea plant originally native to",
          answer: "CHINA",
          alt: [
            "china"
          ]
        },
        {
          n: 32,
          label: "For trade, leaves compressed into",
          answer: "BRICKS",
          alt: [
            "brick"
          ]
        },
        {
          n: 33,
          label: "Brought to Europe mainly by ___ traders",
          answer: "DUTCH",
          alt: [
            "the dutch"
          ]
        },
        {
          n: 34,
          label: "Made fashionable in Britain by a",
          answer: "QUEEN",
          alt: [
            "a queen"
          ]
        },
        {
          n: 35,
          label: "Heavy ___ led to smuggling",
          answer: "TAX",
          alt: [
            "taxes",
            "a tax"
          ]
        },
        {
          n: 36,
          label: "The 1773 protest: the Boston Tea ___",
          answer: "PARTY",
          alt: [
            "tea party"
          ]
        },
        {
          n: 37,
          label: "British grew tea themselves in",
          answer: "INDIA",
          alt: [
            "india"
          ]
        },
        {
          n: 38,
          label: "Fast tea ___ raced to London",
          answer: "SHIPS",
          alt: [
            "clippers",
            "tea clippers",
            "sailing ships"
          ]
        },
        {
          n: 39,
          label: "Distinctive British habit: adding",
          answer: "MILK",
          alt: [
            "milk"
          ]
        },
        {
          n: 40,
          label: "Country drinking most tea per person",
          answer: "TURKEY",
          alt: [
            "turkey"
          ]
        }
      ]
    }
  ]
};

const TEST04 = {
  id: "test04",
  title: "Listening Test 04",
  date: null,
  sections: [
    {
      number: 1,
      title: "Oakwood Student Lettings: Room Enquiry",
      audio: "audio/test04/section1.mp3",
      cues: [
        {
          t: 19.49,
          reveal: [
            1,
            5
          ],
          phase: "reading"
        },
        {
          t: 66.4,
          activate: [
            1,
            5
          ]
        },
        {
          t: 122.67,
          reveal: [
            6,
            10
          ],
          phase: "reading"
        },
        {
          t: 152.19,
          activate: [
            6,
            10
          ]
        },
        {
          t: 201.99,
          end: true
        }
      ],
      type: "form",
      formTitle: "OAKWOOD STUDENT LETTINGS: ENQUIRY FORM · Q1-10",
      instructions: "Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.",
      questions: [
        {
          n: 1,
          label: "Surname",
          answer: "ASHWORTH",
          alt: [
            "ashworth"
          ]
        },
        {
          n: 2,
          label: "Type of room chosen",
          answer: "EN-SUITE",
          alt: [
            "ensuite",
            "en suite"
          ]
        },
        {
          n: 3,
          label: "Weekly rent (£)",
          answer: "140",
          alt: [
            "£140",
            "a hundred and forty",
            "140 pounds"
          ]
        },
        {
          n: 4,
          label: "Move-in date",
          answer: "1 SEPTEMBER",
          alt: [
            "first of september",
            "1 sept",
            "sept 1"
          ]
        },
        {
          n: 5,
          label: "Length of tenancy",
          answer: "9 MONTHS",
          alt: [
            "nine months"
          ]
        },
        {
          n: 6,
          label: "Deposit (£)",
          answer: "200",
          alt: [
            "£200",
            "two hundred",
            "200 pounds"
          ]
        },
        {
          n: 7,
          label: "Bill paid separately",
          answer: "ELECTRICITY",
          alt: [
            "electric"
          ]
        },
        {
          n: 8,
          label: "Distance to campus on foot",
          answer: "15 MINUTES",
          alt: [
            "fifteen minutes"
          ]
        },
        {
          n: 9,
          label: "Preferred way to make contact",
          answer: "EMAIL",
          alt: [
            "by email",
            "e-mail"
          ]
        },
        {
          n: 10,
          label: "Enquiry reference",
          answer: "OW3480",
          alt: [
            "ow 3480"
          ]
        }
      ]
    },
    {
      number: 2,
      title: "Northgate Library: New Member Tour",
      audio: "audio/test04/section2.mp3",
      cues: [
        {
          t: 6.77,
          reveal: [
            11,
            15
          ],
          phase: "reading"
        },
        {
          t: 36.39,
          activate: [
            11,
            15
          ]
        },
        {
          t: 84.07,
          reveal: [
            16,
            20
          ],
          phase: "reading"
        },
        {
          t: 113.91,
          activate: [
            16,
            20
          ]
        },
        {
          t: 157.44,
          end: true
        }
      ],
      type: "mixed",
      groups: [
        {
          type: "form",
          formTitle: "NORTHGATE LIBRARY: PLAN · Q11-15",
          instructions: "Label the plan below. Write the correct letter, A-H, next to each area.",
          questions: [
            {
              n: 11,
              label: "Returns desk",
              answer: "C",
              alt: [
                "c"
              ]
            },
            {
              n: 12,
              label: "Children's area",
              answer: "F",
              alt: [
                "f"
              ]
            },
            {
              n: 13,
              label: "Computers",
              answer: "A",
              alt: [
                "a"
              ]
            },
            {
              n: 14,
              label: "Quiet study room",
              answer: "G",
              alt: [
                "g"
              ]
            },
            {
              n: 15,
              label: "Café",
              answer: "D",
              alt: [
                "d"
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
              text: "On which day does the library open late?",
              options: [
                "Tuesday",
                "Thursday",
                "Saturday"
              ],
              answer: 1
            },
            {
              n: 17,
              text: "How many items can members borrow at once?",
              options: [
                "three",
                "eight",
                "twelve"
              ],
              answer: 2
            }
          ]
        },
        {
          type: "form",
          formTitle: "MEMBERSHIP NOTES · Q18-20",
          instructions: "Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
          questions: [
            {
              n: 18,
              label: "What new members must bring to join",
              answer: "ID",
              alt: [
                "identification",
                "some id"
              ]
            },
            {
              n: 19,
              label: "Daily charge for an overdue book",
              answer: "20P",
              alt: [
                "20 pence",
                "twenty pence"
              ]
            },
            {
              n: 20,
              label: "Free event on Saturday mornings",
              answer: "STORYTIME",
              alt: [
                "story time",
                "storytelling"
              ]
            }
          ]
        }
      ]
    },
    {
      number: 3,
      title: "Tutorial: Campus Café Market Research",
      audio: "audio/test04/section3.mp3",
      cues: [
        {
          t: 9.31,
          reveal: [
            21,
            25
          ],
          phase: "reading"
        },
        {
          t: 39.9,
          activate: [
            21,
            25
          ]
        },
        {
          t: 86.33,
          reveal: [
            26,
            30
          ],
          phase: "reading"
        },
        {
          t: 117.01,
          activate: [
            26,
            30
          ]
        },
        {
          t: 153.03,
          end: true
        }
      ],
      type: "mixed",
      groups: [
        {
          type: "mc",
          instructions: "Choose the correct letter, A, B or C.",
          questions: [
            {
              n: 21,
              text: "What is the main aim of the project?",
              options: [
                "to raise prices",
                "to attract more students",
                "to cut costs"
              ],
              answer: 1
            },
            {
              n: 22,
              text: "What method will they use?",
              options: [
                "face-to-face interviews",
                "an online survey",
                "a focus group"
              ],
              answer: 1
            },
            {
              n: 23,
              text: "What sample size do they want?",
              options: [
                "fifty",
                "one hundred",
                "two hundred"
              ],
              answer: 2
            }
          ]
        },
        {
          type: "matching",
          instructions: "Who will carry out each task? Write A (Jack), B (Leila) or C (Dr Bennett).",
          options: [
            "A: Jack",
            "B: Leila",
            "C: Dr Bennett"
          ],
          questions: [
            {
              n: 24,
              text: "Designing the questionnaire",
              answer: "A",
              alt: [
                "a"
              ]
            },
            {
              n: 25,
              text: "Analysing the results",
              answer: "B",
              alt: [
                "b"
              ]
            },
            {
              n: 26,
              text: "Promoting the survey",
              answer: "A",
              alt: [
                "a"
              ]
            },
            {
              n: 27,
              text: "Approving the questions",
              answer: "C",
              alt: [
                "c"
              ]
            }
          ]
        },
        {
          type: "form",
          formTitle: "PROJECT DETAILS · Q28-30",
          instructions: "Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
          questions: [
            {
              n: 28,
              label: "The survey stays open for",
              answer: "TWO WEEKS",
              alt: [
                "2 weeks"
              ]
            },
            {
              n: 29,
              label: "Length of the report",
              answer: "1500 WORDS",
              alt: [
                "fifteen hundred words",
                "1500"
              ]
            },
            {
              n: 30,
              label: "Submission deadline",
              answer: "20 MARCH",
              alt: [
                "twentieth of march",
                "march 20"
              ]
            }
          ]
        }
      ]
    },
    {
      number: 4,
      title: "Lecture: A Short History of the Bicycle",
      audio: "audio/test04/section4.mp3",
      cues: [
        {
          t: 5.18,
          reveal: [
            31,
            40
          ],
          phase: "reading"
        },
        {
          t: 35.02,
          activate: [
            31,
            40
          ]
        },
        {
          t: 134.68,
          end: true
        }
      ],
      type: "form",
      formTitle: "A SHORT HISTORY OF THE BICYCLE: LECTURE NOTES · Q31-40",
      instructions: "Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
      questions: [
        {
          n: 31,
          label: "The 1817 machine had no",
          answer: "PEDALS",
          alt: [
            "pedal"
          ]
        },
        {
          n: 32,
          label: "Rough early model was nicknamed the",
          answer: "BONESHAKER",
          alt: [
            "bone shaker"
          ]
        },
        {
          n: 33,
          label: "Model with one huge front wheel",
          answer: "PENNY-FARTHING",
          alt: [
            "penny farthing"
          ]
        },
        {
          n: 34,
          label: "The safety bicycle had two equal",
          answer: "WHEELS",
          alt: [
            "wheel"
          ]
        },
        {
          n: 35,
          label: "Comfort improved thanks to air-filled",
          answer: "TYRES",
          alt: [
            "tyre",
            "tires"
          ]
        },
        {
          n: 36,
          label: "Bicycles gave women a sense of",
          answer: "FREEDOM",
          alt: [
            "independence"
          ]
        },
        {
          n: 37,
          label: "Decade of the cycling boom",
          answer: "1890S",
          alt: [
            "1890",
            "1890s"
          ]
        },
        {
          n: 38,
          label: "Modern frames made lighter using",
          answer: "ALUMINIUM",
          alt: [
            "aluminum"
          ]
        },
        {
          n: 39,
          label: "Most cycle-friendly city today",
          answer: "COPENHAGEN",
          alt: [
            "copenhagen"
          ]
        },
        {
          n: 40,
          label: "Fastest-growing type of bike",
          answer: "ELECTRIC",
          alt: [
            "electric bike",
            "e-bike",
            "e-bikes"
          ]
        }
      ]
    }
  ]
};

const TESTS = { test01: TEST01, test02: TEST02, test03: TEST03, test04: TEST04 };

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
  const key = `ielts_progress_${module}_${testId}`;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    // Progression illisible (residu tronque ou corrompu dans le navigateur du
    // visiteur) : ne JAMAIS bloquer le lancement d'un test pour ca. Un visiteur
    // normal ne sait pas purger son localStorage. On retire la cle fautive et on
    // repart proprement, sans progression. Correctif racine de la regression du
    // 18/07 (Listening 4/4 et Reading Test 1 bloques par un JSON.parse non garde).
    try { localStorage.removeItem(key); } catch (e2) {}
    return null;
  }
}
function clearProgress(module, testId) {
  localStorage.removeItem(`ielts_progress_${module}_${testId}`);
}
