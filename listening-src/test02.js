// ParrotTalk — SOURCE D'AUTORING Listening Test 02 (refonte pilote)
// ─────────────────────────────────────────────────────────────────────────────
// Contenu 100 % original (aucune reprise Cambridge/éditeur). Format de type IELTS.
// CE FICHIER N'EST PAS CHARGÉ AU RUNTIME : c'est la source unique dont dérivent
//   (1) les MP3 (pipeline de génération TTS Google Cloud),
//   (2) le bloc `questions` runtime injecté dans js/data.js.
//
// SCHÉMA VERROUILLÉ :
//   - `speakers` : casting de la section. Chaque locuteur porte une VOIX EXPLICITE
//     (id Google Cloud) + genre + accent. Pool d'accents de cette version : GB/AU/US.
//   - `script`   : chaque réplique référence un locuteur par sa clé (`who`), jamais
//     un simple couple débit/hauteur. Épellation écrite en capitales séparées
//     (« P. E. L. L. E. T. I. E. R. ») pour être lue lettre à lettre, sans dépendre
//     du SSML d'un moteur particulier — le pipeline reste portable.
//   - `questions[].at` : index (0-based) de la ligne du script où la réponse est
//     prononcée. GARANTIT ordre questions = ordre audio (vérifié en Porte 1).
//
// Le verrou de distinction des voix (deux locuteurs d'un dialogue ne peuvent PAS
// partager la même voix) est contrôlé par tools/porte1-validate.js AVANT toute
// génération audio.

