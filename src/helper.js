"use strict";
import {DOWN, LEFT, RIGHT, UP, NONE} from "./core.js";

function install(window, document, settings) {
    const btnAdd = document.getElementById("butInstall");
    let deferredPrompt;
    btnAdd.addEventListener("click", (e) => {
        e.preventDefault();
        // hide our user interface that shows our A2HS button
        // btnAdd.setAttribute('disabled', true);
        btnAdd.classList.add("hidden");
        // Show the prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((resp) => {
            console.log(JSON.stringify(resp));
        });
    });

    window.addEventListener("beforeinstallprompt", (e) => {
        // Prevent the mini-info bar from appearing.
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Update UI notify the user they can add to home screen
        // btnAdd.removeAttribute('disabled');
        if (settings && settings.showInstall) {
            btnAdd.classList.remove("hidden");
        }
    });
}

function stringToBoolean(string) {
    switch(string.toLowerCase().trim()){
    case "true": case "yes": case "1": return true;
    case "false": case "no": case "0": case null: return false;
    default: return Boolean(string);
    }
}

function starter(window, document, settings, f) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    for (const [key, value] of urlParams) {
        if (typeof settings[key] === "number") {
            settings[key] = parseInt(value, 10);
        } else if (typeof settings[key] === "boolean") {
            settings[key] = stringToBoolean(value);
        } else {
            settings[key] = value;
        }
    }
    // eslint-disable-next-line no-undef
    if (__USE_SERVICE_WORKERS__) {
        if (settings.useServiceWorker && "serviceWorker" in navigator) {
            navigator.serviceWorker.register("./sw.js", {scope: "./"});
            install(window, document, settings);
        }
    }
    if (settings.useGamePad && navigator.getGamepads) {
        import("./gamepad.js").then(gamepad => {
            setTimeout(function () {
                gamepad.default.init();
            }, 500);

        });
    }
    f(window, document, settings);
}

function launch(f, window, document, settings, afterUrlParse) {
    if (document.readyState !== "loading") {
        f(window, document, settings, afterUrlParse);
    } else {
        document.addEventListener("DOMContentLoaded", function () {
            f(window, document, settings, afterUrlParse);
        });
    }
}

export function launchWithUrlParse(window, document, settings, afterUrlParse) {
    launch(starter, window, document, settings, afterUrlParse);
}

export const playSound = (elem) => {
    if (!elem) return;
    elem.play();
};

function declOfNum(number, titles) {
    const cases = [2, 0, 1, 1, 1, 2];
    return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}

export function numAndDeclOfNum(number, titles) {
    return number + " " + declOfNum(number, titles);
}

export function initField(fieldSize, className, elem, document) {
    for (let i = 0; i < fieldSize; i++) {
        const cell = document.createElement("div");
        cell.className = className;
        elem.appendChild(cell);
    }
}

export function log(msg, document) {
    let p = document.getElementById("log");
    if (!p) {
        p = document.body.appendChild(document.createElement("div"));
        p.setAttribute("id", "log");
    }
    p.innerHTML = msg + "\n" + p.innerHTML;
    console.log(msg);
}

function pointFromTouch(touch) {
    const point = {};
    point.x = touch.pageX || touch.clientX;
    point.y = touch.pageY || touch.clientY;
    return point;
}

export function pointFromEvent(evt) {
    const touches = evt.changedTouches;
    const eventPointer = touches ? touches[0] : evt;
    return pointFromTouch(eventPointer);
}

export function keyToDirection(key) {
    switch (key) {
    case "ArrowLeft":
    case "KeyH":
    case "KeyA":
        return LEFT;
    case "ArrowRight":
    case "KeyL":
    case "KeyD":
        return RIGHT;
    case "ArrowUp":
    case "KeyK":
    case "KeyW":
        return UP;
    case "ArrowDown":
    case "KeyJ":
    case "KeyS":
        return DOWN;
    default:
        return NONE;
    }
}
