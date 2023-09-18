"use strict";
import {DOWN, HORIZONTAL, LEFT, RIGHT, UP} from "./core.js";

const animationTime = 100;

function directionSign(direction) {
    if (direction === UP) {
        return -1;
    }
    if (direction === DOWN) {
        return 1;
    }
    if (direction === LEFT) {
        return -1;
    }
    if (direction === RIGHT) {
        return 1;
    }
    return 0;
}

function maxTranslate(maxOffset, offset) {
    if (maxOffset >= 0) {
        return Math.min(maxOffset, offset);
    }
    return Math.max(maxOffset, -offset);
}

function moveX(activeCell, distX, box, settings) {
    const width = box.offsetWidth / 4;
    if (settings.useMovingHighlight) {
        activeCell.style.backgroundColor = "green";
    }
    activeCell.style.transform = "translateX(" + maxTranslate(distX, width) + "px)";
}

function moveY(activeCell, distY, box, settings) {
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

function getCellByIndex(i, box) {
    return box.childNodes[i];
}

function draw(box, fifteen, iconChanger, settings) {
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

export function drawerFunc(box, reload, btnInstall, fifteen, iconChanger, songChooser, settings) {

    let wasWinning = false;
    function drawAndCheck() {
        draw(box, fifteen, iconChanger, settings);
        if (fifteen.isCompleted()) {
            box.classList.add("win");
            reload.classList.remove("hidden");
            btnInstall.classList.remove("hidden2");
            if (settings.useVibration) {
                wasWinning = true;
                navigator.vibrate(songChooser.getSong());
            }
        } else {
            if (settings.useVibration && wasWinning) {
                wasWinning = false;
                navigator.vibrate(0);
            }
            reload.classList.add("hidden");
            box.classList.remove("win");
        }
    }

    const moveActiveElements = function (distX, distY, startIndex, dir, fast) {
        for (let index of fifteen.getActiveElements(startIndex)) {
            const cell = getCellByIndex(index, box);
            if (HORIZONTAL.includes(dir)) {
                moveX(cell, distX, box, settings);
            } else {
                moveY(cell, distY, box, settings);
            }
            if (!fast) {
                cell.style.transition = "transform " + animationTime + "ms linear";
            }
        }
    };

    const animateGo = function (direction, startIndex) {
        if (!fifteen.canGo(direction, startIndex)) {
            return false;
        }
        if (settings.useSmoothAnimation) {
            moveActiveElements(box.offsetWidth / 4 * directionSign(direction),
                box.offsetHeight / 4 * directionSign(direction),
                startIndex,
                direction,
                false
            );
        }
        return fifteen.bigGo(direction, startIndex);
    };

    function drawWithAnimation() {
        if (settings.useSmoothAnimation) {
            setTimeout(drawAndCheck, animationTime);
        } else {
            requestAnimationFrame(drawAndCheck);
        }
    }

    return {
        animateGo: animateGo,
        drawWithAnimation: drawWithAnimation,
        moveActiveElements: moveActiveElements
    };
}
