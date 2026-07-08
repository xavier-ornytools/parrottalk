// Google Analytics 4 — only loads after cookie consent is granted
(function () {
  var MEASUREMENT_ID = "G-VV4Z9F7SZS";
  var CONSENT_KEY = "parrottalk_cookie_consent";

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
    gtag("config", MEASUREMENT_ID);
  }

  // Exposed so the cookie banner can call it the instant the user clicks Accept
  window.__ptLoadAnalyticsIfConsented = function () {
    if (localStorage.getItem(CONSENT_KEY) === "granted") loadGA4();
  };

  // Self-check on every load (covers returning visitors who already consented)
  window.__ptLoadAnalyticsIfConsented();
})();
