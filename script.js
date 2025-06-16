// Performance optimizations for mobile
let ticking = false;
let scrollTimeout;
let resizeTimeout;

// Cached DOM elements
const mobileMenu = document.getElementById("mobileMenu");
const navLinks = document.getElementById("navLinks");
const header = document.getElementById("header");
const sections = document.querySelectorAll(".section");
const navItems = document.querySelectorAll(".nav-link");

// Device detection
const isMobile = () => window.innerWidth <= 768;
const isAndroidDevice = /Android/.test(navigator.userAgent);

// Mobile Menu Toggle
if (mobileMenu && navLinks) {
  mobileMenu.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  }, { passive: true });
}

// Optimized Smooth Scrolling with reduced motion for mobile
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      // Use reduced motion on mobile for better performance
      const scrollBehavior = isMobile() ? 'auto' : 'smooth';
      
      if (scrollBehavior === 'auto' && isMobile()) {
        // Custom smooth scroll for mobile with better performance
        const targetPosition = target.offsetTop - 80; // Account for header
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = Math.min(Math.abs(distance) * 0.5, 800); // Max 800ms
        let start = null;

        function animation(currentTime) {
          if (start === null) start = currentTime;
          const timeElapsed = currentTime - start;
          const progress = Math.min(timeElapsed / duration, 1);
          
          // Easing function for smoother animation
          const ease = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          
          window.scrollTo(0, startPosition + distance * ease);
          
          if (timeElapsed < duration) {
            requestAnimationFrame(animation);
          }
        }
        requestAnimationFrame(animation);
      } else {
        target.scrollIntoView({
          behavior: scrollBehavior,
          block: "start",
        });
      }
    }
    // Close mobile menu after clicking
    if (navLinks) navLinks.classList.remove("active");
  }, { passive: false });
});

// Optimized scroll handler with requestAnimationFrame
function updateOnScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      const scrollY = window.pageYOffset;
      
      // Header background on scroll - optimized
      if (header) {
        if (scrollY > 100) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }
      }
      
      // Active navigation link - throttled for mobile
      if (!isMobile() || scrollTimeout === null) {
        updateActiveNavigation(scrollY);
      }
      
      ticking = false;
    });
    ticking = true;
  }
}

// Throttled active navigation update
function updateActiveNavigation(scrollY) {
  if (scrollTimeout) return;
  
  scrollTimeout = setTimeout(() => {
    let current = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollY >= sectionTop - 200) {
        current = section.getAttribute("id");
      }
    });

    navItems.forEach((item) => {
      item.classList.remove("active");
      if (item.getAttribute("href") === "#" + current) {
        item.classList.add("active");
      }
    });

    scrollTimeout = null;
  }, isMobile() ? 250 : 100); // Longer delay on mobile
}

// Optimized scroll event listener
window.addEventListener("scroll", updateOnScroll, { passive: true });

// Intersection Observer for Animations - Mobile optimized
const observerOptions = {
  threshold: isMobile() ? 0.05 : 0.1, // Lower threshold for mobile
  rootMargin: isMobile() ? "0px 0px -20px 0px" : "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // Use transform3d for hardware acceleration
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translate3d(0, 0, 0)";
      
      // Unobserve after animation for better performance
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Initialize section animations
function initializeSections() {
  const currentIsMobile = isMobile();
  
  sections.forEach((section) => {
    // Use transform3d for hardware acceleration
    section.style.transition = currentIsMobile 
      ? "opacity 0.4s ease, transform 0.4s ease" 
      : "opacity 0.6s ease, transform 0.6s ease";
    
    // Force hardware acceleration
    section.style.willChange = "opacity, transform";
    section.style.backfaceVisibility = "hidden";
    section.style.perspective = "1000px";

    if (!currentIsMobile) {
      section.style.opacity = "0";
      section.style.transform = "translate3d(0, 50px, 0)";
    } else {
      // Reduced animation on mobile for better performance
      section.style.opacity = "0.7";
      section.style.transform = "translate3d(0, 20px, 0)";
    }
    
    observer.observe(section);
  });
}

// Initialize on load
initializeSections();

// Optimized resize handler
window.addEventListener("resize", () => {
  if (resizeTimeout) clearTimeout(resizeTimeout);
  
  resizeTimeout = setTimeout(() => {
    // Re-initialize sections if device type changed
    initializeSections();
  }, 250);
}, { passive: true });

// Contact button actions - optimized event delegation
document.addEventListener("click", (e) => {
  const contactItem = e.target.closest(".contact-item");
  if (contactItem) {
    const icon = contactItem.querySelector("i");
    
    if (icon?.classList.contains("bxs-phone")) {
      window.location.href = "tel:+917200484930";
    } else if (icon?.classList.contains("bxl-gmail")) {
      window.location.href = "mailto:rajarams7200@gmail.com";
    }
  }
}, { passive: true });

// Android specific optimizations
if (isAndroidDevice) {
  // Enable hardware acceleration for smoother scrolling
  document.body.style.transform = 'translate3d(0,0,0)';
  
  // Optimize touch events for Android
  document.addEventListener('touchstart', function() {}, { passive: true });
  document.addEventListener('touchmove', function() {}, { passive: true });
}

// Clean up will-change properties after animations
function cleanupAnimations() {
  sections.forEach(section => {
    section.style.willChange = 'auto';
  });
}

// Clean up after 3 seconds (assuming all animations are done)
setTimeout(cleanupAnimations, 3000);

// Preload critical resources on mobile
if (isMobile()) {
  // Reduce repaints by batching DOM changes
  document.documentElement.style.scrollBehavior = 'auto';
}