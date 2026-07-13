// Google Analytics 4 — only loads after cookie consent is granted
(function () {
  var MEASUREMENT_ID = "G-VV4Z9F7SZS";
  var CONSENT_KEY = "parrottalk_cookie_consent";
  var INTERNAL_KEY = "pt_internal"; // localStorage marker posé par /internal.html

  function isInternal() {
    try { return localStorage.getItem(INTERNAL_KEY) === "1"; } catch (e) { return false; }
  }

  function loadGA4() {
    if (window.__ptGaLoaded) return;
    window.__ptGaLoaded = true;

    var loader = document.createElement("script");
    loader.async = true;
    loader.src = "https://www.googletagmanager.com/gtag/js?id=" + MEASUREMENT_ID;
    document.head.appendChild(loader);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { dataLayer.push(arguments); };
    gtag("js", new Date());
    // Trafic interne (Xavier) : on marque le page_view avec traffic_type=internal
    // (méthode standard GA4, filtrable côté propriété). Les key events custom, eux,
    // ne sont carrément pas envoyés (voir ptEvent ci-dessous).
    if (isInternal()) gtag("config", MEASUREMENT_ID, { traffic_type: "internal" });
    else gtag("config", MEASUREMENT_ID);
  }

  // Exposed so the cookie banner can call it the instant the user clicks Accept
  window.__ptLoadAnalyticsIfConsented = function () {
    if (localStorage.getItem(CONSENT_KEY) === "granted") loadGA4();
  };

  // Envoi d'un key event. Ne fait rien si : trafic interne, ou GA4 pas chargé
  // (consentement cookies non accordé). N'initialise jamais GA4 de lui-même :
  // le consentement reste piloté uniquement par le bandeau existant.
  window.ptEvent = function (name, params) {
    try {
      if (isInternal()) return;
      if (typeof window.gtag !== "function") return;
      window.gtag("event", name, params || {});
    } catch (e) {}
  };

  // Self-check on every load (covers returning visitors who already consented)
  window.__ptLoadAnalyticsIfConsented();
})();
