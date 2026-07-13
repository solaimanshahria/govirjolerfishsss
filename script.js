/* ======================================
   SOLAIMAN SHAHRIA
   SCRIPT.JS
====================================== */

gsap.registerPlugin(ScrollTrigger);

// Always start from top after refresh
if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
}

/* =========================
   MOUSE LIGHT
========================= */

const light = document.querySelector(".cursor-light");

window.addEventListener("mousemove", (e) => {
    gsap.to(light, {
        x: e.clientX,
        y: e.clientY,
        duration: 1,
        ease: "power3.out"
    });
});

/* =========================
   SMOOTH SCROLL
========================= */

const lenis = new Lenis({
    duration: 1.2,
    smoothWheel: true
});

lenis.on("scroll", ScrollTrigger.update);

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Refresh করলে Hero section থেকে শুরু হবে
window.addEventListener("load", () => {
    lenis.scrollTo(0, {
        immediate: true
    });
});

/* =========================
   HERO ANIMATION
========================= */

gsap.from(".hero-name span", {
    y: 120,
    opacity: 0,
    duration: 1.5,
    stagger: 0.2,
    ease: "power4.out"
});

gsap.to(".hero-name", {
    y: -150,
    opacity: 0,
    scale: 0.85,
    scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: true
    }
});

/* =========================
   CATCH ME ON
========================= */

gsap.from(".catch-title span", {
    x: -100,
    opacity: 0,
    stagger: 0.15,
    scrollTrigger: {
        trigger: "#social",
        start: "top 70%",
        toggleActions: "play none none none"
    }
});

/* =========================
   SOCIAL LINKS
========================= */

const links = gsap.utils.toArray(".social-links a");

links.forEach((link, index) => {

    gsap.from(link, {
        x: index % 2 === 0 ? -300 : 300,
        opacity: 0,

        scrollTrigger: {
            trigger: "#social",
            start: "top 80%",
            scrub: 1
        }
    });

});



window.addEventListener("pageshow", () => {

    if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);

    lenis.scrollTo(0, {
        immediate: true
    });

});