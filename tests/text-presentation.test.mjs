import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const js = readFileSync(new URL("../script.js", import.meta.url), "utf8");

test("homepage arrows explicitly request text rather than emoji presentation", () => {
    const decoded = html.replace(/&#(x[0-9a-f]+|\d+);/gi, (_, value) =>
        String.fromCodePoint(value[0].toLowerCase() === "x"
            ? parseInt(value.slice(1), 16)
            : Number(value)));
    const arrows = new Set(["\u2935", "\u2197", "\u2192", "\u2191"]);
    let count = 0;
    for (let i = 0; i < decoded.length; i++) {
        if (arrows.has(decoded[i])) {
            assert.equal(decoded[i + 1], "\ufe0e", `Arrow U+${decoded.charCodeAt(i).toString(16)} lacks text presentation`);
            count++;
        }
    }
    assert.ok(count > 0, "Expected homepage arrows");
});

test("greeting resume icon explicitly requests text presentation", () => {
    assert.match(js, /\\u25b6\\ufe0e/i);
});
