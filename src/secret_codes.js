"use strict";
function toggleSettings(idx, settings) {
    const key = typeof idx === "number" ? Object.keys(settings)[idx] : idx;
    if (!key) {
        return;
    }
    const prop = settings[key];
    if (prop == null) {
        return;
    }
    settings[key] = !prop;
}

function switchHighlight(settings) {
    toggleSettings("useActiveHighlight", settings);
    toggleSettings("useMovingHighlight", settings);
}

export default function codeHandler(settings, reinitGame) {
    let currentCode = [];

    const codeMap = {
        "777": function () {
            settings.useRandomInit = false;
            reinitGame();
        },
        "222": () => switchHighlight(settings),
        "555": reinitGame
    };

    const addElem = function (elem) {
        if (currentCode.length < 10) {
            currentCode.push(elem);
        }
    };

    const execute = function () {
        const str = currentCode.join("");
        if (str.indexOf("111") === 0) {
            const idx = parseInt(str.substr(3), 10);
            toggleSettings(idx - 1, settings);
        } else {
            const f = codeMap[str];
            if (f) {
                f();
            }
        }
        currentCode = [];
    };
    return {
        addElem: addElem,
        execute: execute
    }
};
