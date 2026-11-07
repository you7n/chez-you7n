import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const html = readFileSync(join(root, "index.html"), "utf8");
const css = readFileSync(join(root, "homepage.css"), "utf8");
const js = readFileSync(join(root, "script.js"), "utf8");

test("homepage has a visible Chez you7n masthead and intro copy", () => {
    assert.match(html, />\s*Chez you7n\s*</);
    assert.match(html, /Hi!\s*This is Chez you7n, where curiosity has a home\.\s*\^ \^/i);
});

test("homepage preserves the core sections and profile details", () => {
    for (const fragment of [
        "About",
        "Projects",
        "Tools",
        "Toys",
        "she/they, linguistics, languages, tech",
        "Brown '30"
    ]) {
        assert.match(html, new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
});

test("homepage preserves every required project and tool destination", () => {
    for (const url of [
        "https://blog.you7n.com/",
        "https://supersmest.you7n.com/",
        "https://voice-intent.you7n.com/",
        "https://80ol.you7n.com/",
        "https://geocaching.you7n.com/",
        "/kana2IPA",
        "https://hex.you7n.com/",
        "/speciesDetect"
    ]) {
        assert.match(html, new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
});

test("greeting animation keeps its multilingual set and timing", () => {
    for (const fragment of [
        "Hello",
        "你好",
        "こんにちは",
        "ئامانمۇسىز",
        "مرحبا",
        "ᎣᏏᏲ",
        "Ciallo~(∠·ω< )⌒★"
    ]) {
        assert.match(js, new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }

    assert.match(js, /const typingSpeed = 200/);
    assert.match(js, /const eraseSpeed = 100/);
    assert.match(js, /const delayBetweenTexts = 2000/);
});

test("homepage styles and script respect reduced motion preferences", () => {
    assert.match(css, /prefers-reduced-motion:\s*reduce/);
    assert.match(js, /prefers-reduced-motion/);
});

test("collage homepage has independent styles and a retro television greeting", () => {
    assert.match(html, /href="homepage\.css"/);
    assert.match(html, /class="[^"]*greeting-tv/);
    assert.match(html, /id="greeting-toggle"/);
    assert.doesNotMatch(html, /class="[^"]*(?:home-badge|scrap-grid|scrap-card)/);
});

test("all 31 original greeting entries and pronunciation labels are unchanged", () => {
    const list = js.slice(0, js.indexOf("\n\nlet currentIndex"));
    const fingerprint = createHash("sha256").update(list).digest("hex");
    assert.equal(fingerprint, "97921a1529a3afaf9dfa76e190513e3be49a27317df868ad5c6822a601c57e89");
    assert.equal((list.match(/\{ text:/g) || []).length, 31);
});

test("all original factual descriptions, dates and social destinations remain", () => {
    for (const fragment of [
        "Technical notes, troubleshooting logs, and explorations in linguistics and language.",
        "A concentration cell that generates electricity from the natural ion gradient between seawater and freshwater.",
        "An assistive application helping people with autism express emotions and communicate.",
        "An online Linguistics Olympiad organized by Glottologia.",
        "Turn your Geocaching finds into a map of visited Beijing subdistricts.",
        "Converts Japanese kana input into IPA transcriptions.",
        "A minimal clock where the current time is represented as a hexadecimal color value.",
        "An extremely sophisticated system for determining what species you are.",
        "Jul 2024", "Jan 2024", "Jul 2025", "Jun 2026",
        "Oct 2026", "Jun 2024", "Nov 2024", "Jan 2025",
        "https://github.com/MickeyYQA", "https://space.bilibili.com/513685692"
    ]) {
        assert.ok(html.includes(fragment), `Missing preserved content: ${fragment}`);
    }
});

test("greeting animation offers pause and retains cycling in reduced motion", () => {
    assert.match(js, /greeting-toggle/);
    assert.match(js, /addEventListener\(['"]change/);
    assert.doesNotMatch(js, /if \(reduceMotion\?\.matches\) \{[\s\S]*?return;/);
});

test("all local homepage assets exist and decoration does not intercept input", () => {
    const references = [
        ...Array.from(html.matchAll(/(?:src|href)="([^"]+)"/g), match => match[1]),
        ...Array.from(css.matchAll(/url\("([^"]+)"\)/g), match => match[1])
    ];
    for (const reference of references.filter(value => !/^(https?:|#|\/)/.test(value))) {
        assert.ok(existsSync(join(root, reference)), `Missing asset: ${reference}`);
    }
    assert.match(css, /pointer-events:\s*none/);
    assert.match(css, /:focus-visible/);
});
