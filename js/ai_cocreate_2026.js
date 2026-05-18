document.addEventListener('DOMContentLoaded', () => {
  const homePage = document.getElementById('home-page');
  const speakerPage = document.getElementById('speaker-page');
  const allNavLinks = Array.from(document.querySelectorAll('nav a'));

  if (!homePage || !speakerPage) return;

  // home-page 内需要被滚动联动的 section id（按 DOM 顺序）
  const sectionIds = ['about', 'submission', 'speakers', 'schedule', 'committee', 'contact'];

  function setActive(predicate) {
    allNavLinks.forEach((link) => link.classList.toggle('active', predicate(link)));
  }

  function setActiveBySectionId(id) {
    setActive((l) => {
      const href = l.getAttribute('href') || '';
      if (href === '#' + id) return true;
      // Speakers 这个 nav 实际指向 #speaker-chen,但它代表 home 里的 #speakers
      if (id === 'speakers' && l.dataset.pageLink === 'speaker') return true;
      return false;
    });
  }

  function smoothScrollTo(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showPage(showSpeaker) {
    homePage.classList.toggle('active', !showSpeaker);
    speakerPage.classList.toggle('active', showSpeaker);
  }

  // === 点击 nav ===
  allNavLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href') || '';
      if (!href.startsWith('#')) return;
      e.preventDefault();

      const pageType = this.dataset.pageLink;
      const targetId = href.slice(1);

      if (pageType === 'speaker' || href.startsWith('#speaker-')) {
        showPage(true);
        setActive((l) => l === this);
        requestAnimationFrame(() => smoothScrollTo(targetId));
      } else if (href === '#home' || pageType === 'home') {
        showPage(false);
        setActive((l) => l === this);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        if (!homePage.classList.contains('active')) showPage(false);
        setActive((l) => l === this);
        requestAnimationFrame(() => smoothScrollTo(targetId));
      }

      history.replaceState(null, '', href);
    });
  });

  // === 滚动联动 active ===
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!homePage.classList.contains('active')) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length) setActiveBySectionId(visible[0].target.id);
      },
      { rootMargin: '-90px 0px -55% 0px', threshold: [0, 0.2, 0.5, 1] }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  // 滚到顶部 → Home 亮
  let scrollT;
  window.addEventListener(
    'scroll',
    () => {
      if (!homePage.classList.contains('active')) return;
      clearTimeout(scrollT);
      scrollT = setTimeout(() => {
        if (window.scrollY < 180) {
          setActive((l) => (l.getAttribute('href') || '') === '#home');
        }
      }, 80);
    },
    { passive: true }
  );

  // === 初始 hash + 浏览器前进后退 ===
  function updatePage() {
    const hash = window.location.hash || '#home';
    const showSpeaker = hash.startsWith('#speaker-') || hash === '#speakers';

    // #speakers 还属于 home-page 内的 section,不切换 page
    if (hash === '#speakers') {
      showPage(false);
      setActiveBySectionId('speakers');
      requestAnimationFrame(() => smoothScrollTo('speakers'));
      return;
    }

    if (hash.startsWith('#speaker-')) {
      showPage(true);
      setActive((l) => l.dataset.pageLink === 'speaker');
      requestAnimationFrame(() => smoothScrollTo(hash.slice(1)));
      return;
    }

    if (hash === '#home') {
      showPage(false);
      setActive((l) => (l.getAttribute('href') || '') === '#home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 普通 section
    showPage(false);
    setActive((l) => (l.getAttribute('href') || '') === hash);
    requestAnimationFrame(() => smoothScrollTo(hash.slice(1)));
  }

  window.addEventListener('hashchange', updatePage);
  updatePage();

  // 移动端菜单(如果有)
  const mobileMenu = document.querySelector('.mobile-menu');
  const nav = document.querySelector('nav');
  if (mobileMenu && nav) {
    mobileMenu.addEventListener('click', () => nav.classList.toggle('open'));
  }
});