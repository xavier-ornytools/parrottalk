// Google Analytics 4 — chargement factorisé (une seule ligne à inclure par page)
(function () {
  var MEASUREMENT_ID = "G-VV4Z9F7SZS";

  var loader = document.createElement("script");
  loader.async = true;
  loader.src = "https://www.googletagmanager.com/gtag/js?id=" + MEASUREMENT_ID;
  document.head.appendChild(loader);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { dataLayer.push(arguments); };
  gtag("js", new Date());
  gtag("config", MEASUREMENT_ID);
})();
