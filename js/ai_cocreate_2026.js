document.addEventListener('DOMContentLoaded', () => {
  const homePage = document.getElementById('home-page');
  const speakerPage = document.getElementById('speaker-page');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!homePage || !speakerPage) {
    return;
  }

  function updatePage() {
    const hash = window.location.hash || '#home';
    const showSpeaker = hash.startsWith('#speaker');

    homePage.classList.toggle('active', !showSpeaker);
    speakerPage.classList.toggle('active', showSpeaker);

    navLinks.forEach((link) => {
      const pageType = link.dataset.pageLink;
      link.classList.toggle('active', showSpeaker ? pageType === 'speaker' : pageType === 'home');
    });

    if (showSpeaker) {
      requestAnimationFrame(() => {
        const target = document.querySelector(hash);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    } else if (hash === '#home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  window.addEventListener('hashchange', updatePage);
  updatePage();
});
