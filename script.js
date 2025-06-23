let ticking = false;
let scrollTimeout;
let resizeTimeout;

const mobileMenu = document.getElementById("mobileMenu");
const navLinks = document.getElementById("navLinks");
const header = document.getElementById("header");
const sections = document.querySelectorAll(".section");
const navItems = document.querySelectorAll(".nav-link");

const isMobile = () => window.innerWidth <= 768;
const isAndroidDevice = /Android/.test(navigator.userAgent);

// Mobile menu toggle
if (mobileMenu && navLinks) {
  mobileMenu.addEventListener(
    "click",
    () => {
      navLinks.classList.toggle("active");
    },
    { passive: true }
  );
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener(
    "click",
    function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        const scrollBehavior = isMobile() ? "auto" : "smooth";
        if (scrollBehavior === "auto") {
          const targetPosition = target.offsetTop - 80;
          const startPosition = window.pageYOffset;
          const distance = targetPosition - startPosition;
          const duration = Math.min(Math.abs(distance) * 0.5, 800);
          let start = null;

          function animation(currentTime) {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const progress = Math.min(timeElapsed / duration, 1);
            const ease =
              progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            window.scrollTo(0, startPosition + distance * ease);
            if (timeElapsed < duration) {
              requestAnimationFrame(animation);
            }
          }
          requestAnimationFrame(animation);
        } else {
          target.scrollIntoView({ behavior: scrollBehavior, block: "start" });
        }
      }
      if (navLinks) navLinks.classList.remove("active");
    },
    { passive: false }
  );
});

// Fixed navigation active state logic
function updateActiveNavigation() {
  const scrollY = window.pageYOffset;
  let currentSection = "";
  
  // Find the current section based on scroll position
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 100; // Account for header height
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute("id");
    
    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      currentSection = sectionId;
    }
  });
  
  // If we're at the very top, ensure home is active
  if (scrollY < 100) {
    currentSection = "home";
    
  }
  
  // Update navigation links
  navItems.forEach((item) => {
    item.classList.remove("active");
    const href = item.getAttribute("href");
    if (href === "#" + currentSection) {
      item.classList.add("active");
    }
  });
}

// Optimized scroll handler
function updateOnScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      const scrollY = window.pageYOffset;
      
      // Update header background
      if (header) {
        if (scrollY > 100) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }
      }
      
      // Update active navigation with throttling
      if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
          updateActiveNavigation();
          scrollTimeout = null;
        }, 50); // Reduced timeout for better responsiveness
      }
      
      ticking = false;
    });
    ticking = true;
  }
}

window.addEventListener("scroll", updateOnScroll, { passive: true });

// Optimized intersection observer for mobile performance
const observerOptions = {
  threshold: isMobile() ? 0.1 : 0.2,
  rootMargin: isMobile() ? "-20px 0px -20px 0px" : "-50px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translate3d(0, 0, 0)";
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

function initializeSections() {
  const currentIsMobile = isMobile();
  sections.forEach((section) => {
    section.style.transition = currentIsMobile
      ? "opacity 0.4s ease, transform 0.4s ease"
      : "opacity 0.6s ease, transform 0.6s ease";
    section.style.willChange = "opacity, transform";
    section.style.backfaceVisibility = "hidden";
    section.style.perspective = "1000px";
    section.style.opacity = currentIsMobile ? "0.8" : "0";
    section.style.transform = currentIsMobile
      ? "translate3d(0, 15px, 0)"
      : "translate3d(0, 30px, 0)";
    observer.observe(section);
  });
}

// Initialize on load
document.addEventListener("DOMContentLoaded", () => {
  initializeSections();
  updateActiveNavigation(); // Set initial active state
});

// Debounced resize handler
window.addEventListener(
  "resize",
  () => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      initializeSections();
      updateActiveNavigation();
    }, 250);
  },
  { passive: true }
);

// Contact item click handlers
document.addEventListener(
  "click",
  (e) => {
    const contactItem = e.target.closest(".contact-item");
    if (contactItem) {
      const icon = contactItem.querySelector("i");
      if (icon?.classList.contains("bxs-phone")) {
        window.location.href = "tel:+917200484930";
      } else if (icon?.classList.contains("bxl-gmail")) {
        window.location.href = "mailto:rajarams7200@gmail.com";
      }
    }
  },
  { passive: true }
);

// Android-specific optimizations
if (isAndroidDevice) {
  document.body.style.transform = "translate3d(0,0,0)";
  document.addEventListener("touchstart", function () {}, { passive: true });
  document.addEventListener("touchmove", function () {}, { passive: true });
}

// Clean up animations after initial load
function cleanupAnimations() {
  sections.forEach((section) => {
    section.style.willChange = "auto";
  });
}

setTimeout(cleanupAnimations, 4000);

// Force auto scroll behavior on mobile
if (isMobile()) {
  document.documentElement.style.scrollBehavior = "auto";
}