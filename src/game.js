"use strict"; // jshint ;_;
import {initField, pointFromEvent, log, keyKodeToDirection} from './helper.js'
import iconChangerFunc from './icon_changer.js'
import codeHandlerFunc from './secret_codes.js'
import songChooserFunc from './vibro.js'
import handleOrientationFunc from './orientation.js'
import {moveX, moveY, draw, getCellByIndex} from './draw.js'
import {LEFT, RIGHT, DOWN, UP, HORIZONTAL, NONE, calculateDirection} from './core.js'

export default function game(window, document, settings) {

    const songChooser = songChooserFunc(settings);

    const getIndexDiff = function (direction) {
        if (direction === UP) {
            return 4;
        }
        if (direction === DOWN) {
            return -4;
        }
        if (direction === LEFT) {
            return 1;
        }
        if (direction === RIGHT) {
            return -1;
        }
        return 0;
    };

    const fifteen = (function () {
        let order = [];
        let movesCount = 0;
        const getElement = function (index) {
            return order[index];
        };
        const swap = function (i1, i2, array) {
            const t = array[i1];
            array[i1] = array[i2];
            array[i2] = t;
        };

        const shuffle = function (array) {
            let counter = array.length;

            // While there are elements in the array
            while (counter > 0) {
                // Pick a random index
                const index = Math.floor(Math.random() * counter);
                // Decrease counter by 1
                counter--;
                // And swap the last element with it
                swap(counter, index, array);
            }
            return array;
        };

        const getIndexesFromIndex = function (index) {
            const point = {};
            point.x = index % 4;
            point.y = Math.floor(index / 4);
            return point;
        };

        const direction = function (startPoint, endPoint) {
            const x = endPoint.x - startPoint.x;
            const y = endPoint.y - startPoint.y;
            if (x !== 0 && y !== 0) {
                return NONE;
            }
            return calculateDirection(startPoint, endPoint, 1);
        };

        const getHoleDirection = function (index) {
            const startPosition = getIndexesFromIndex(index);
            const holePoint = getIndexesFromIndex(hole);
            return direction(startPosition, holePoint);
        };

        const bigGo = function (dir, index) {
            if (dir === NONE) {
                return false;
            }
            if (index < 0 || index > 15) {
                return false;
            }
            const toHoleDirection = getHoleDirection(index);
            if (dir !== toHoleDirection) {
                return false;
            }
            const elems = getActiveElements(index);
            let res = false;
            for (let i = elems.length - 1; i >= 0; --i) {
                swap(elems[i], hole, order);
                hole = elems[i];
                res = true;
            }
            if (res) ++movesCount;
            return res;
        };

        let hole = 15;
        const isCompleted = function () {
            return !order.some(function (item, i) {
                return item > 0 && item - 1 !== i;
            });
        };

        const canGo = function (dir, index) {
            if (!dir || dir === NONE) {
                return false;
            }
            const toHoleDirection = getHoleDirection(index);
            if (dir !== toHoleDirection) {
                return false;
            }
            return getActiveElements(index).length > 0;
        };


        const go = function (direction) {
            return bigGo(direction, hole + getIndexDiff(direction));
        };

        const getActiveElements = function (index) {
            const startPosition = getIndexesFromIndex(index);
            const holePoint = getIndexesFromIndex(hole);
            const ans = [];
            if (startPosition.x === holePoint.x) {
                let lastIndex = index;
                let y = Math.abs(startPosition.y - holePoint.y);
                while (y > 0) {
                    ans.push(lastIndex);
                    lastIndex -= 4 * Math.sign(startPosition.y - holePoint.y);
                    --y;
                }
            } else if (startPosition.y === holePoint.y) {
                let lastIndex = index;
                let y = Math.abs(startPosition.x - holePoint.x);
                while (y > 0) {
                    ans.push(lastIndex);
                    lastIndex -= Math.sign(startPosition.x - holePoint.x);
                    --y;
                }
            }
            return ans;
        };

        const solvable = function (a) {
            let kDisorder = 0;
            for (let i = 1, len = a.length - 1; i < len; i++) {
                for (let j = i - 1; j >= 0; j--) {
                    if (a[j] > a[i]) {
                        ++kDisorder;
                    }
                }
            }
            return !(kDisorder % 2);
        };
        const reinit = function (needShuffle) {
            movesCount = 0;
            order = [];
            for (let i = 1; i < 16; ++i) {
                order.push(i);
            }
            if (needShuffle) {
                shuffle(order);
            }
            order.push(0);
            hole = 15;
            if (!solvable(order)) {
                swap(0, 1, order);
            }
            if (!needShuffle) {
                swap(14, 15, order);
                hole = 14;
            }

        };
        const getMovesCount = function () {
            return movesCount;
        };

        const getHolePosition = function () {
            return hole;
        };
        const publicReinit = function () {
            reinit(settings.useRandomInit);
        };
        publicReinit();
        return {
            go: go,
            bigGo: bigGo,
            isCompleted: isCompleted,
            getElement: getElement,
            getMovesCount: getMovesCount,
            reinit: publicReinit,
            canGo: canGo,
            getActiveElements: getActiveElements,
            getHolePosition: getHolePosition
        };

    })();

    let activeCell = null;
    let startPoint = null;
    let prevPoint = null;
    let startIndex = null;
    let hasHiddenMove = false;
    const animationTime = 100;
    let wasWinning = false;

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
        if (!evt.target.classList.contains('cell') || activeCell) {
            return;
        }
        activeCell = evt.target;
        startIndex = getElementIndex(evt.target.textContent);

        startPoint = pointFromEvent(evt);
        prevPoint = startPoint;
        hasHiddenMove = false;

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


    const animateGo = function (direction, startIndex) {
        if (fifteen.canGo(direction, startIndex)) {
            if (settings.useSmoothAnimation) {
                for (let index of fifteen.getActiveElements(startIndex)) {
                    const cell = getCellByIndex(index, box);
                    if (HORIZONTAL.includes(direction)) {
                        const width = box.offsetWidth / 4;
                        moveX(cell, width * directionSign(direction), box, settings);
                    } else {
                        const height = box.offsetHeight / 4;
                        moveY(cell, height * directionSign(direction), box, settings);
                    }
                    // cell.style.backgroundColor = "";
                    cell.style.transition = "transform " + animationTime + "ms linear";
                }
            }
            return fifteen.bigGo(direction, startIndex);
        }
        return false;
    };

    const animateGoKeyboard = function (direction) {
        return animateGo(direction, fifteen.getHolePosition() + getIndexDiff(direction))
    };


    function drawWithAnimation() {
        if (settings.useSmoothAnimation) {
            setTimeout(drawAndCheck, animationTime);
        } else {
            requestAnimationFrame(drawAndCheck);
        }
    }

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
        hasHiddenMove = false;
        drawWithAnimation();
    };


    const box = document.getElementsByClassName("box")[0]; // document.body.appendChild(document.createElement('div'));
    const reload = document.getElementsByClassName("reload")[0];
    const btnInstall = document.getElementsByClassName('install')[0];


    initField(16, 'cell', box, document);
    const iconChanger = iconChangerFunc(document);


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

    function onKeyPress(e) {
        // e.preventDefault();
        if (animateGoKeyboard(keyKodeToDirection(e.keyCode))) {
            drawWithAnimation();
        }
    }


    const opositeDirection = function (dir1, dir2) {
        const index1 = getIndexDiff(dir1);
        const index2 = getIndexDiff(dir2);
        return index1 !== 0 && index1 === -index2;
    };


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
            for (let index of fifteen.getActiveElements(startIndex)) {
                const cell = getCellByIndex(index, box);
                if (HORIZONTAL.includes(dir)) {
                    moveX(cell, distX, box, settings);
                } else {
                    moveY(cell, distY, box, settings);
                }
            }
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


    window.addEventListener('keydown', onKeyPress);
    window.addEventListener('deviceorientation', handleOrientation);

    reload.addEventListener("click", reinitGameRandom, false);
    drawWithAnimation();
}
