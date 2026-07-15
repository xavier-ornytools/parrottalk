// ParrotTalk — SOURCE D'AUTORING Listening Test 02 (refonte v2 — dernière étape).
// Contenu 100 % original. Même chaîne v2 (narration gravée, exemple P1, coupures
// S1–3, Partie 4 d'un trait, cue sheets).
//
// CALIBRAGE DIFFICULTÉ +10 % (cible haut de 6.5–7, dans le format Cambridge),
// leviers DOSÉS (pas tout cumulé sur chaque question) :
//   • distracteurs plus proches de la bonne réponse ;
//   • paraphrase éloignée entre l'audio et l'énoncé écrit (l'étiquette n'reprend
//     pas les mots exacts prononcés — mais la réponse, elle, reste dite : ancrage) ;
//   • corrections en cours de phrase ("...the 13th, sorry, the 3rd") ;
//   • débit un peu plus rapide sur la Section 3 (sec.rate) ;
//   • part accrue de matching/completion vs MCQ (MCQ : 10 → 5).

const TEST02 = {
  id: 'test02',
  title: 'Listening Test 02',
  accentPool: ['en-GB', 'en-AU', 'en-US'],
  narratorVoice: 'en-GB-Neural2-D',
  sections: [

    // ── SECTION 1 — Dialogue transactionnel (form completion + épellation) ──────
    {
      number: 1,
      title: 'Harbourview Leisure Centre — Membership',
      type: 'form',
      runtimeType: 'form', requiredTypes: ['completion'], wordLimit: 3,
      context: 'a conversation between a man joining a leisure centre and a receptionist',
      splitAt: 12,
      example: {
        lines: [
          { who: 'recep', text: "Harbourview Leisure Centre, how can I help?" },
          { who: 'cust',  text: "Hi, I'd like to join as a member, please." },
        ],
        answer: "The caller wants to join as a member, so 'member' has been written in the space. Now we shall begin.",
      },
      formTitle: 'HARBOURVIEW LEISURE CENTRE — MEMBERSHIP FORM · Q1–10',
      instructions: 'Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.',
      speakers: {
        recep: { voice: 'en-GB-Neural2-C', gender: 'F', accent: 'en-GB', label: 'Receptionist' },
        cust:  { voice: 'en-AU-Neural2-B', gender: 'M', accent: 'en-AU', label: 'Customer' },
      },
      script: [
        { who: 'recep', text: "Good afternoon, Harbourview Leisure Centre, this is Grace on reception. How can I help?" },
        { who: 'cust',  text: "Hi, I'd like to become a member, and go through the details with you." },
        { who: 'recep', text: "Wonderful. Could I take your family name to start?" },
        { who: 'cust',  text: "It's Pelletier — P. E. L. L. E. T. I. E. R." },
        { who: 'recep', text: "Thank you. And which membership would you like? We do full, off-peak, and student." },
        { who: 'cust',  text: "I'll take the full one — oh, actually, make it off-peak; I mostly come around midday." },
        { who: 'recep', text: "Off-peak, good value. When would you like it to start?" },
        { who: 'cust',  text: "The thirteenth of March — sorry, the third of March." },
        { who: 'recep', text: "The third of March. The full membership is thirty-nine pounds a month; off-peak works out at twenty-nine." },
        { who: 'cust',  text: "Twenty-nine a month is fine." },
        { who: 'recep', text: "Lovely. Is there a particular activity you're mainly interested in?" },
        { who: 'cust',  text: "Mostly the gym — well, swimming, actually; I'm trying to swim more." },
        { who: 'recep', text: "Swimming's popular here. And roughly when do you plan to come in?" },
        { who: 'cust',  text: "After work most days, so evenings." },
        { who: 'recep', text: "Evenings, noted. Just for our records — how did you hear about us?" },
        { who: 'cust',  text: "A friend mentioned it — no, sorry, it was my neighbour." },
        { who: 'recep', text: "Kind of them. Would you like a locker? There's a small refundable deposit of five pounds." },
        { who: 'cust',  text: "Yes, a locker would be great." },
        { who: 'recep', text: "For safety, could I take an emergency contact surname?" },
        { who: 'cust',  text: "Yes — Walsh, W. A. L. S. H." },
        { who: 'recep', text: "Walsh, thank you. You're all set — your membership number is HV5163." },
        { who: 'cust',  text: "HV5163 — brilliant, thanks Grace!" },
      ],
      questions: [
        { n: 1,  at: 3,  label: 'Family name',                 answer: 'PELLETIER', alt: ['pelletier'] },
        { n: 2,  at: 5,  label: 'Type of membership chosen',   answer: 'OFF-PEAK',  alt: ['off peak', 'offpeak'] },
        { n: 3,  at: 7,  label: 'Membership begins on',        answer: '3 MARCH',   alt: ['third of march', '3rd march', 'march 3'] },
        { n: 4,  at: 9,  label: 'Amount paid each month (£)',  answer: '29',        alt: ['twenty-nine', '£29', '29 pounds'] },
        { n: 5,  at: 11, label: 'Main activity of interest',   answer: 'SWIMMING',  alt: ['swim'] },
        { n: 6,  at: 13, label: 'When he plans to attend',     answer: 'EVENINGS',  alt: ['evening', 'after work'] },
        { n: 7,  at: 15, label: 'Referral source',             answer: 'NEIGHBOUR', alt: ['a neighbour', 'neighbor'] },
        { n: 8,  at: 16, label: 'Refundable locker deposit (£)', answer: '5',       alt: ['five', '£5', 'five pounds'] },
        { n: 9,  at: 19, label: 'Emergency contact surname',   answer: 'WALSH',     alt: ['walsh'] },
        { n: 10, at: 20, label: 'Membership ID',               answer: 'HV5163',    alt: ['hv 5163'] },
      ],
    },

    // ── SECTION 2 — Monologue (map labelling ×5 + MCQ ×2 + completion ×3) ────────
    {
      number: 2,
      title: 'Riverside Community Garden — Volunteer Induction',
      type: 'mixed',
      runtimeType: 'mixed', requiredTypes: ['maplabel', 'mc', 'completion'],
      context: 'a talk by a garden coordinator welcoming new volunteers',
      splitAt: 7,
      speakers: {
        guide: { voice: 'en-US-Neural2-F', gender: 'F', accent: 'en-US', label: 'Garden coordinator' },
      },
      script: [
        { who: 'guide', text: "Hi everyone, welcome to Riverside Community Garden. I'm Dana — let me orient you with the map in your booklet, marked A to H." },
        { who: 'guide', text: "As you come in, the compost area — for all your plant waste — is straight ahead at point F." },
        { who: 'guide', text: "The tool shed, where you'll sign out forks and trowels, is at point B, to your left." },
        { who: 'guide', text: "Do be careful near the pond — it's at point D, in the middle, and deeper than it looks." },
        { who: 'guide', text: "The greenhouse, our big glass building, is at point G, right at the far end." },
        { who: 'guide', text: "And the herb beds are at point C — sorry, point A, just by the gate on your right." },
        { who: 'guide', text: "Now, a few practical points before you dig in." },
        { who: 'guide', text: "We meet twice a week — Wednesday evenings and Saturday mornings. Most volunteers prefer the Saturday session." },
        { who: 'guide', text: "Please bring sturdy gloves. We supply the tools, but not gloves, and sandals really aren't safe here." },
        { who: 'guide', text: "For watering, please don't use the mains tap — draw from the rainwater tank by the shed instead." },
        { who: 'guide', text: "If you can't make a session, do let us know — a text is best, as the email inbox is rarely checked." },
        { who: 'guide', text: "And wear old clothes; the soil stains, and you'll want boots rather than trainers." },
        { who: 'guide', text: "Right — grab your gloves and let's get planting!" },
      ],
      groups: [
        {
          type: 'form', kind: 'maplabel',
          formTitle: 'RIVERSIDE COMMUNITY GARDEN — MAP · Q11–15',
          instructions: 'Label the map below. Write the correct letter, A–H, next to each feature.',
          questions: [
            { n: 11, at: 1, label: 'Compost area', answer: 'F', alt: ['f'] },
            { n: 12, at: 2, label: 'Tool shed',   answer: 'B', alt: ['b'] },
            { n: 13, at: 3, label: 'Pond',        answer: 'D', alt: ['d'] },
            { n: 14, at: 4, label: 'Greenhouse',  answer: 'G', alt: ['g'] },
            { n: 15, at: 5, label: 'Herb beds',   answer: 'A', alt: ['a'] },
          ],
        },
        {
          type: 'mc',
          instructions: 'Choose the correct letter, A, B or C.',
          questions: [
            { n: 16, at: 7, text: 'When do most volunteers attend?',
              options: ['Wednesday evenings', 'Saturday mornings', 'Both days equally'], answer: 1, anchor: ['saturday'] },
            { n: 17, at: 8, text: 'What must volunteers bring themselves?',
              options: ['Tools', 'Gloves', 'Seeds'], answer: 1, anchor: ['gloves'] },
          ],
        },
        {
          type: 'form', kind: 'completion',
          formTitle: 'VOLUNTEER NOTES · Q18–20',
          instructions: 'Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
          wordLimit: 2,
          questions: [
            { n: 18, at: 9,  label: 'Source of water for the plants', answer: 'RAINWATER TANK', alt: ['rainwater', 'the tank'] },
            { n: 19, at: 10, label: 'Best way to report an absence',  answer: 'TEXT',           alt: ['a text', 'text message'] },
            { n: 20, at: 11, label: 'Recommended footwear',           answer: 'BOOTS',          alt: ['boots'] },
          ],
        },
      ],
    },

    // ── SECTION 3 — Discussion (MCQ ×3 + matching ×4 + completion ×3), débit +5 % ─
    {
      number: 3,
      title: 'Tutorial — Urban Noise Project',
      type: 'discussion',
      runtimeType: 'mixed', requiredTypes: ['mc', 'matching', 'completion'],
      context: 'a discussion between a tutor and two students about a noise-measurement project',
      splitAt: 10,
      rate: 1.05, // levier : débit un peu plus rapide sur cette section
      speakers: {
        tutor: { voice: 'en-GB-Neural2-B', gender: 'M', accent: 'en-GB', label: 'Dr Hollis (tutor)' },
        maya:  { voice: 'en-US-Neural2-E', gender: 'F', accent: 'en-US', label: 'Maya (student)' },
        tom:   { voice: 'en-AU-Neural2-D', gender: 'M', accent: 'en-AU', label: 'Tom (student)' },
      },
      script: [
        { who: 'tutor', text: "Right, Maya, Tom — let's firm up the noise project. Where will you focus?" },
        { who: 'maya',  text: "We thought the ring road at first, but we've settled on the area around the schools instead." },
        { who: 'tutor', text: "Sensible. Over what period will you collect readings?" },
        { who: 'tom',   text: "We were going to do a whole month, but that's too much — two weeks, taking readings on different days." },
        { who: 'tutor', text: "And what worries you most about the fieldwork?" },
        { who: 'maya',  text: "Not the traffic, surprisingly — it's the wind that ruins the readings." },
        { who: 'tutor', text: "A common problem. Now, who's doing what? Tom?" },
        { who: 'tom',   text: "I'll be out recording the noise levels with the meter." },
        { who: 'tutor', text: "Good. Maya?" },
        { who: 'maya',  text: "I'll handle interviewing the residents about how the noise affects them." },
        { who: 'tutor', text: "There's more to cover. Someone needs to draw the site map." },
        { who: 'tom',   text: "I can do the map as well — I'll mark where each reading was taken." },
        { who: 'tutor', text: "Great. And I'll provide the sound meter from the lab, so you don't have to buy one." },
        { who: 'maya',  text: "That's a big help. How often should we log a reading?" },
        { who: 'tutor', text: "Every fifteen minutes during the day." },
        { who: 'tom',   text: "And how long should the write-up be?" },
        { who: 'tutor', text: "Around two thousand words, not counting the data tables." },
        { who: 'maya',  text: "When's it due?" },
        { who: 'tutor', text: "The deadline is the twelfth of May." },
        { who: 'tom',   text: "Great, thanks Dr Hollis." },
      ],
      groups: [
        {
          type: 'mc',
          instructions: 'Choose the correct letter, A, B or C.',
          questions: [
            { n: 21, at: 1, text: 'Where have the students decided to focus?',
              options: ['the ring road', 'near the schools', 'the town centre'], answer: 1, anchor: ['schools'] },
            { n: 22, at: 3, text: 'Over what period will they collect readings?',
              options: ['two weeks', 'one month', 'two months'], answer: 0, anchor: ['two weeks'] },
            { n: 23, at: 5, text: 'What concerns them most about the fieldwork?',
              options: ['the traffic', 'the wind', 'the rain'], answer: 1, anchor: ['wind'] },
          ],
        },
        {
          type: 'matching',
          instructions: 'Who will carry out each task? Write A (Tom), B (Maya) or C (Dr Hollis).',
          options: ['A — Tom', 'B — Maya', 'C — Dr Hollis'],
          questions: [
            { n: 24, at: 7,  text: 'Recording the noise levels', answer: 'A', alt: ['a'], anchor: ['recording the noise levels', 'recording'] },
            { n: 25, at: 9,  text: 'Interviewing residents',     answer: 'B', alt: ['b'], anchor: ['interviewing', 'interviews'] },
            { n: 26, at: 11, text: 'Drawing the site map',       answer: 'A', alt: ['a'], anchor: ['do the map', 'map'] },
            { n: 27, at: 12, text: 'Providing the sound meter',  answer: 'C', alt: ['c'], anchor: ['provide the sound meter', 'sound meter'] },
          ],
        },
        {
          type: 'form', kind: 'completion',
          formTitle: 'PROJECT DETAILS · Q28–30',
          instructions: 'Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
          wordLimit: 2,
          questions: [
            { n: 28, at: 14, label: 'A reading is logged every', answer: '15 MINUTES', alt: ['fifteen minutes'] },
            { n: 29, at: 16, label: 'Length of the write-up',    answer: '2000 WORDS', alt: ['two thousand words', '2000'] },
            { n: 30, at: 18, label: 'Submission deadline',       answer: '12 MAY',     alt: ['twelfth of may', 'may 12'] },
          ],
        },
      ],
    },

    // ── SECTION 4 — Cours magistral monologue (note completion, paraphrase) ──────
    {
      number: 4,
      title: 'Lecture — The Rise of Urban Beekeeping',
      type: 'lecture',
      runtimeType: 'form', requiredTypes: ['completion'], wordLimit: 2,
      context: 'a lecture about the rise of urban beekeeping',
      splitAt: null,
      formTitle: 'THE RISE OF URBAN BEEKEEPING — LECTURE NOTES · Q31–40',
      instructions: 'Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
      speakers: {
        lecturer: { voice: 'en-GB-Neural2-A', gender: 'F', accent: 'en-GB', label: 'Lecturer' },
      },
      script: [
        { who: 'lecturer', text: "Good morning. Today, the surprising world of urban beekeeping — honeybees kept in the heart of our cities." },
        { who: 'lecturer', text: "The modern craze began in Paris, where hives appeared on rooftops well before other capitals." },
        { who: 'lecturer', text: "Can they find food? Easily — a honeybee will travel up to three kilometres — in fact, up to five kilometres — from the hive." },
        { who: 'lecturer', text: "Cities are also warmer, thanks to what's called the heat island effect." },
        { who: 'lecturer', text: "City honey is often prized for its flavour, since the bees visit such varied gardens and parks." },
        { who: 'lecturer', text: "It isn't risk-free: the greatest danger to city bees is pesticides, still sprayed on some balconies." },
        { who: 'lecturer', text: "A colony is astonishingly large — a single hive may hold as many as fifty thousand bees in summer." },
        { who: 'lecturer', text: "If you fancy it, you must register your hives with the local council, mainly for disease control." },
        { who: 'lecturer', text: "For the bees' comfort, face the hives south-east, so they catch the morning sun." },
        { who: 'lecturer', text: "Watch for swarming — when a colony splits in two. It's most likely in spring." },
        { who: 'lecturer', text: "Looking ahead, planners hope to create bee-friendly corridors — flowering strips linking the city's green spaces." },
        { who: 'lecturer', text: "Get it right, and our cities could be among the best places on earth to be a bee. Thank you." },
      ],
      questions: [
        { n: 31, at: 1,  label: 'City where the trend began',        answer: 'PARIS',        alt: ['paris'] },
        { n: 32, at: 2,  label: 'How far bees travel to feed',       answer: '5 KILOMETRES', alt: ['five kilometres', '5 km', '5km'] },
        { n: 33, at: 3,  label: 'Cities warmer due to the ___ effect', answer: 'ISLAND',     alt: ['heat island'] },
        { n: 34, at: 4,  label: 'Quality city honey is praised for', answer: 'FLAVOUR',      alt: ['flavor', 'taste'] },
        { n: 35, at: 5,  label: 'Biggest danger to city bees',       answer: 'PESTICIDES',   alt: ['pesticide'] },
        { n: 36, at: 6,  label: 'Maximum bees in one hive',          answer: '50000',        alt: ['fifty thousand', '50,000'] },
        { n: 37, at: 7,  label: 'Must register hives with the local', answer: 'COUNCIL',      alt: ['local council'] },
        { n: 38, at: 8,  label: 'Direction to face the hives',       answer: 'SOUTH-EAST',   alt: ['southeast', 'south east'] },
        { n: 39, at: 9,  label: 'Season when colonies split',        answer: 'SPRING',       alt: ['in spring'] },
        { n: 40, at: 10, label: 'Planned bee-friendly ___',          answer: 'CORRIDORS',    alt: ['corridor'] },
      ],
    },
  ],
};

if (typeof module !== 'undefined') module.exports = TEST02;
