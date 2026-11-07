const texts = [
    { text: "Hello", lang: "[həˈləʊ], English" },
    { text: "你好", lang: "[ni˧˥.xɑʊ˨˩˦], Chinese" },
    { text: "こんにちは", lang: "konnichiwa, [ko̞nˈni̥tɕiwa], Japanese" },
    { text: "Bonjour", lang: "[bɔ̃ʒuʀ], French" },
    { text: "Guten Tag", lang: "[ɡuːtn taːk], German" },
    { text: "Xin chào", lang: "[sin t͡ɕa̤w], Vietnamese" },
    { text: "吀嘲", lang: "[sin t͡ɕa̤w], Vietnamese (chữ Nôm / 𡦂喃)" },
    { text: "안녕하세요", lang: "annyeonghaseyo, [a̠n.njʌ̹ŋ.ha̠.se̞.jo̞], Korean" },
    { text: "ئامانمۇسىز", lang: "amanmusiz, [ɑː.mɑn.muː.sɯz], Uyghur" },
    { text: "Привет", lang: "privet, [prʲɪˈvʲet], Russian" },
    { text: "Molo", lang: "[ˈmɔːlo], isiXhosa" },
    { text: "مرحبا", lang: "marhaban, [marḥabā], Arabic" },
    { text: "Hola", lang: "['ola], Spanish" },
    { text: "Salve", lang: "['salʋe], Latin" },
    { text: "Olá", lang: " [oˈla], Portuguese" },
    { text: "Ciao", lang: "/tʃao/, Italian" },
    { text: "Goedendag", lang: "[ˈɣudə(n)dɑx], Dutch" },
    { text: "नमस्ते", lang: "namaste, [nəˈməs̪te̞], Hindi" },
    { text: "Γεια σας", lang: "geia sas, [ʝaˈsas], Greek" },
    { text: "ᐊᐃᓐᖓᐃ", lang: "aingna, [ɑːiŋŋɑːi], Inuktitut" },
    { text: "ᎣᏏᏲ", lang: "osiyo, [oːsijo], Cherokee" },
    { text: "გამარჯობა", lang: "gamarjoba, [ɡɑ.mɑr.dʒoˈbɑ], Georgian" },
    { text: "Բարև", lang: "barev, [bɑˈɾɛv], Armenian" },
    { text: "העלא", lang: "hala, [haˈʕɑ], Hebrew" },
    { text: "สวัสดี", lang: "sawatdee, [sa.wát.dīː], Thai" },
    { text: "Góðan dag", lang: "[ˈkouːðanˌtɑːɣ], Icelandic" },
    { text: "Merhaba", lang: "[ˈmɛɾhaba], Turkish" },
    { text: "བཀྲ་ཤིས་བདེ་ལེགས།", lang: "Tashi Delek, [ˈtʂʰaʃi ˈdeːleɡ], Tibetan" },
    { text: "Saluton", lang: "[saˈluto̞n], Esperanto" },
    { text: "nuqneH", lang: "[nuqˈnɛχ], Klingon" },
    { text: "Ciallo~(∠·ω< )⌒★", lang: "[t͡ɕɑ̈˦.lo̞˨˧], ?" }
];

let currentIndex = 0;
let activeTimer = null;
let pendingCallback = null;
let remainingDelay = 0;
let scheduledAt = 0;
let isPaused = false;
const typingSpeed = 200; // Typing speed in milliseconds
const eraseSpeed = 100; // Erase speed in milliseconds
const delayBetweenTexts = 2000; // Delay between texts in milliseconds

function isRTLText(text) {
    return /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/.test(text);
}

function queue(callback, delay) {
    window.clearTimeout(activeTimer);
    pendingCallback = callback;
    remainingDelay = delay;
    scheduledAt = performance.now();
    if (!isPaused) {
        activeTimer = window.setTimeout(() => {
            pendingCallback = null;
            callback();
        }, delay);
    }
}

function applyLanguageClasses(text, element, heroHello) {
    element.classList.remove('lang-zh', 'lang-ja', 'lang-rtl');
    element.classList.toggle('is-long', text.length > 10);
    heroHello?.classList.remove('is-rtl');

    if (text === "你好") {
        element.classList.add('lang-zh');
    } else if (/[\u3040-\u30ff]/.test(text)) {
        element.classList.add('lang-ja');
    } else if (isRTLText(text)) {
        element.classList.add('lang-rtl');
        heroHello?.classList.add('is-rtl');
    }
}

function renderGreeting(text, element, heroHello, langContainer) {
    applyLanguageClasses(text, element, heroHello);
    element.querySelector('.typewriter__text').textContent = text;
    langContainer.textContent = `(${texts[currentIndex].lang})`;
}

function typeText(text, element, callback) {
    let index = 0;

    const langContainer = document.getElementById('language-text');
    langContainer.textContent = `(${texts[currentIndex].lang})`;

    if (!text) {
        callback();
        return;
    }

    // Render the first character immediately to avoid an empty-state flicker
    // between erase completion and the next typing cycle.
    element.textContent = text.charAt(0);
    index = 1;

    function type() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            queue(type, typingSpeed);
        } else {
            queue(callback, delayBetweenTexts);
        }
    }

    if (index < text.length) {
        queue(type, typingSpeed);
    } else {
        queue(callback, delayBetweenTexts);
    }
}

function eraseText(element, callback) {
    let length = element.textContent.length;

    function erase() {
        if (length > 0) {
            element.textContent = element.textContent.substring(0, length - 1);
            length--;
            queue(erase, eraseSpeed);
        } else {
            callback();
        }
    }

    erase();
}

function startTypingAnimation() {
    const element = document.getElementById('welcome-text');
    const textNode = element?.querySelector('.typewriter__text');
    const langContainer = document.getElementById('language-text');
    const heroHello = element?.closest('.hero__hello');
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const toggle = document.getElementById('greeting-toggle');

    if (!element || !textNode || !langContainer) {
        return;
    }

    function cycleText() {
        const { text } = texts[currentIndex];
        heroHello?.classList.toggle('is-reduced', Boolean(reduceMotion?.matches));

        // Keep all greetings cycling without character-by-character motion.
        if (reduceMotion?.matches) {
            renderGreeting(text, element, heroHello, langContainer);
            queue(() => {
                currentIndex = (currentIndex + 1) % texts.length;
                cycleText();
            }, 6000);
        } else {
            textNode.textContent = '';
            langContainer.textContent = '';
            applyLanguageClasses(text, element, heroHello);

            typeText(text, textNode, () => {
                eraseText(textNode, () => {
                    currentIndex = (currentIndex + 1) % texts.length;
                    cycleText();
                });
            });
        }
    }

    if (toggle) {
        toggle.hidden = false;
        toggle.addEventListener('click', () => {
            isPaused = !isPaused;
            if (isPaused) {
                window.clearTimeout(activeTimer);
                remainingDelay = Math.max(0, remainingDelay - (performance.now() - scheduledAt));
            } else if (pendingCallback) {
                queue(pendingCallback, remainingDelay);
            }
            toggle.setAttribute('aria-pressed', String(isPaused));
            toggle.setAttribute('aria-label', isPaused ? 'Resume greetings' : 'Pause greetings');
            toggle.firstElementChild.textContent = isPaused ? '\u25b6' : '\u275a\u275a';
            heroHello?.classList.toggle('is-paused', isPaused);
        });
    }

    reduceMotion?.addEventListener('change', cycleText);
    cycleText();
}

document.addEventListener('DOMContentLoaded', () => {
    startTypingAnimation();
});
