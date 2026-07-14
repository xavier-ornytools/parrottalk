/* ParrotTalk — parcours d'examen (continuité entre les 4 épreuves).
 *
 * Deux régimes :
 *  - Mode mock (localStorage `pt_mock`) : l'utilisateur enchaîne
 *    Listening -> Reading -> Writing -> Speaking en une session guidée. Le
 *    questionnaire micro-feedback n'est demandé qu'UNE fois, à la fin (écran
 *    "You've completed all four"), pas à chaque épreuve.
 *  - Mode épreuve isolée : pas de mock, on propose seulement un lien vers
 *    l'épreuve suivante et un retour dashboard/accueil.
 *
 * Le band (note) reste toujours visible et libre : ce module ne gère que la
 * NAVIGATION de fin d'épreuve, pas le score ni le gating (voir feedback-gate.js).
 *
 * API :
 *   ExamFlow.startMock()                  démarre un examen blanc complet
 *   ExamFlow.isMock()                     mock en cours ?
 *   ExamFlow.renderNextStep(current, el)  boutons de fin d'épreuve (current = 'listening'...)
 *   ExamFlow.stopMock() / finishMock(ev)  arrêt / fin du mock
 */
(function () {
  'use strict';

  var ORDER  = ['listening', 'reading', 'writing', 'speaking'];
  var LABELS = { listening: 'Listening', reading: 'Reading', writing: 'Writing', speaking: 'Speaking' };
  var PAGES  = { listening: 'listening.html', reading: 'reading.html', writing: 'writing.html', speaking: 'speaking.html' };
  var ICON   = { listening: '🎧', reading: '📖', writing: '✍️', speaking: '🎤' };
  var LS_MOCK = 'pt_mock';

  function getMock() { try { return JSON.parse(localStorage.getItem(LS_MOCK) || 'null'); } catch (e) { return null; } }
  function isMock()  { var m = getMock(); return !!(m && m.active); }
  function clearMock() { try { localStorage.removeItem(LS_MOCK); } catch (e) {} }

  function startMock() {
    try { localStorage.setItem(LS_MOCK, JSON.stringify({ active: true, started: Date.now() })); } catch (e) {}
    location.href = PAGES[ORDER[0]] + '?mock=1';
  }

  function stopMock() { clearMock(); location.href = 'dashboard.html'; }

  function nextOf(cur) {
    var i = ORDER.indexOf(cur);
    return (i >= 0 && i < ORDER.length - 1) ? ORDER[i + 1] : null;
  }

  // Boutons de fin d'épreuve, ajoutés sous l'écran de résultats de chaque épreuve.
  function renderNextStep(current, container) {
    if (!container) return;
    var old = container.querySelector('.exam-flow');
    if (old) old.remove();
    var wrap = document.createElement('div');
    wrap.className = 'exam-flow';
    var nxt = nextOf(current);

    if (isMock()) {
      var pos = ORDER.indexOf(current) + 1;
      var head = '<div class="exam-flow__mock">Mock exam · step ' + pos + ' of 4 complete</div>';
      if (nxt) {
        wrap.innerHTML = head +
          '<a class="btn btn-primary btn-lg" href="' + PAGES[nxt] + '?mock=1">Continue to ' + ICON[nxt] + ' ' + LABELS[nxt] + ' →</a>' +
          '<button type="button" class="btn btn-ghost exam-flow__stop" onclick="ExamFlow.stopMock()">Stop mock exam</button>';
      } else {
        // Dernière épreuve (Speaking) : on clôt le parcours.
        wrap.innerHTML = head +
          '<button type="button" class="btn btn-primary btn-lg" onclick="ExamFlow.finishMock(event)">Finish mock exam →</button>';
      }
    } else {
      var html = '';
      if (nxt) {
        html += '<div class="exam-flow__label">Next in the exam order</div>' +
                '<a class="btn btn-primary btn-lg" href="' + PAGES[nxt] + '">Next: ' + ICON[nxt] + ' ' + LABELS[nxt] + ' →</a>';
      } else {
        html += '<div class="exam-flow__label">You’ve reached the last section</div>';
      }
      html += '<div class="exam-flow__end"><a class="btn btn-outline" href="dashboard.html">View Dashboard</a>' +
              '<a class="btn btn-ghost" href="index.html">Home</a></div>';
      wrap.innerHTML = html;
    }
    container.appendChild(wrap);
  }

  // Écran de fin du mock (après Speaking) : félicitations + un seul
  // questionnaire micro-feedback (délégué à FeedbackGate s'il est présent),
  // qui déverrouille rétroactivement les 4 rapports détaillés.
  function finishMock(ev) {
    if (ev && ev.preventDefault) ev.preventDefault();
    var overlay = document.createElement('div');
    overlay.className = 'exam-done';
    overlay.innerHTML =
      '<div class="exam-done__card">' +
        '<div class="exam-done__emoji">🎉</div>' +
        '<h2 class="exam-done__title">You’ve completed all four</h2>' +
        '<p class="exam-done__sub">Listening, Reading, Writing and Speaking done in one sitting. One last question and your full report is unlocked.</p>' +
        '<div class="exam-done__gate"></div>' +
        '<a class="btn btn-outline" href="dashboard.html">View my dashboard</a>' +
      '</div>';
    document.body.appendChild(overlay);
    var gateEl = overlay.querySelector('.exam-done__gate');
    var done = function () { clearMock(); };
    if (window.FeedbackGate && typeof window.FeedbackGate.renderFinalQuestionnaire === 'function') {
      window.FeedbackGate.renderFinalQuestionnaire(gateEl, { onDone: done });
    } else {
      // Filet de sécurité si le questionnaire n'est pas chargé : ne pas bloquer.
      done();
    }
    try { overlay.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
  }

  window.ExamFlow = {
    ORDER: ORDER, isMock: isMock, startMock: startMock, stopMock: stopMock,
    finishMock: finishMock, renderNextStep: renderNextStep, nextOf: nextOf,
  };
})();
