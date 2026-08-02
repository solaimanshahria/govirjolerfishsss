const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

const boot = $('#boot');
const main = $('#main');
const flash = $('.flash');
const command = $('#command');
const outputOne = $('#o1');
const outputTwo = $('#o2');
const outputThree = $('#o3');

let entered = false;

async function typeText(element, text, speed = 50) {
    for (const character of text) {
        element.textContent += character;
        await sleep(speed);
    }
}

async function eraseText(element, speed = 28) {
    while (element.textContent) {
        element.textContent = element.textContent.slice(0, -1);
        await sleep(speed);
    }
}

async function intro() {
    await sleep(450);
    await typeText(command, 'whoami', 85);
    await sleep(400);

    for (const name of ['Solaiman', 'Shahria', 'Shishir']) {
        await typeText(outputOne, name, 82);
        await sleep(420);
        await eraseText(outputOne);
    }

    await typeText(outputTwo, 'Identity verified.', 42);
    await sleep(380);
    await typeText(outputThree, 'Welcome to my world.', 42);
    await sleep(580);
    enterSite();
}

function enterSite() {
    if (entered) {
        return;
    }

    entered = true;
    flash.classList.add('go');
    document.body.classList.add('shake');

    setTimeout(() => {
        document.body.classList.remove('shake');
    }, 500);

    boot.classList.add('hide');
    main.classList.add('show');

    if (hasFinePointer) {
        setTimeout(() => {
            breakIdentity();
        }, 800);
    }
}

$('#skip').addEventListener('click', enterSite);
intro();

const cursor = $('.cursor');
const cursorRing = $('.cursor-ring');

let mouseX = innerWidth / 2;
let mouseY = innerHeight / 2;
let ringX = mouseX;
let ringY = mouseY;
const hasFinePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
let ambientTime = 0;

if (hasFinePointer) {
addEventListener('mousemove', event => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;

    document.documentElement.style.setProperty('--mx', `${mouseX}px`);
    document.documentElement.style.setProperty('--my', `${mouseY}px`);

    const offsetX = (mouseX - innerWidth / 2) / innerWidth;
    const offsetY = (mouseY - innerHeight / 2) / innerHeight;

    $('#nameWrap').style.setProperty('--tx', `${offsetX * 20}px`);
    $('#nameWrap').style.setProperty('--ty', `${offsetY * 13}px`);
    $('#giant').style.setProperty('--rot', `${-10 + offsetX * 12}deg`);
});
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

(function animateCursorRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;

    if (hasFinePointer) {
        cursorRing.style.left = `${ringX}px`;
        cursorRing.style.top = `${ringY}px`;
    }

    requestAnimationFrame(animateCursorRing);
})();

$$('.hoverable').forEach(element => {
    element.addEventListener('mouseenter', () => {
        document.body.classList.add('hovering');
    });

    element.addEventListener('mouseleave', () => {
        document.body.classList.remove('hovering');
    });
});

let characterIndex = 0;

$$('.word').forEach(word => {
    word.innerHTML = [...word.textContent.trim()]
        .map(character => {
            const index = characterIndex++;
            return `<span class="char" style="--char-index:${index}">${character}</span>`;
        })
        .join('');
});

function breakIdentity() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

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

if (hasFinePointer) {
    $$('.char').forEach(character => {
        character.addEventListener('mousemove', event => {
            const rect = character.getBoundingClientRect();
            const offsetX = event.clientX - (rect.left + rect.width / 2);
            const offsetY = event.clientY - (rect.top + rect.height / 2);

            character.style.transform = `translate(${offsetX * 0.28}px, ${offsetY * 0.28}px)`;
        });

        character.addEventListener('mouseleave', () => {
            character.style.transform = '';
        });
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

const leaveScreen = $('#leave');

addEventListener('blur', () => {
    leaveScreen.classList.add('show');
});

addEventListener('focus', () => {
    leaveScreen.classList.remove('show');
});


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
