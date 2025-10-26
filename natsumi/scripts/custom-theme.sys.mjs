/*

Natsumi Browser - Welcome to your personal internet.

Copyright (c) 2024-present Green (@greeeen-dev)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

import * as ucApi from "chrome://userchromejs/content/uc_api.sys.mjs";

export const colorPresetNames = {
    null: "Floating",
    "complementary": "Complementary",
    "split-complementary": "Split",
    "analogous": "Analogous",
    "triadic": "Triadic",
    "double-complementary": "Double",
    "tetradic": "Tetradic",
    "pentagonal": "Pentagonal",
    "hexagonal": "Hexagonal"
}

export const colorPresetOffsets = {
    "complementary": [0, 180],
    "split-complementary": [0, 150, 210],
    "analogous": [0, -30, 30],
    "triadic": [0, 120, 240],
    "double-complementary": [0, 60, 180, 240],
    "tetradic": [0, 90, 180, 270],
    "pentagonal": [0, 60, 150, 210, 300],
    "hexagonal": [0, 60, 120, 180, 240, 300]
}

export const colorPresetOrders = {
    "split-complementary": [1, 2, 0],
    "analogous": [1, 0, 2]
}

export const availablePresets = {
    2: ["complementary"],
    3: ["split-complementary", "analogous", "triadic"],
    4: ["double-complementary", "tetradic"],
    5: ["pentagonal"],
    6: ["hexagonal"]
}

// Structure
// {"type": ["css-func-name", "angle-override"]}
export const gradientTypes = {
    "linear": ["linear-gradient", null],
    "radial-cs": ["radial-gradient", "closest-side"],
    "radial-cc": ["radial-gradient", "closest-corner"],
    "radial-fs": ["radial-gradient", "farthest-side"],
    "radial-fc": ["radial-gradient", "farthest-corner"],
    "conic": ["conic-gradient", null]
}

export const gradientTypeNames = {
    "linear": "Linear",
    "radial-cs": "Radial (cs)",
    "radial-cc": "Radial (cc)",
    "radial-fs": "Radial (fs)",
    "radial-fc": "Radial (fc)",
    "conic": "Conic",
    "hybrid": "Hybrid"
}

export function customThemeLoader(data) {
    return data;
}

export function customColorLoader(data) {
    return data;
}

function parseHybridBackground(data) {
    let colors = data["colors"] ?? [];
    let colorCodes = [];
    let gradients = []

    // If there are 2 or less colors, default to linear
    if (colors.length <= 2) {
        return null;
    }

    colors.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
        }
        return 0;
    });

    for (const color of colors) {
        colorCodes.push(color.code);
    }

    if (colors.length === 3) {
        gradients.push(`radial-gradient(circle at 0% 0%, ${colorCodes[1]}, transparent)`);
        gradients.push(`radial-gradient(circle at 100% 0%, ${colorCodes[2]}, transparent)`);
        gradients.push(`linear-gradient(to top, ${colorCodes[0]}, transparent)`);
    } else {
        const isOdd = colors.length % 2 !== 0;
        const upperHalf = Math.floor(colors.length / 2);
        let lowerHalf = upperHalf;
        let index = 1;

        if (isOdd) {
            lowerHalf += 1;
        }

        for (let i = 0; i < upperHalf; i++) {
            gradients.push(`radial-gradient(circle at ${i * (100 / (upperHalf - 1))}% 0%, ${colorCodes[index]}, transparent)`);
            index++;

            if (index > colors.length - 1) {
                index = 0;
            }
        }

        for (let i = 0; i < lowerHalf; i++) {
            gradients.push(`radial-gradient(circle at ${100 - (i * (100 / (lowerHalf - 1)))}% 100%, ${colorCodes[index]}, transparent)`);
            index++;

            if (index > colors.length - 1) {
                index = 0;
            }
        }
    }

    return gradients.join(", ");
}

function parseColor(data) {
    // Example color data
    // {"code": "hsla(255, 100%, 50%, 1)", "angle": 255, "radius": 1, "value": 1, "opacity": 1, "order": 0}
    if (!data) {
        return null;
    }

    if (data.code) {
        return data.code;
    }
    return null;
}

function parseBackground(data) {
    // Example background data
    // {"type": "linear", "angle": 135, "preset": null, "colors": [
    //   {"code": "hsla(255, 100%, 50%, 1)", "angle": 255, "radius": 1, "value": 1, "opacity": 1, "order": 0},
    //   {"code": "hsla(300, 100%, 50%, 1)", "angle": 300, "radius": 1, "value": 1, "opacity": 1, "order": 1}
    // ]}

    let gradientType = "linear-gradient";
    const angle = ((data["angle"] ?? 0) + 180) % 360;
    const angleString = `${angle}deg`;
    let angleOverride = null;
    let colors = data["colors"] ?? [];
    let colorCodes = [];

    if (gradientTypes[data["type"]]) {
        gradientType = gradientTypes[data["type"]][0];
        angleOverride = gradientTypes[data["type"]][1];
    }

    if (colors.length === 0) {
        return null;
    }

    if (data["type"] === "hybrid") {
        angleOverride = "135deg"
        const hybridParsed = parseHybridBackground(data);

        if (hybridParsed) {
            return hybridParsed;
        }
    }

    colors.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
        }
        return 0;
    });

    for (const color of colors) {
        colorCodes.push(color.code);
    }

    if (data["type"] === "conic") {
        angleOverride = `from ${angleString}`;
    }

    if (!Array.isArray(colors) || colors.length === 0) {
        return "transparent";
    }

    return `${gradientType}(${angleOverride ?? angleString}, ${colorCodes.join(", ")})`;
}

function parseFilters(data) {
    // soon(tm)

    let filters = [];

    for (const [filter, value] of Object.entries(data)) {
        if (typeof value === "string" && value.length > 0) {
            filters.push(`${filter}(${value})`);
        }
    }

    if (filters.length === 0) {
        return "none";
    }

    return filters.join(" ");
}

// This function is not enabled because it does not work on other windows yet
export function applyCustomColor() {
    let customColorData = {};

    try {
        customColorData = JSON.parse(ucApi.Prefs.get("natsumi.theme.custom-color-data").value);
    } catch (e) {
        console.error("Invalid color data:", e);
        return;
    }

    let colorCode = parseColor(customColorData["color"]);

    ucApi.Windows.forEach((browserDocument, browserWindow) => {
        let head = browserDocument.head;

        // Remove existing inline style
        let existingStyle = head.querySelector("style[natsumi-custom-color]");
        if (existingStyle) {
            existingStyle.remove();
        }

        // Create new inline style
        if (colorCode) {
            let style = browserDocument.createElement("style");
            style.setAttribute("natsumi-custom-color", "");
            style.textContent = `
                @media -moz-pref("natsumi.theme.accent-color", "custom") {
                    * {
                        --natsumi-primary-color: ${colorCode} !important;
                    }
                }
            `;
            head.appendChild(style);
        }
    }, false);
}

export function applyCustomTheme() {
    let isCustomTheme = false;
    if (ucApi.Prefs.get("natsumi.theme.type").exists()) {
        isCustomTheme = ucApi.Prefs.get("natsumi.theme.type").value === "custom";
    }

    let customThemeData = {};

    // Example theme data
    // {"light": {"0": {
    //   "background": {"type": "linear", "angle": 135, "preset": null, "colors": [
    //     {"code": "hsla(255, 100%, 50%, 1)", "angle": 255, "radius": 1, "value": 1, "opacity": 1, "order": 0},
    //     {"code": "hsla(300, 100%, 50%, 1)", "angle": 300, "radius": 1, "value": 1, "opacity": 1, "order": 1}
    //   ]}
    // }}}

    try {
        customThemeData = JSON.parse(ucApi.Prefs.get("natsumi.theme.custom-theme-data").value);
    } catch (e) {
        console.error("Invalid theme data:", e);
        return;
    }

    ucApi.Windows.forEach((browserDocument, browserWindow) => {
        let body = browserDocument.body;

        for (let index in customThemeData["light"]) {
            let layerData = customThemeData["light"][index];

            if (layerData["background"]) {
                const backgroundValue = parseBackground(layerData["background"]);
                if (!backgroundValue) {
                    body.style.removeProperty(`--natsumi-theme-layer-${index}-background`);
                } else {
                    body.style.setProperty(`--natsumi-theme-layer-${index}-background`, backgroundValue);
                    }
            }
        }

        for (let index in customThemeData["dark"]) {
            let layerData = customThemeData["dark"][index];

            if (layerData["background"]) {
                const backgroundValue = parseBackground(layerData["background"]);
                if (!backgroundValue) {
                    body.style.removeProperty(`--natsumi-theme-layer-${index}-background-dark`);
                } else {
                    body.style.setProperty(`--natsumi-theme-layer-${index}-background-dark`, backgroundValue);
                }
            }
        }
    }, true);
}