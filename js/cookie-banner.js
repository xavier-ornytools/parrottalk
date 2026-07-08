// Blocking cookie-consent banner for GA4 (shown once until a choice is made)
(function () {
  var KEY = "parrottalk_cookie_consent";

  function inject() {
    if (localStorage.getItem(KEY)) return; // choice already made — never show again

    var el = document.createElement("div");
    el.id = "cookie-banner";
    el.className = "cookie-banner";
    el.innerHTML =
      '<div class="cookie-banner__inner">' +
        '<p class="cookie-banner__text">🍪 We use Google Analytics to understand site traffic. It stays off unless you accept. See our <a href="privacy.html">Privacy Policy</a>.</p>' +
        '<div class="cookie-banner__actions">' +
          '<button id="cookie-banner-reject" class="cookie-banner__btn cookie-banner__btn--secondary">Reject</button>' +
          '<button id="cookie-banner-accept" class="cookie-banner__btn cookie-banner__btn--primary">Accept</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);

    document.getElementById("cookie-banner-accept").addEventListener("click", function () {
      localStorage.setItem(KEY, "granted");
      el.remove();
      if (window.__ptLoadAnalyticsIfConsented) window.__ptLoadAnalyticsIfConsented();
    });
    document.getElementById("cookie-banner-reject").addEventListener("click", function () {
      localStorage.setItem(KEY, "denied");
      el.remove();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
