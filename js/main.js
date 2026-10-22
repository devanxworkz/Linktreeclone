/* ============================================================
   ChatIQ — WhatsApp CRM & Automation Platform
   Shared JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', function() {

  // ---- Sticky Nav ----
  const navbar = document.querySelector('.nav');
  if (navbar) {
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // ---- Mobile Nav Toggle ----
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', function() {
      navLinks.classList.toggle('open');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
      }
    });
    // Close mobile nav on link click
    navLinks.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        navLinks.classList.remove('open');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-times');
        }
      });
    });
  }

  // ---- Pricing Toggle ----
  const pricingToggle = document.getElementById('pricingToggle');
  if (pricingToggle) {
    const monthlyLabel = document.getElementById('monthlyLabel');
    const yearlyLabel = document.getElementById('yearlyLabel');
    const monthlyPrices = document.querySelectorAll('.price-monthly');
    const yearlyPrices = document.querySelectorAll('.price-yearly');

    pricingToggle.addEventListener('click', function() {
      pricingToggle.classList.toggle('active');
      const isYearly = pricingToggle.classList.contains('active');
      if (monthlyLabel) monthlyLabel.classList.toggle('active', !isYearly);
      if (yearlyLabel) yearlyLabel.classList.toggle('active', isYearly);
      monthlyPrices.forEach(function(el) { el.style.display = isYearly ? 'none' : 'inline'; });
      yearlyPrices.forEach(function(el) { el.style.display = isYearly ? 'inline' : 'none'; });
    });
  }

  // ---- FAQ Accordion ----
  document.querySelectorAll('.faq-question').forEach(function(q) {
    q.addEventListener('click', function() {
      var item = q.parentElement;
      var isActive = item.classList.contains('active');
      // Close all
      document.querySelectorAll('.faq-item').forEach(function(i) { i.classList.remove('active'); });
      // Open clicked if it wasn't active
      if (!isActive) item.classList.add('active');
    });
  });

  // ---- Scroll Reveal ----
  var revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(function(el) {
    revealObserver.observe(el);
  });

});
