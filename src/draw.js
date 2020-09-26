"use strict";
import {pointFromEvent} from "./helper";
import {HORIZONTAL} from "./core";

function maxTranslate(maxOffset, offset) {
    if (maxOffset >= 0) {
        return Math.min(maxOffset, offset);
    }
    return Math.max(maxOffset, -offset);
}

export function moveX(activeCell, distX, box, settings) {
    const width = box.offsetWidth / 4;
    if (settings.useMovingHighlight) {
        activeCell.style.backgroundColor = "green";
    }
    activeCell.style.transform = "translateX(" + maxTranslate(distX, width) + "px)";
}

export function moveY(activeCell, distY, box, settings) {
    const height = box.offsetHeight / 4;
    if (settings.useMovingHighlight) {
        activeCell.style.backgroundColor = "purple";
    }
    activeCell.style.transform = "translateY(" + maxTranslate(distY, height) + "px)";
}

function showCount(fifteen, iconChanger, settings) {
    if (fifteen.getMovesCount() <= 0) {
        return;
    }
    if (settings.useIconChanger) {
        iconChanger.changeBage(fifteen.getMovesCount());
    }
    if (settings.useBageChanger && navigator.setAppBadge) {
        navigator.setAppBadge(fifteen.getMovesCount());
    }
    if (settings.useTitleChanger) {
        if (fifteen.getMovesCount() > 0) {
            document.title = fifteen.getMovesCount();
        }
    }
}

export function getCellByIndex(i, box) {
    return box.childNodes[i];
}

export function draw(box, fifteen, iconChanger, settings) {
    for (let i = 0; i < 16; i++) {
        const tile = getCellByIndex(i, box);
        const val = fifteen.getElement(i);
        tile.textContent = val;
        tile.style.backgroundColor = "";
        tile.style.transform = "";
        tile.style.transition = "";
        if (val) {
            tile.className = 'cell';
        } else {
            tile.className = 'cell hole';
        }
    }
    showCount(fifteen, iconChanger, settings);
}
