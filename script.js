const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

const boot = $('#boot');
const main = $('#main');
const flash = $('.flash');
const numberStage = $('#numberStage');
const numberForm = $('#numberForm');
const accessNumber = $('#accessNumber');
const numberError = $('#numberError');
const currentCount = $('#currentCount');

const COUNT_DELAY_MS = 100;
let entered = false;
let counting = false;

async function startCounter(target) {
    counting = true;
    numberStage.classList.add('is-counting');
    currentCount.textContent = String(target);

    for (let count = target; count >= 0; count -= 1) {
        currentCount.textContent = String(count);
        if (count > 0) await sleep(COUNT_DELAY_MS);
    }

    await sleep(220);
    enterSite();
}

numberForm.addEventListener('submit', event => {
    event.preventDefault();
    if (counting || entered) return;

    const target = Number(accessNumber.value);
    if (!Number.isSafeInteger(target) || target < 1) {
        numberError.textContent = 'TYPE A WHOLE NUMBER GREATER THAN 0';
        accessNumber.focus();
        return;
    }

    numberError.textContent = '';
    startCounter(target);
});

function enterSite() {
    if (entered) return;
    entered = true;

    document.body.classList.add('intro-active');
    boot.classList.add('hide');
    document.body.classList.remove('boot-active');
    main.classList.add('show');
    flash.classList.add('go');

    // Remove only the entrance class after every staged animation completes.
    // The original ambient animations then continue normally.
    setTimeout(() => {
        document.body.classList.remove('intro-active');
        document.body.classList.add('intro-complete');
    }, 6500);
}

requestAnimationFrame(() => accessNumber.focus());

const hasFinePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
let mouseX = innerWidth / 2;
let mouseY = innerHeight / 2;
let ambientTime = 0;

if (hasFinePointer) {
    addEventListener('mousemove', event => {
        mouseX = event.clientX;
        mouseY = event.clientY;

        document.documentElement.style.setProperty('--mx', `${mouseX}px`);
        document.documentElement.style.setProperty('--my', `${mouseY}px`);

        const offsetX = (mouseX - innerWidth / 2) / innerWidth;
        const offsetY = (mouseY - innerHeight / 2) / innerHeight;

        $('#nameWrap').style.setProperty('--tx', `${offsetX * 20}px`);
        $('#nameWrap').style.setProperty('--ty', `${offsetY * 13}px`);
        $('#giant').style.setProperty('--rot', `${-10 + offsetX * 12}deg`);
    }, { passive: true });
}

(function animateAmbientFocus() {
    if (!hasFinePointer) {
        ambientTime += 0.008;
        mouseX = innerWidth * (0.5 + Math.sin(ambientTime) * 0.18);
        mouseY = innerHeight * (0.46 + Math.cos(ambientTime * 0.73) * 0.13);
        document.documentElement.style.setProperty('--mx', `${mouseX}px`);
        document.documentElement.style.setProperty('--my', `${mouseY}px`);
    }

    requestAnimationFrame(animateAmbientFocus);
})();

let characterIndex = 0;

$$('.word').forEach(word => {
    word.innerHTML = [...word.textContent.trim()]
        .map(character => {
            const index = characterIndex++;
            return `<span class="char" style="--char-index:${index}">${character}</span>`;
        })
        .join('');
});

// Split the contact email into individual letters for the staged entrance.
const footerEmail = $('.footer-email');
if (footerEmail) {
    const emailText = footerEmail.textContent.trim();
    footerEmail.setAttribute('aria-label', emailText);
    footerEmail.innerHTML = [...emailText]
        .map((character, index) => `<span class="email-char" aria-hidden="true" style="--email-index:${index}">${character}</span>`)
        .join('');
}

function breakIdentity() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    $$('.char').forEach((character, index) => {
        const x = (Math.random() - 0.5) * 34;
        const y = (Math.random() - 0.5) * 28;
        const rotation = (Math.random() - 0.5) * 12;

        character.animate(
            [
                { transform: 'translate(0, 0) rotate(0)' },
                { transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)` },
                { transform: 'translate(0, 0) rotate(0)' }
            ],
            {
                duration: 900 + Math.random() * 450,
                delay: index * 12,
                easing: 'cubic-bezier(.2,.8,.2,1)'
            }
        );
    });
}

const canvas = $('#canvas');
const context = canvas.getContext('2d');
let dots = [];

function resizeCanvas() {
    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = innerHeight * devicePixelRatio;

    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    dots = Array.from(
        { length: Math.min(105, Math.floor(innerWidth / 13)) },
        () => ({
            x: Math.random() * innerWidth,
            y: Math.random() * innerHeight,
            velocityX: (Math.random() - 0.5) * 0.24,
            velocityY: (Math.random() - 0.5) * 0.24,
            radius: Math.random() * 1.2 + 0.25
        })
    );
}

addEventListener('resize', resizeCanvas);
resizeCanvas();

(function drawDots() {
    context.clearRect(0, 0, innerWidth, innerHeight);

    const dotColor = getComputedStyle(document.body)
        .getPropertyValue('--particle')
        .trim() || 'rgba(255,255,255,.42)';

    for (const dot of dots) {
        const offsetX = mouseX - dot.x;
        const offsetY = mouseY - dot.y;
        const distance = Math.hypot(offsetX, offsetY);

        if (distance < 180) {
            dot.x -= offsetX * 0.0018;
            dot.y -= offsetY * 0.0018;
        }

        dot.x += dot.velocityX;
        dot.y += dot.velocityY;

        if (dot.x < 0 || dot.x > innerWidth) {
            dot.velocityX *= -1;
        }

        if (dot.y < 0 || dot.y > innerHeight) {
            dot.velocityY *= -1;
        }

        context.beginPath();
        context.fillStyle = dotColor;
        context.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        context.fill();
    }

    requestAnimationFrame(drawDots);
})();


// Restart CSS ambient animations after mobile browser tab/app resumes.
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !hasFinePointer) {
        const animatedElements = $$('.name-wrap, .word, .char, .orbit, .giant');
        animatedElements.forEach(element => {
            element.style.animationPlayState = 'paused';
        });

        requestAnimationFrame(() => {
            animatedElements.forEach(element => {
                element.style.animationPlayState = 'running';
            });
        });
    }
});


// Definitive mobile link-tap fix.
(function enableReliableMobileLinks() {
    const links = document.querySelectorAll('.social, .footer-email');

    links.forEach(link => {
        let touchNavigated = false;

        link.addEventListener('touchend', event => {
            if (!link.href) return;

            touchNavigated = true;
            event.preventDefault();
            event.stopPropagation();
            window.location.href = link.href;

            setTimeout(() => {
                touchNavigated = false;
            }, 500);
        }, { passive: false });

        link.addEventListener('click', event => {
            if (!link.href || touchNavigated) return;

            // Keep normal desktop behavior; use reliable same-tab navigation on touch devices.
            if (matchMedia('(hover: none), (pointer: coarse)').matches) {
                event.preventDefault();
                event.stopPropagation();
                window.location.href = link.href;
            }
        });
    });

    // Completely remove the hidden access layer after its fade finishes.
    const bootScreen = document.getElementById('boot');
    if (bootScreen) {
        bootScreen.addEventListener('transitionend', () => {
            if (bootScreen.classList.contains('hide')) {
                bootScreen.style.display = 'none';
                bootScreen.style.pointerEvents = 'none';
            }
        });
    }
})();
