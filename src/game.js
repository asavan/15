"use strict"; // jshint ;_;
import {initField, pointFromEvent, keyToDirection} from "./helper.js";
import iconChangerFunc from "./icon_changer.js";
import codeHandlerFunc from "./secret_codes.js";
import songChooserFunc from "./vibro.js";
import handleOrientationFunc from "./orientation.js";
import {drawerFunc} from "./draw.js";
import {getIndexDiff, logic, opositeDirection} from "./logic.js";
import {calculateDirection} from "./core.js";

export default function game(window, document, settings) {

    const songChooser = songChooserFunc(settings);
    const fifteen = logic(settings);

    let activeCell = null;
    let startPoint = null;
    let prevPoint = null;
    let startIndex = null;

    const codeHandler = codeHandlerFunc(settings, reinitGame);
    const getElementIndex = function (elem) {
        for (let i = 0; i < 16; ++i) {
            if (fifteen.getElement(i) === +elem) {
                return i;
            }
        }
        return -1;
    };

    const handleStart = function (evt) {
        evt.preventDefault();
        if (!evt.target.classList.contains("cell") || activeCell) {
            return;
        }
        activeCell = evt.target;
        startIndex = getElementIndex(evt.target.textContent);

        startPoint = pointFromEvent(evt);
        prevPoint = startPoint;

        const elem = fifteen.getElement(startIndex);
        if (elem !== 0) {
            if (settings.useActiveHighlight) {
                activeCell.classList.add("active");
            }
            codeHandler.addElem(elem);
        } else {
            codeHandler.execute();
        }
    };

    const handleEnd = function (evt) {
        if (!startPoint) {
            return;
        }
        evt.preventDefault();
        const p = pointFromEvent(evt);
        const direction = calculateDirection(startPoint, p);
        animateGo(direction, startIndex);
        startPoint = null;
        startIndex = null;
        activeCell = null;
        drawWithAnimation();
    };


    const box = document.getElementsByClassName("box")[0]; // document.body.appendChild(document.createElement('div'));
    const reload = document.getElementsByClassName("reload")[0];
    const btnInstall = document.getElementsByClassName("install")[0];


    initField(16, "cell", box, document);
    const iconChanger = iconChangerFunc(document);
    const drawer = drawerFunc(box, reload, btnInstall, fifteen, iconChanger, songChooser, settings);

    const animateGo = function (direction, startIndex) {
        return drawer.animateGo(direction, startIndex);
    };

    const animateGoKeyboard = function (direction) {
        return animateGo(direction, fifteen.getHolePosition() + getIndexDiff(direction));
    };

    function drawWithAnimation() {
        drawer.drawWithAnimation();
    }

    function onKeyPress(e) {
        // e.preventDefault();
        if (animateGoKeyboard(keyToDirection(e.code))) {
            drawWithAnimation();
        }
    }

    function drag(e) {
        e.preventDefault();
        if (!settings.useSlideAnimation) {
            return;
        }
        if (!activeCell) {
            return;
        }
        const p = pointFromEvent(e);
        const start = startPoint;
        const distX = p.x - start.x;
        const distY = p.y - start.y;
        const dir = calculateDirection(start, p, 5);
        const dirPrev = calculateDirection(prevPoint, p, 5);
        if (settings.useOnlyPushStrategy && opositeDirection(dir, dirPrev)) {
            const elems = fifteen.getActiveElements(startIndex);
            if (elems.length > 1) {
                animateGo(dir, elems[1]);
            }
        }
        if (fifteen.canGo(dir, startIndex)) {
            drawer.moveActiveElements(distX, distY, startIndex, dir, true);
            prevPoint = p;
        } else {
            activeCell.style.transform = "";
        }
    }

    function handleOrientation(event) {
        handleOrientationFunc(event, settings, drawWithAnimation, animateGo);
    }

    function reinitGame() {
        fifteen.reinit();
        drawWithAnimation();
    }

    function reinitGameRandom() {
        settings.useRandomInit = true;
        reinitGame();
    }

    box.addEventListener("touchstart", handleStart, false);
    box.addEventListener("touchend", handleEnd, false);
    box.addEventListener("touchcancel", handleEnd, false);
    box.addEventListener("touchmove", drag, false);


    box.addEventListener("mousedown", handleStart, false);
    box.addEventListener("mouseup", handleEnd, false);
    box.addEventListener("mouseleave", handleEnd, false);
    box.addEventListener("mousemove", drag, false);


    window.addEventListener("keydown", onKeyPress);
    window.addEventListener("deviceorientation", handleOrientation);

    reload.addEventListener("click", reinitGameRandom, false);
    drawWithAnimation();
}
