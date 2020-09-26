"use strict"; // jshint ;_;
export default function game(window, document, settings) {

    //Constants
    const LEFT = "left",
        RIGHT = "right",
        UP = "up",
        DOWN = "down",
        NONE = "";
    const HORIZONTAL = [LEFT, RIGHT];
    const VERTICAL = [UP, DOWN];


    const songChooser = function () {
        function randomItem(items) {
            return items[Math.floor(Math.random() * items.length)];
        }

        const SPARTAK = [300, 200, 300, 200, 150, 100, 150, 100, 150, 300, 100, 100, 100, 100, 150, 100, 200, 300, 120, 130, 120, 300];
        const MORTAL = [100, 200, 100, 200, 100, 200, 100, 200, 100, 100, 100, 100, 100, 200, 100, 200, 100, 200, 100, 200, 100, 100, 100, 100, 100, 200, 100, 200, 100, 200, 100, 200, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 50, 100, 800];
        const IMPERIAL = [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40, 500];

        const songs = [SPARTAK, MORTAL, IMPERIAL];

        const getRandomSong = function () {
            return randomItem(songs);
        };
        const getSong = function () {
            if (settings.useRandomSong) {
                return getRandomSong();
            }
            return SPARTAK;
        };
        return {getSong: getSong};
    }();

    function calculateDirection(startPoint, endPoint, threshold) {

        const tr = threshold || 30;
        const x = endPoint.x - startPoint.x;
        const y = endPoint.y - startPoint.y;

        if (Math.abs(x) + Math.abs(y) < tr) {
            return NONE;
        }

        if (Math.abs(x) > Math.abs(y)) {
            if (x < 0) {
                return LEFT;
            } else {
                return RIGHT;
            }
        } else {
            if (y < 0) {
                return UP;
            } else {
                return DOWN;
            }
        }
    }

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

    function pointFromTouch(touch) {
        const point = {};
        point.x = touch.pageX || touch.clientX;
        point.y = touch.pageY || touch.clientY;
        return point;
    }

    const switchHighlight = function () {
        settings.useActiveHighlight = !settings.useActiveHighlight;
        settings.useMovingHighlight = !settings.useMovingHighlight;
    };

    function toggleSettings(idx) {
        const key = Object.keys(settings)[idx];
        if (!key) {
            return;
        }
        const prop = settings[key];
        if (prop == null) {
            return;
        }
        settings[key] = !prop;
    }

    const codeHandler = function () {
        let currentCode = [];

        const codeMap = {
            "777": function () {
                settings.useRandomInit = false;
                reinitGame();
            },
            "222": switchHighlight,
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
                toggleSettings(idx - 1);
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
    }();

    const pointFromEvent = function (evt) {
        const touches = evt.changedTouches;
        const eventPointer = touches ? touches[0] : evt;
        return pointFromTouch(eventPointer);
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

    const getElementIndex = function (elem) {
        for (let i = 0; i < 16; ++i) {
            if (fifteen.getElement(i) === +elem) {
                return i;
            }
        }
        return -1;
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
                    let cell = getCellByIndex(index);
                    if (HORIZONTAL.includes(direction)) {
                        const height = box.offsetWidth / 4;
                        moveX(cell, height * directionSign(direction));
                    } else {
                        const height = box.offsetHeight / 4;
                        moveY(cell, height * directionSign(direction));
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

    function log(msg) {
        let p = document.getElementById('log');
        if (!p) {
            p = document.body.appendChild(document.createElement('div'));
            p.setAttribute("id", "log");
        }
        p.innerHTML = msg + "\n" + p.innerHTML;
        console.log(msg)
    }


    const box = document.getElementsByClassName("box")[0]; // document.body.appendChild(document.createElement('div'));
    const reload = document.getElementsByClassName("reload")[0];
    const btnInstall = document.getElementsByClassName('install')[0];


    for (let i = 0; i < 16; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        box.appendChild(cell);
    }

    const iconChanger = function () {
        const canvas = document.createElement('canvas');
        const link = document.getElementById('favicon');
        if (!link) {
            console.error("Can't find favicon");
        }
        canvas.height = canvas.width = 16; // set the size
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000';

        const changeBage = function (num) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillText(num, 2, 12);
            if (!link) {
                console.log("Can't find favicon");
                return;
            }
            link.href = canvas.toDataURL('image/png');
        };
        return {changeBage: changeBage}
    }();


    function showCount() {
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

    function draw() {
        for (let i = 0; i < 16; i++) {
            const tile = box.childNodes[i];
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
        showCount();
    }

    function drawAndCheck() {
        draw();
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
        const keyKodeToDirection = function (keyCode) {
            switch (keyCode) {
                case 37:
                case 72:
                case 65:
                    return LEFT;
                case 39:
                case 76:
                case 68:
                    return RIGHT;
                case 38:
                case 75:
                case 87:
                    return UP;
                case 40:
                case 74:
                case 83:
                    return DOWN;
                default:
                    return NONE;
            }
        };
        if (animateGoKeyboard(keyKodeToDirection(e.keyCode))) {
            drawWithAnimation();
        }
    }

    function maxTranslate(maxOffset, offset) {
        if (maxOffset >= 0) {
            return Math.min(maxOffset, offset);
        }
        return Math.max(maxOffset, -offset);
    }

    function getCellByIndex(i) {
        return box.childNodes[i];
    }

    function moveX(activeCell, distX) {
        const width = box.offsetWidth / 4;
        if (settings.useMovingHighlight) {
            activeCell.style.backgroundColor = "green";
        }
        activeCell.style.transform = "translateX(" + maxTranslate(distX, width) + "px)";
    }

    function moveY(activeCell, distY) {
        const height = box.offsetHeight / 4;
        if (settings.useMovingHighlight) {
            activeCell.style.backgroundColor = "purple";
        }
        activeCell.style.transform = "translateY(" + maxTranslate(distY, height) + "px)";
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
        const p = pointFromEvent(e);
        if (activeCell) {
            const start = startPoint;
            const distX = p.x - start.x;
            const distY = p.y - start.y;
            const dir = calculateDirection(start, p, 5);
            const dirPrev = calculateDirection(prevPoint, p, 5);
            if (settings.useOnlyPushStrategy && opositeDirection(dir, dirPrev)) {
                const elems = fifteen.getActiveElements(startIndex);
                if (elems.length > 1) {
                    hasHiddenMove = animateGo(dir, elems[1]);
                }
            }
            if (fifteen.canGo(dir, startIndex)) {
                for (let index of fifteen.getActiveElements(startIndex)) {
                    if (HORIZONTAL.includes(dir)) {
                        moveX(getCellByIndex(index), distX);
                    } else {
                        moveY(getCellByIndex(index), distY);
                    }
                }
                prevPoint = p;
            } else {
                activeCell.style.transform = "";
            }
        }
    }

    function handleOrientation(event) {
        if (!settings.useHorizontalOrientation && !settings.useVerticalOrientation) {
            return;
        }
        let y = event.gamma; // In degree in the range [-90,90]
//        const orientation = window.screen.orientation.type;
        if (event.beta > 90) {
            y *= -1;
        }
        let res = false;
        if (settings.useHorizontalOrientation) {
            if (y > 55) {
                for (let i = 0; i < 16; i += 4) {
                    res |= animateGo(RIGHT, i);
                }
            }
            if (y < -55) {
                for (let i = 3; i < 16; i += 4) {
                    res |= animateGo(LEFT, i);
                }
            }
        }
        let x = event.beta;
        if (settings.useVerticalOrientation) {
            if (x > 35) {
                for (let i = 0; i < 4; i += 1) {
                    res |= animateGo(DOWN, i);
                }
            }
            if (x < -35) {
                for (let i = 12; i < 16; i += 1) {
                    res |= animateGo(UP, i);
                }
            }
        }
        if (res) {
            drawWithAnimation();
        }
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
