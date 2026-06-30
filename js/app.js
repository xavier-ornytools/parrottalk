// Mark active nav link based on current page
document.querySelectorAll('.nav__link').forEach(link => {
  if (link.getAttribute('href') === location.pathname.split('/').pop()) {
    link.classList.add('active');
  }
});
