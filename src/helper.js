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
    switch (string.toLowerCase().trim()) {
    case "true": case "yes": case "1": return true;
    case "false": case "no": case "0": case null: return false;
    default: return Boolean(string);
    }
}

export function starter(window, document, settings, f) {
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

    if (__USE_SERVICE_WORKERS__) {
        if (settings.useServiceWorker && "serviceWorker" in navigator) {
            navigator.serviceWorker.register("./sw.js", {scope: "./"});
            install(window, document, settings);
        }
    }
    if (settings.useGamePad && navigator.getGamepads) {
        import("./gamepad.js").then(gamepad => {
            setTimeout(() => {
                gamepad.default.init();
            }, 500);

        });
    }
    f(window, document, settings);
}

export function initField(fieldSize, className, elem, document) {
    for (let i = 0; i < fieldSize; i++) {
        const cell = document.createElement("div");
        cell.className = className;
        elem.appendChild(cell);
    }
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
