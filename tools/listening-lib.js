// ParrotTalk — helpers Listening partagés (Porte 1, génération, émetteur runtime).
// Source unique du découpage en blocs (bloc 1 / bloc 2) et de l'aplatissement des
// questions, pour que les trois outils raisonnent exactement pareil.

// Aplatit les questions d'une section en préservant l'ordre, avec leur type.
function flattenQuestions(sec) {
  if (sec.groups) {
    return sec.groups.flatMap(g => g.questions.map(q => ({
      q, g, qtype: g.type === 'form' ? (g.kind || 'completion') : g.type,
    })));
  }
  return sec.questions.map(q => ({ q, g: sec, qtype: 'completion' }));
}

// Découpe une section en blocs de révélation.
//  - splitAt == null  → 1 seul bloc (toutes les questions, tout le script) — ex. Partie 4.
//  - splitAt == index → 2 blocs : questions dont at < splitAt (script 0..splitAt-1)
//    puis questions dont at >= splitAt (script splitAt..fin).
// Chaque bloc : { qFrom, qTo, lineFrom, lineTo }.
function sectionBlocks(sec) {
  const flat = flattenQuestions(sec);
  const nums = flat.map(f => f.q.n);
  const len = sec.script.length;
  if (sec.splitAt == null) {
    return [{ qFrom: nums[0], qTo: nums[nums.length - 1], lineFrom: 0, lineTo: len - 1 }];
  }
  const b1 = flat.filter(f => f.q.at < sec.splitAt).map(f => f.q.n);
  const b2 = flat.filter(f => f.q.at >= sec.splitAt).map(f => f.q.n);
  return [
    { qFrom: b1[0], qTo: b1[b1.length - 1], lineFrom: 0, lineTo: sec.splitAt - 1 },
    { qFrom: b2[0], qTo: b2[b2.length - 1], lineFrom: sec.splitAt, lineTo: len - 1 },
  ];
}

// Un dialogue (≥2 locuteurs) => "conversation" ; sinon "talk".
function discourseWord(sec) {
  return new Set(sec.script.map(l => l.who)).size >= 2 ? 'conversation' : 'talk';
}

module.exports = { flattenQuestions, sectionBlocks, discourseWord };
