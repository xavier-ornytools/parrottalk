/* ParrotTalk — micro-feedback post-score (échange de valeur).
 *
 * Le band global reste toujours visible, exact, gratuit (la démo produit).
 * Le rapport détaillé se débloque après 3 questions à un clic. Une dernière
 * question de note (1 à 10) est proposée, optionnelle, tout en bas du rapport.
 *
 * Données envoyées au Worker (POST /feedback, fire-and-forget) : uniquement des
 * valeurs d'énumération + le band et le type d'épreuve. Aucune donnée nominative.
 * Un event GA4 est émis par réponse (agrégé, sous consentement uniquement).
 *
 * localStorage : une fois les 3 questions répondues, on ne les repose plus dans
 * la session ; au rechargement, le rapport revient débloqué, pas les questions.
 *
 * API : window.FeedbackGate.render(container, {
 *   type: 'writing' | 'speaking', testId: number, band: number|null,
 *   heroHTML: string,   // le band, toujours visible
 *   detailHTML: string, // le rapport détaillé, révélé après les 3 réponses
 * })
 */
(function () {
  'use strict';

  var LS_UNLOCKED = 'ielts_feedback_unlocked';
  var LS_ANSWERS  = 'ielts_feedback_answers';
  var LS_RATED    = 'ielts_feedback_rated';
  var API_BASE    = 'https://parrottalk-api.foundry8.workers.dev';

  var QUESTIONS = [
    {
      id: 'scoreVsExpected',
      text: 'How does this score compare to what you expected?',
      options: [['lower', 'Lower'], ['expected', 'About what I expected'], ['higher', 'Higher']]
    },
    {
      id: 'examTiming',
      text: 'When is your IELTS exam?',
      options: [['within_1m', 'Within 1 month'], ['1_3m', '1–3 months'], ['not_booked', 'Not booked yet'], ['practicing', 'Just practicing']]
    },
    {
      id: 'mostHelpful',
      text: 'What would help you most before your exam?',
      options: [['practice_tests', 'More practice tests'], ['detailed_corrections', 'More detailed corrections'], ['speaking_practice', 'Speaking practice'], ['tips_strategies', 'Tips and strategies']]
    }
  ];

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function isUnlocked() { return lsGet(LS_UNLOCKED) === '1'; }
  function isRated() { return lsGet(LS_RATED) === '1'; }

  function ga(event, params) {
    try { if (typeof window.gtag === 'function') window.gtag('event', event, params || {}); } catch (e) {}
  }

  // Envoi non bloquant : l'UI ne dépend jamais du réseau (mobile lent inclus).
  function postFeedback(payload) {
    try {
      fetch(API_BASE + '/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
  }

  function render(container, opts) {
    container.innerHTML = opts.heroHTML +
      '<div class="feedback-detail' + (isUnlocked() ? ' is-open' : '') + '"></div>';
    var detailEl = container.querySelector('.feedback-detail');
    detailEl.innerHTML = opts.detailHTML;

    if (isUnlocked()) {
      maybeAppendRating(detailEl, opts);
      return;
    }
    mountGate(container, detailEl, opts);
  }

  function mountGate(container, detailEl, opts) {
    var gate = document.createElement('div');
    gate.className = 'fb-gate';
    container.insertBefore(gate, detailEl);

    var step = 0;
    var answers = {};

    function renderStep() {
      if (step >= QUESTIONS.length) { complete(); return; }
      var q = QUESTIONS[step];
      var barPct = Math.round((step / QUESTIONS.length) * 100);
      var optsHTML = q.options.map(function (o) {
        return '<button type="button" class="fb-opt" data-val="' + o[0] + '">' + o[1] + '</button>';
      }).join('');
      gate.innerHTML =
        '<div class="fb-gate__head">' +
          '<div class="fb-gate__icon" aria-hidden="true">🔒</div>' +
          '<h3 class="fb-gate__title">Unlock your detailed feedback</h3>' +
          '<p class="fb-gate__sub">30 seconds, 3 taps. Your answers help our AI become more accurate for candidates like you.</p>' +
        '</div>' +
        '<div class="fb-progress" role="progressbar" aria-valuemin="0" aria-valuemax="3" aria-valuenow="' + step + '">' +
          '<div class="fb-progress__track"><div class="fb-progress__bar" style="width:' + barPct + '%"></div></div>' +
          '<span class="fb-progress__label">' + (step + 1) + ' / 3</span>' +
        '</div>' +
        '<div class="fb-q">' +
          '<p class="fb-q__text">' + q.text + '</p>' +
          '<div class="fb-q__opts">' + optsHTML + '</div>' +
        '</div>';
      var buttons = gate.querySelectorAll('.fb-opt');
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function (ev) {
          onAnswer(q, ev.currentTarget.getAttribute('data-val'));
        });
      }
    }

    function onAnswer(q, val) {
      answers[q.id] = val;
      ga('feedback_answer', { fb_question: q.id, fb_answer: val, fb_type: opts.type, fb_band: opts.band });
      var qEl = gate.querySelector('.fb-q');
      if (qEl) qEl.classList.add('fb-q--out');
      step += 1;
      setTimeout(renderStep, 180);
    }

    function complete() {
      lsSet(LS_ANSWERS, JSON.stringify(answers));
      lsSet(LS_UNLOCKED, '1');
      postFeedback({
        type: opts.type, testId: opts.testId, band: opts.band,
        scoreVsExpected: answers.scoreVsExpected,
        examTiming: answers.examTiming,
        mostHelpful: answers.mostHelpful
      });
      ga('feedback_unlocked', { fb_type: opts.type, fb_band: opts.band });

      // Révèle tous les rapports détaillés de la page (ex. les 2 tâches Writing)
      // et retire les éventuelles autres cartes de déblocage encore ouvertes.
      var details = document.querySelectorAll('.feedback-detail');
      for (var i = 0; i < details.length; i++) details[i].classList.add('is-open');
      var otherGates = document.querySelectorAll('.fb-gate');
      for (var j = 0; j < otherGates.length; j++) {
        if (otherGates[j] !== gate) otherGates[j].remove();
      }

      maybeAppendRating(detailEl, opts);

      gate.classList.add('fb-gate--done');
      setTimeout(function () { gate.remove(); }, 350);
    }

    renderStep();
  }

  // Note de beta optionnelle, une seule fois par session, au bas du rapport.
  function maybeAppendRating(detailEl, opts) {
    if (isRated()) return;
    if (document.querySelector('.fb-rating')) return;

    var wrap = document.createElement('div');
    wrap.className = 'fb-rating';
    var btns = '';
    for (var n = 1; n <= 10; n++) {
      btns += '<button type="button" class="fb-rating__btn" data-n="' + n + '">' + n + '</button>';
    }
    wrap.innerHTML =
      '<div class="fb-rating__q">ParrotTalk is still in beta. How would you rate it so far?</div>' +
      '<div class="fb-rating__scale">' + btns + '</div>';
    detailEl.appendChild(wrap);

    var buttons = wrap.querySelectorAll('.fb-rating__btn');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function (ev) {
        var n = parseInt(ev.currentTarget.getAttribute('data-n'), 10);
        lsSet(LS_RATED, '1');
        ga('feedback_rating', { fb_rating: n, fb_type: opts.type });
        postFeedback({ type: opts.type, testId: opts.testId, band: opts.band, betaRating: n });
        wrap.innerHTML = '<div class="fb-rating__thanks">Thanks — that helps us improve ParrotTalk 🙌</div>';
      });
    }
  }

  window.FeedbackGate = { render: render };
})();