const TEST02 = {
  id: 'test02',
  title: 'Listening Test 02',
  accentPool: ['en-GB', 'en-AU', 'en-US'],
  sections: [

    // ── SECTION 1 — Dialogue transactionnel (form completion) ──────────────────
    {
      number: 1,
      title: 'Harbourview Leisure Centre — Membership Enquiry',
      type: 'form',
      formTitle: 'HARBOURVIEW LEISURE CENTRE — MEMBERSHIP FORM · Q1–10',
      instructions: 'Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.',
      speakers: {
        agent:    { voice: 'en-GB-Neural2-C', gender: 'F', accent: 'en-GB', label: 'Receptionist' },
        customer: { voice: 'en-AU-Neural2-B', gender: 'M', accent: 'en-AU', label: 'Customer' },
      },
      script: [
        { who: 'agent',    text: "Good afternoon, Harbourview Leisure Centre, how can I help?" },
        { who: 'customer', text: "Hi, I'd like to sign up for a membership, please." },
        { who: 'agent',    text: "Lovely. I'll just take a few details. Could I have your surname?" },
        { who: 'customer', text: "It's Pelletier — that's P. E. L. L. E. T. I. E. R." },
        { who: 'agent',    text: "Thank you. And which membership would you like? We offer daily, off-peak, and full." },
        { who: 'customer', text: "The off-peak one suits me, since I mostly come during the day." },
        { who: 'agent',    text: "Good choice. When would you like your membership to start?" },
        { who: 'customer', text: "Could it begin on the third of March?" },
        { who: 'agent',    text: "The third of March, noted. A contact number, please?" },
        { who: 'customer', text: "Yes, it's 0491 552 019." },
        { who: 'agent',    text: "0491 552 019, thank you. And your street address?" },
        { who: 'customer', text: "It's 24 Wattle Avenue." },
        { who: 'agent',    text: "And which suburb is that in?" },
        { who: 'customer', text: "Newport." },
        { who: 'agent',    text: "Perfect. Just for our records — how did you hear about us?" },
        { who: 'customer', text: "A neighbour recommended you, actually." },
        { who: 'agent',    text: "That's kind. Is there a particular activity you're interested in?" },
        { who: 'customer', text: "Mainly swimming — I'm trying to get back into it." },
        { who: 'agent',    text: "We have plenty of sessions. Do you prefer mornings or evenings?" },
        { who: 'customer', text: "Evenings work best, after work." },
        { who: 'agent',    text: "All set. Your membership number is HV4712 — please keep it handy." },
        { who: 'customer', text: "HV4712, got it. Thanks so much!" },
      ],
      questions: [
        { n: 1,  at: 3,  label: 'Surname',                 answer: 'PELLETIER',      alt: ['pelletier'] },
        { n: 2,  at: 5,  label: 'Membership type',         answer: 'OFF-PEAK',       alt: ['off peak', 'offpeak'] },
        { n: 3,  at: 7,  label: 'Start date',              answer: '3 MARCH',        alt: ['third of march', '3rd march', 'march 3', '3/3'] },
        { n: 4,  at: 9,  label: 'Contact number',          answer: '0491 552 019',   alt: ['0491552019'] },
        { n: 5,  at: 11, label: 'Street',                  answer: 'WATTLE AVENUE',  alt: ['24 wattle avenue', 'wattle ave'] },
        { n: 6,  at: 13, label: 'Suburb',                  answer: 'NEWPORT',        alt: ['newport'] },
        { n: 7,  at: 15, label: 'How they heard of us',    answer: 'NEIGHBOUR',      alt: ['a neighbour', 'neighbor'] },
        { n: 8,  at: 17, label: 'Activity of interest',    answer: 'SWIMMING',       alt: ['swim'] },
        { n: 9,  at: 19, label: 'Preferred time',          answer: 'EVENINGS',       alt: ['evening', 'in the evening'] },
        { n: 10, at: 20, label: 'Membership number',       answer: 'HV4712',         alt: ['hv 4712'] },
      ],
    },

    // ── SECTION 2 — Monologue informatif (map labelling + note completion) ──────
    {
      number: 2,
      title: 'Riverside Community Garden — Volunteer Induction',
      type: 'mixed',
      instructions: 'Q11–15: label the map A–H. Q16–20: write NO MORE THAN TWO WORDS.',
      speakers: {
        guide: { voice: 'en-US-Neural2-F', gender: 'F', accent: 'en-US', label: 'Garden coordinator' },
      },
      script: [
        { who: 'guide', text: "Hi everyone, and welcome to Riverside Community Garden. I'm Dana, and I'll walk you through how things work before your first session." },
        { who: 'guide', text: "Let's start with the layout — you've each got a map marked with points A to H." },
        { who: 'guide', text: "As you come in through the main gate, the compost area is straight ahead at point F — that's where all your plant waste goes." },
        { who: 'guide', text: "To your left, at point B, you'll find the herb spiral — rosemary, thyme, mint, help yourself." },
        { who: 'guide', text: "The children's plot is over at point D, near the picnic tables, so families can keep an eye on the little ones." },
        { who: 'guide', text: "Our greenhouse is the big glass structure at point G, at the back on the right." },
        { who: 'guide', text: "And the pond — please be careful near it — is at point A, just inside the gate on the right." },
        { who: 'guide', text: "Now, a few practical things. Whenever you come, please bring your own gloves, as we don't supply them." },
        { who: 'guide', text: "Volunteer sessions run every Saturday morning, rain or shine." },
        { who: 'guide', text: "A couple of rules: we love animals, but no pets in the growing beds, please — paws and seedlings don't mix." },
        { who: 'guide', text: "For watering, don't use the tap by the shed; take water from the rainwater tank instead — it's better for the plants and for our bills." },
        { who: 'guide', text: "And if you can't make a session, just let our coordinator know by text — don't email, as that inbox isn't checked often." },
        { who: 'guide', text: "Right, let's grab some tools and get started!" },
      ],
      questions: [
        { n: 11, at: 2,  label: 'Compost area',    answer: 'F', alt: [] },
        { n: 12, at: 3,  label: 'Herb spiral',     answer: 'B', alt: [] },
        { n: 13, at: 4,  label: "Children's plot",  answer: 'D', alt: [] },
        { n: 14, at: 5,  label: 'Greenhouse',      answer: 'G', alt: [] },
        { n: 15, at: 6,  label: 'Pond',            answer: 'A', alt: [] },
        { n: 16, at: 7,  label: 'Volunteers must bring their own', answer: 'GLOVES',        alt: ['gloves'] },
        { n: 17, at: 8,  label: 'Sessions run every',              answer: 'SATURDAY',      alt: ['saturday morning', 'saturdays'] },
        { n: 18, at: 9,  label: 'Not allowed in the beds',         answer: 'PETS',          alt: ['no pets', 'animals'] },
        { n: 19, at: 10, label: 'Take water from the',             answer: 'RAINWATER TANK', alt: ['rainwater', 'rain water tank'] },
        { n: 20, at: 11, label: 'Contact the coordinator by',      answer: 'TEXT',          alt: ['by text', 'text message'] },
      ],
    },

    // ── SECTION 3 — Discussion académique 3 locuteurs (sentence completion) ─────
    {
      number: 3,
      title: 'Tutorial — Urban Noise Field Study',
      type: 'discussion',
      instructions: 'Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.',
      speakers: {
        tutor: { voice: 'en-GB-Neural2-B', gender: 'M', accent: 'en-GB', label: 'Dr Hollis (tutor)' },
        maya:  { voice: 'en-US-Neural2-E', gender: 'F', accent: 'en-US', label: 'Maya (student)' },
        tom:   { voice: 'en-AU-Neural2-D', gender: 'M', accent: 'en-AU', label: 'Tom (student)' },
      },
      script: [
        { who: 'tutor', text: "So, Maya, Tom — let's firm up your project on urban noise. Have you decided where to focus?" },
        { who: 'maya',  text: "We thought we'd concentrate on noise levels near schools, since that's where it matters most for concentration." },
        { who: 'tutor', text: "Sensible. And how will you actually measure it?" },
        { who: 'tom',   text: "We've borrowed a sound level meter from the department — it gives readings in decibels." },
        { who: 'tutor', text: "Good. Over what period will you collect data?" },
        { who: 'maya',  text: "We're planning to take measurements over two weeks, to catch different days." },
        { who: 'tutor', text: "And what do you think your biggest challenge will be?" },
        { who: 'tom',   text: "Honestly, the wind — it distorts the readings if we're not careful." },
        { who: 'tutor', text: "A common problem. How frequently will you log a reading?" },
        { who: 'maya',  text: "Every fifteen minutes, during the school day." },
        { who: 'tutor', text: "Let's split the work. Tom, what will you take on?" },
        { who: 'tom',   text: "I'll handle the mapping — plotting the readings onto a site map." },
        { who: 'tutor', text: "And Maya?" },
        { who: 'maya',  text: "I'll do the interviews with teachers and pupils about how the noise affects them." },
        { who: 'tutor', text: "Before you start, I'd suggest reading up on the current noise regulations — they'll frame your discussion." },
        { who: 'maya',  text: "How long should the final report be?" },
        { who: 'tutor', text: "Aim for two thousand words, excluding appendices." },
        { who: 'tom',   text: "And when is it due?" },
        { who: 'tutor', text: "The deadline is the twelfth of May, so you've got time if you start now." },
        { who: 'maya',  text: "Great, thanks Dr Hollis." },
      ],
      questions: [
        { n: 21, at: 1,  label: 'Focus of the study: noise near',   answer: 'SCHOOLS',            alt: ['schools'] },
        { n: 22, at: 3,  label: 'Main instrument used',             answer: 'SOUND LEVEL METER',  alt: ['sound meter', 'decibel meter'] },
        { n: 23, at: 5,  label: 'Data collected over',              answer: 'TWO WEEKS',          alt: ['2 weeks'] },
        { n: 24, at: 7,  label: 'Biggest challenge',                answer: 'WIND',               alt: ['the wind'] },
        { n: 25, at: 9,  label: 'A reading logged every',           answer: '15 MINUTES',         alt: ['fifteen minutes'] },
        { n: 26, at: 11, label: 'Tom is responsible for',           answer: 'MAPPING',            alt: ['the mapping', 'maps'] },
        { n: 27, at: 13, label: 'Maya is responsible for',          answer: 'INTERVIEWS',         alt: ['the interviews'] },
        { n: 28, at: 14, label: 'Tutor suggests reading about',     answer: 'REGULATIONS',        alt: ['noise regulations'] },
        { n: 29, at: 16, label: 'Report length',                    answer: '2000 WORDS',         alt: ['two thousand words'] },
        { n: 30, at: 18, label: 'Deadline',                         answer: '12 MAY',             alt: ['twelfth of may', 'may 12'] },
      ],
    },

    // ── SECTION 4 — Cours magistral monologue (note completion) ─────────────────
    {
      number: 4,
      title: 'Lecture — The Rise of Urban Beekeeping',
      type: 'lecture',
      instructions: 'Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
      speakers: {
        lecturer: { voice: 'en-GB-Neural2-A', gender: 'F', accent: 'en-GB', label: 'Lecturer' },
      },
      script: [
        { who: 'lecturer', text: "Good morning. Today I want to talk about the surprising rise of urban beekeeping — keeping honeybees in the middle of our cities." },
        { who: 'lecturer', text: "The modern trend really took off in Paris, where hives appeared on rooftops long before other capitals caught on." },
        { who: 'lecturer', text: "You might wonder whether bees can find enough food in a city. In fact, a honeybee can forage up to five kilometres from its hive." },
        { who: 'lecturer', text: "Cities also offer a warmer environment. This is partly due to what's called the heat island effect, where buildings and roads trap warmth." },
        { who: 'lecturer', text: "Interestingly, urban honey is often praised for its flavour, because bees visit such a wide variety of garden and park flowers." },
        { who: 'lecturer', text: "It isn't all easy, though. The main threat to city bees is pesticides, still used on some parks and balconies." },
        { who: 'lecturer', text: "A healthy hive is astonishingly busy — a single hive can hold up to fifty thousand bees at the height of summer." },
        { who: 'lecturer', text: "If you're tempted to start, be aware you must register your hives with the local council, mainly for disease control." },
        { who: 'lecturer', text: "For the bees' comfort, it's recommended to place hives facing south-east, so they warm up early in the morning." },
        { who: 'lecturer', text: "One thing to watch for is swarming — when a colony splits. This is most common in spring, so plan for it." },
        { who: 'lecturer', text: "Looking ahead, some planners want to create bee-friendly corridors — continuous strips of flowering plants linking green spaces across the city." },
        { who: 'lecturer', text: "If we get this right, our cities could become some of the best places on earth to be a bee. Thank you." },
      ],
      questions: [
        { n: 31, at: 1,  label: 'Trend took off in',              answer: 'PARIS',        alt: ['paris'] },
        { n: 32, at: 2,  label: 'Bees forage up to',              answer: '5 KILOMETRES', alt: ['five kilometres', '5 km', '5km'] },
        { n: 33, at: 3,  label: 'Cities warmer: heat ___ effect', answer: 'ISLAND',       alt: ['heat island'] },
        { n: 34, at: 4,  label: 'Urban honey praised for its',    answer: 'FLAVOUR',      alt: ['flavor', 'taste'] },
        { n: 35, at: 5,  label: 'Main threat to city bees',       answer: 'PESTICIDES',   alt: ['pesticide'] },
        { n: 36, at: 6,  label: 'A hive can hold up to',          answer: '50000 BEES',   alt: ['fifty thousand', '50,000', '50000'] },
        { n: 37, at: 7,  label: 'Register hives with the local',  answer: 'COUNCIL',      alt: ['local council'] },
        { n: 38, at: 8,  label: 'Place hives facing',             answer: 'SOUTH-EAST',   alt: ['southeast', 'south east'] },
        { n: 39, at: 9,  label: 'Swarming most common in',        answer: 'SPRING',       alt: ['in spring'] },
        { n: 40, at: 10, label: 'Future idea: bee-friendly',      answer: 'CORRIDORS',    alt: ['corridor'] },
      ],
    },
  ],
};

if (typeof module !== 'undefined') module.exports = TEST02;
