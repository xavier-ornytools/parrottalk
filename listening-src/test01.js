// ParrotTalk — SOURCE D'AUTORING Listening Test 01 (refonte — test vitrine)
// ─────────────────────────────────────────────────────────────────────────────
// Contenu 100 % original. Même chaîne que Test 02 : schéma speakers verrouillé,
// Porte 1, génération Google Cloud TTS, Porte 2, preview.
//
// AMÉLIORATION scripts (exigée après Test 02) : ne PAS enchaîner mécaniquement
// question-réponse. Comme le vrai IELTS, on insère du remplissage naturel, de
// courtes digressions et des DISTRACTEURS (une info donnée puis corrigée), pour
// que l'auditeur doive suivre la conversation, pas juste attendre la réponse.
// Règle Porte 1 inchangée : ordre des réponses (`at`) strictement croissant.

const TEST01 = {
  id: 'test01',
  title: 'Listening Test 01',
  accentPool: ['en-GB', 'en-AU', 'en-US'],
  // Voix narrateur (annonces d'examen) — neutre, jamais personnage d'un dialogue,
  // distincte de toutes les voix de locuteurs (vérifié par la Porte 1).
  narratorVoice: 'en-GB-Neural2-D',
  sections: [

    // ── SECTION 1 — Dialogue transactionnel (form completion + épellation) ──────
    {
      number: 1,
      title: 'Greenline Coach Travel — Ticket Booking',
      type: 'form',
      runtimeType: 'form', requiredTypes: ['completion'], wordLimit: 3,
      // Narration d'examen : contexte annoncé, point de coupure milieu (avant la
      // ligne de script d'index splitAt), et exemple travaillé (Partie 1 uniquement).
      context: 'a telephone conversation between a man booking a coach ticket and a booking clerk',
      splitAt: 12,
      example: {
        lines: [
          { who: 'clerk',  text: "Greenline Coach Travel, how can I help?" },
          { who: 'caller', text: "Hello, I'd like to book a coach ticket to travel next month, please." },
        ],
        answer: "The caller wants to travel by coach, so 'coach' has been written in the space. Now we shall begin.",
      },
      formTitle: 'GREENLINE COACH TRAVEL — BOOKING FORM · Q1–10',
      instructions: 'Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.',
      speakers: {
        clerk:  { voice: 'en-GB-Neural2-A', gender: 'F', accent: 'en-GB', label: 'Booking clerk' },
        caller: { voice: 'en-AU-Neural2-D', gender: 'M', accent: 'en-AU', label: 'Caller' },
      },
      script: [
        { who: 'clerk',  text: "Good morning, Greenline Coach Travel, this is Fiona speaking. How can I help you?" },
        { who: 'caller', text: "Morning! I'd like to book a coach ticket, and maybe ask a couple of questions about the route as well." },
        { who: 'clerk',  text: "Of course, I can help with both. Let's start with the booking — could I take your surname?" },
        { who: 'caller', text: "It's Donnelly. People often get it wrong, so let me spell that: D. O. N. N. E. L. L. Y." },
        { who: 'clerk',  text: "Donnelly, lovely, got it. And where will you be travelling to?" },
        { who: 'caller', text: "I want to go to Edinburgh. Well — originally I was thinking Glasgow, but the conference moved, so it's definitely Edinburgh now." },
        { who: 'clerk',  text: "Edinburgh it is. Those coaches are quite comfortable, by the way — reclining seats and free wifi. Which date would you like to travel?" },
        { who: 'caller', text: "Let me check... I first wrote down the twentieth, but that's wrong — it should be the twelfth of September." },
        { who: 'clerk',  text: "The twelfth of September, noted. And how many passengers altogether?" },
        { who: 'caller', text: "There'll be three of us travelling together." },
        { who: 'clerk',  text: "Three passengers. Do you have a seating preference? We can do aisle or window." },
        { who: 'caller', text: "A window seat would be great — I like watching the countryside go by." },
        { who: 'clerk',  text: "Window seats noted, for all three where possible. Now, for departure — we have services at nine in the morning and at eleven." },
        { who: 'caller', text: "The nine o'clock is a bit early for us... let's go with the eleven a.m. one." },
        { who: 'clerk',  text: "Eleven a.m., usually quieter anyway. The standard fare to Edinburgh is forty-three pounds each." },
        { who: 'caller', text: "Forty-three? Oh — is there any discount available?" },
        { who: 'clerk',  text: "There is, actually. With a valid card the fare drops to thirty-four pounds per person." },
        { who: 'caller', text: "Thirty-four is much better, thanks." },
        { who: 'clerk',  text: "May I ask which discount card you hold — senior, family, or student?" },
        { who: 'caller', text: "Student — I've got my student card right here." },
        { who: 'clerk',  text: "Perfect, student discount applied. And how would you like to pay — credit card, debit card, or cash on collection?" },
        { who: 'caller', text: "I'll pay by debit card, please." },
        { who: 'clerk',  text: "All done. Your booking reference is GL7208 — I'll text it to you as well." },
        { who: 'caller', text: "GL7208 — brilliant. Thank you so much for your help, Fiona." },
      ],
      questions: [
        { n: 1,  at: 3,  label: 'Surname',            answer: 'DONNELLY',     alt: ['donnelly'] },
        { n: 2,  at: 5,  label: 'Destination',        answer: 'EDINBURGH',    alt: ['edinburgh'] },
        { n: 3,  at: 7,  label: 'Travel date',        answer: '12 SEPTEMBER', alt: ['twelfth of september', '12 sept', 'sept 12', '12/9'] },
        { n: 4,  at: 9,  label: 'Number of passengers',answer: '3',           alt: ['three'] },
        { n: 5,  at: 11, label: 'Seat preference',    answer: 'WINDOW',       alt: ['window seat', 'a window seat'] },
        { n: 6,  at: 13, label: 'Departure time',     answer: '11 AM',        alt: ['eleven', 'eleven am', '11am', '11:00'] },
        { n: 7,  at: 16, label: 'Discounted fare (£)', answer: '34',          alt: ['£34', 'thirty-four', '34 pounds'] },
        { n: 8,  at: 19, label: 'Discount card',      answer: 'STUDENT',      alt: ['student card'] },
        { n: 9,  at: 21, label: 'Payment method',     answer: 'DEBIT CARD',   alt: ['debit', 'by debit card'] },
        { n: 10, at: 22, label: 'Booking reference',  answer: 'GL7208',       alt: ['gl 7208'] },
      ],
    },

    // ── SECTION 2 — Monologue informatif (map labelling + MCQ) ──────────────────
    {
      number: 2,
      title: 'Oakmoor Country Park — Visitor Orientation',
      type: 'mixed',
      runtimeType: 'mixed', requiredTypes: ['maplabel', 'mc'],
      context: 'a talk by a park ranger giving visitors an orientation to a country park',
      splitAt: 7,
      speakers: {
        ranger: { voice: 'en-US-Neural2-F', gender: 'F', accent: 'en-US', label: 'Park ranger' },
      },
      script: [
        { who: 'ranger', text: "Hello everyone, and a very warm welcome to Oakmoor Country Park. Before you set off exploring, let me give you a quick orientation so you can find your way around." },
        { who: 'ranger', text: "If you look at the map in your leaflet, you'll see the main areas marked with the letters A through H. Let me point out the key spots." },
        { who: 'ranger', text: "Right by the main entrance, where you're standing now, is the Visitor Centre — that's point C on your map, with toilets, maps, and a small shop." },
        { who: 'ranger', text: "If you follow the lakeside path north, you'll reach the bird hide. Now, it used to be over at point G, but since the flooding last winter it's been relocated to point F." },
        { who: 'ranger', text: "For those who've brought lunch, the picnic area is at point A, on the sunny meadow just west of the car park." },
        { who: 'ranger', text: "Down at the water's edge, you'll find boat hire at point H — rowing boats and pedalos, weather permitting." },
        { who: 'ranger', text: "And for families, the adventure playground is at point D, tucked behind the trees near the café." },
        { who: 'ranger', text: "Now, a few things worth knowing. The park is open every day, but it does get busy — especially on Sundays, so if you like peace and quiet, a weekday is your best bet." },
        { who: 'ranger', text: "We love dogs here and you're welcome to bring them. We do ask, though, that they're kept on a lead at all times, as we have a lot of ground-nesting birds." },
        { who: 'ranger', text: "You might be hoping for a coffee. Our main café is open at weekends only at the moment — the weekday service is paused while we recruit staff, so do bring a flask midweek." },
        { who: 'ranger', text: "If you'd like to join one of our guided walks, please book at the information desk beforehand — they're popular and places are limited, so you can't just turn up." },
        { who: 'ranger', text: "And finally, the most important safety point: parts of the lake are surprisingly deep, so please keep well back from the edge, especially with children." },
        { who: 'ranger', text: "That's everything from me — enjoy Oakmoor, and please take your litter home!" },
      ],
      groups: [
        {
          type: 'form', kind: 'maplabel',
          formTitle: 'OAKMOOR COUNTRY PARK — MAP · Q11–15',
          instructions: 'Label the map below. Write the correct letter, A–H, next to each place.',
          questions: [
            { n: 11, at: 2, label: 'Visitor Centre',       answer: 'C', alt: ['c'] },
            { n: 12, at: 3, label: 'Bird hide',            answer: 'F', alt: ['f'] },
            { n: 13, at: 4, label: 'Picnic area',          answer: 'A', alt: ['a'] },
            { n: 14, at: 5, label: 'Boat hire',            answer: 'H', alt: ['h'] },
            { n: 15, at: 6, label: 'Adventure playground', answer: 'D', alt: ['d'] },
          ],
        },
        {
          type: 'mc',
          instructions: 'Choose the correct letter, A, B or C.',
          questions: [
            { n: 16, at: 7,  text: 'When is the park at its busiest?',
              options: ['On weekday mornings', 'On Sundays', 'On public holidays'], answer: 1, anchor: ['sundays'] },
            { n: 17, at: 8,  text: 'What are visitors asked to do with their dogs?',
              options: ['Leave them at home', 'Keep them on a lead', 'Let them run free'], answer: 1, anchor: ['on a lead', 'lead'] },
            { n: 18, at: 9,  text: 'The main café is currently',
              options: ['open every day', 'open at weekends only', 'closed completely'], answer: 1, anchor: ['weekends only', 'weekends'] },
            { n: 19, at: 10, text: 'To join a guided walk, visitors must',
              options: ['just turn up', 'book at the information desk', 'pay a fee online'], answer: 1, anchor: ['book at the information desk', 'book'] },
            { n: 20, at: 11, text: 'The main safety warning concerns',
              options: ['slippery paths', 'deep water', 'falling branches'], answer: 1, anchor: ['deep'] },
          ],
        },
      ],
    },

    // ── SECTION 3 — Discussion académique 3 locuteurs (MCQ + matching + completion)
    {
      number: 3,
      title: 'Tutorial — Renewable Energy Presentation',
      type: 'discussion',
      runtimeType: 'mixed', requiredTypes: ['mc', 'matching', 'completion'],
      context: 'a discussion between a tutor and two students about a presentation on renewable energy',
      splitAt: 10,
      speakers: {
        tutor: { voice: 'en-GB-Neural2-B', gender: 'M', accent: 'en-GB', label: 'Dr Reyes (tutor)' },
        priya: { voice: 'en-US-Neural2-E', gender: 'F', accent: 'en-US', label: 'Priya (student)' },
        ben:   { voice: 'en-AU-Neural2-D', gender: 'M', accent: 'en-AU', label: 'Ben (student)' },
      },
      script: [
        { who: 'tutor', text: "Right, Priya, Ben — let's go over your presentation on renewable energy before Thursday. How's it shaping up?" },
        { who: 'priya', text: "Pretty well, I think. We finally settled on a topic — we were going to do tidal power, but there wasn't enough recent data, so we've focused on wind energy instead." },
        { who: 'tutor', text: "Good call, wind is well documented. Where did most of your evidence come from?" },
        { who: 'ben',   text: "We looked at a few government reports at first, but they were a bit dry, so our main source ended up being a survey we ran ourselves, with about two hundred responses." },
        { who: 'tutor', text: "A survey — nicely done, that's original. Was there anything in the results that surprised you?" },
        { who: 'priya', text: "Definitely. We expected cost to be people's main concern, but the biggest surprise was how strong public support was, even when we mentioned higher bills." },
        { who: 'tutor', text: "A great finding to lead with. Now, I've looked at your draft slides. The content's strong, but what did you feel was the main weakness?" },
        { who: 'ben',   text: "Yeah, we know — it's a bit text-heavy. There are basically no visuals, so we're planning to add some charts." },
        { who: 'tutor', text: "Agreed, charts will help a lot. And remember the time limit — you've got fifteen minutes, not twenty, so keep it tight." },
        { who: 'priya', text: "Fifteen, got it. We'll trim it right down." },
        { who: 'tutor', text: "Let's sort out who's doing what. Ben, what are you taking on?" },
        { who: 'ben',   text: "I'll design the slides — the visuals and layout are more my thing." },
        { who: 'tutor', text: "Great. Priya?" },
        { who: 'priya', text: "I'll write the script, so we know exactly what we're each saying." },
        { who: 'tutor', text: "Perfect. And I'll help too — I'll check the references for you, to make sure everything's properly cited before you submit." },
        { who: 'priya', text: "That would be really helpful, thanks. When exactly is it due?" },
        { who: 'tutor', text: "The slides need to be submitted by Friday, the day before, so I can have a final look." },
        { who: 'ben',   text: "And where are we presenting — the usual seminar room?" },
        { who: 'tutor', text: "No, it's been moved — you'll be in Room 12, on the second floor of the library building." },
        { who: 'priya', text: "Room 12, noted. Thanks, Dr Reyes." },
      ],
      groups: [
        {
          type: 'mc',
          instructions: 'Choose the correct letter, A, B or C.',
          questions: [
            { n: 21, at: 1, text: 'Which type of energy did the students finally choose?',
              options: ['tidal power', 'wind energy', 'solar power'], answer: 1, anchor: ['wind'] },
            { n: 22, at: 3, text: 'What was their main source of evidence?',
              options: ['government reports', 'a survey they ran', 'published interviews'], answer: 1, anchor: ['survey'] },
            { n: 23, at: 5, text: 'What surprised them most?',
              options: ['the high cost', 'the level of public support', 'the technical problems'], answer: 1, anchor: ['public support', 'support'] },
            { n: 24, at: 7, text: 'What is the main weakness of their draft?',
              options: ['it is too short', 'it has no visuals', 'it is off the topic'], answer: 1, anchor: ['no visuals', 'visuals'] },
            { n: 25, at: 8, text: 'How long must the presentation be?',
              options: ['ten minutes', 'fifteen minutes', 'twenty minutes'], answer: 1, anchor: ['fifteen'] },
          ],
        },
        {
          type: 'matching',
          instructions: 'Who will do each task? Write A (Ben), B (Priya) or C (Dr Reyes).',
          options: ['A — Ben', 'B — Priya', 'C — Dr Reyes'],
          questions: [
            { n: 26, at: 11, text: 'Designing the slides',    answer: 'A', alt: ['a'], anchor: ['design the slides', 'slides'] },
            { n: 27, at: 13, text: 'Writing the script',      answer: 'B', alt: ['b'], anchor: ['write the script', 'script'] },
            { n: 28, at: 14, text: 'Checking the references', answer: 'C', alt: ['c'], anchor: ['check the references', 'references'] },
          ],
        },
        {
          type: 'form', kind: 'completion',
          formTitle: 'PRESENTATION DETAILS · Q29–30',
          instructions: 'Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
          wordLimit: 2,
          questions: [
            { n: 29, at: 16, label: 'Slides must be submitted by', answer: 'FRIDAY',  alt: ['on friday'] },
            { n: 30, at: 18, label: 'Presentation room',          answer: 'ROOM 12', alt: ['room twelve', '12'] },
          ],
        },
      ],
    },

    // ── SECTION 4 — Cours magistral monologue (note completion) ──────────────────
    {
      number: 4,
      title: 'Lecture — A Short History of Chocolate',
      type: 'lecture',
      runtimeType: 'form', requiredTypes: ['completion'], wordLimit: 2,
      // Partie 4 : jouée d'un trait, sans coupure milieu (splitAt: null) — conforme
      // au vrai examen (temps de lecture donné une fois pour les 10 questions).
      context: 'a lecture about the history of chocolate',
      splitAt: null,
      formTitle: 'A SHORT HISTORY OF CHOCOLATE — LECTURE NOTES · Q31–40',
      instructions: 'Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
      speakers: {
        lecturer: { voice: 'en-GB-Neural2-C', gender: 'F', accent: 'en-GB', label: 'Lecturer' },
      },
      script: [
        { who: 'lecturer', text: "Good afternoon. Today we'll trace the surprising journey of chocolate, from an ancient drink to the bars we know today." },
        { who: 'lecturer', text: "Chocolate comes from the beans of the cacao tree, native to the Americas. The Aztecs valued these beans so highly that they used them as a form of money — you could buy goods at market with a handful of cacao." },
        { who: 'lecturer', text: "The chocolate they made, though, was nothing like ours. It was a bitter drink, usually flavoured with chilli and other spices, and served cold." },
        { who: 'lecturer', text: "When Spanish explorers encountered it in the sixteenth century, they carried it home, and so chocolate first reached Europe through Spain." },
        { who: 'lecturer', text: "European tastes were different, of course. The key change was that sugar was added, turning a bitter drink into a sweet treat that quickly became fashionable." },
        { who: 'lecturer', text: "For a long time, though, it stayed a luxury. Because it was so expensive, chocolate was only affordable to the wealthy, sipped in fashionable chocolate houses." },
        { who: 'lecturer', text: "The big technological leap came in 1828, when a Dutch chemist invented a press that squeezed out much of the cocoa butter, making chocolate smoother and cheaper." },
        { who: 'lecturer', text: "Not long after, in 1847 — you'll sometimes see 1849 quoted, but the accepted date is 1847 — the first solid chocolate bar you could actually eat was produced in England." },
        { who: 'lecturer', text: "The next milestone was Swiss: by adding milk, makers created the smooth milk chocolate that most people around the world enjoy today." },
        { who: 'lecturer', text: "If we jump to the present, the geography has shifted entirely. The world's largest producer of cacao today is the Ivory Coast, in West Africa." },
        { who: 'lecturer', text: "But the industry faces real challenges, and the one dominating discussion now is sustainability — from fair pay for farmers to protecting the rainforest." },
        { who: 'lecturer', text: "So, from Aztec currency to a global, mass-market treat — that's the remarkable arc of chocolate. Next week, we'll look at coffee. Thank you." },
      ],
      questions: [
        { n: 31, at: 1,  label: 'Aztecs used cacao beans as a form of', answer: 'MONEY',       alt: ['currency'] },
        { n: 32, at: 2,  label: 'Original drink flavoured with',        answer: 'CHILLI',      alt: ['chili', 'chillies', 'chilli and spices'] },
        { n: 33, at: 3,  label: 'Chocolate first reached Europe via',   answer: 'SPAIN',       alt: ['spain'] },
        { n: 34, at: 4,  label: 'In Europe, added to sweeten it',       answer: 'SUGAR',       alt: ['sugar'] },
        { n: 35, at: 5,  label: 'At first only affordable to the',      answer: 'WEALTHY',     alt: ['rich', 'the wealthy'] },
        { n: 36, at: 6,  label: 'In 1828 a Dutch chemist invented a',   answer: 'PRESS',       alt: ['a press', 'cocoa press'] },
        { n: 37, at: 7,  label: 'First solid eating bar made in (year)', answer: '1847',       alt: ['1847'] },
        { n: 38, at: 8,  label: 'Milk chocolate created by adding',     answer: 'MILK',        alt: ['milk'] },
        { n: 39, at: 9,  label: "Today's largest cacao producer",       answer: 'IVORY COAST', alt: ['the ivory coast', 'cote divoire'] },
        { n: 40, at: 10, label: 'Main current concern for the industry', answer: 'SUSTAINABILITY', alt: ['sustainable'] },
      ],
    },
  ],
};

if (typeof module !== 'undefined') module.exports = TEST01;
