(function (window, document) {
    "use strict"; // jshint ;_;
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
        return {getSong: getRandomSong};
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
        reinit(true);
        return {
            go: go,
            bigGo: bigGo,
            isCompleted: isCompleted,
            getElement: getElement,
            getMovesCount: getMovesCount,
            reinit: reinit,
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

    function pointFromTouch(touch) {
        const point = {};
        point.x = touch.pageX || touch.clientX;
        point.y = touch.pageY || touch.clientY;
        return point;
    }

    const codeHandler = function () {
        let currentCode = [];

        const codeMap = {
            "314159": solvedInitGame,
            "27182": reinitGame
        };

        const addElem = function (elem) {
            currentCode.push(elem);
        };
        const execute = function () {
            const str = currentCode.join("");
            const f = codeMap[str];
            if (f) {
                f();
            }
            currentCode = [];
        };
        return {
            addElem: addElem,
            execute: execute
        }
    }();

    const handleStart = function (evt) {
        evt.preventDefault();
        if (!evt.target.classList.contains('cell') || activeCell) {
            return;
        }
        activeCell = evt.target;
        startIndex = getElementIndex(evt.target.textContent);

        const touches = evt.changedTouches;
        startPoint = pointFromTouch(touches[0]);
        prevPoint = startPoint;
        hasHiddenMove = false;

        const elem = fifteen.getElement(startIndex);
        if (elem !== 0) {
            activeCell.classList.add("active");
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
            return fifteen.bigGo(direction, startIndex);
        }
        return false;
    };

    const animateGoKeyboard = function (direction) {
        return animateGo(direction, fifteen.getHolePosition() + getIndexDiff(direction))
    };


    const handleEnd = function (evt) {
        if (!startPoint) {
            return;
        }
        evt.preventDefault();
        const p = pointFromTouch(evt.changedTouches[0]);
        const direction = calculateDirection(startPoint, p);
        animateGo(direction, startIndex);
        setTimeout(function () {
            drawAndCheck();
            startPoint = null;
            startIndex = null;
            activeCell = null;
            hasHiddenMove = false;
        }, animationTime);
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

    for (let i = 0; i < 16; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        box.appendChild(cell);
    }

    const iconChanger = function () {
        const canvas = document.createElement('canvas');
        const link = document.getElementById('favicon');
        canvas.height = canvas.width = 16; // set the size
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000';

        const changeBage = function (num) {
            if (fifteen.getMovesCount() <= 0) {
                return;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillText(fifteen.getMovesCount(), 2, 12);
            link.href = canvas.toDataURL('image/png');
        };
        return {changeBage: changeBage}
    }();


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
        iconChanger.changeBage(fifteen.getMovesCount());
    }

    function drawAndCheck() {
        draw();
        if (fifteen.isCompleted()) {
            box.classList.add("win");
            reload.classList.remove("hidden");
            navigator.vibrate(0);
            navigator.vibrate(songChooser.getSong());
        } else {
            navigator.vibrate(0);
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
            setTimeout(drawAndCheck, animationTime);
        }
    }

    function maxTranslate(dist, width) {
        if (dist >= 0) {
            return Math.min(dist, width);
        }
        return Math.max(dist, -width);
    }

    function getCellByIndex(i) {
        return box.childNodes[i];
    }

    function moveX(activeCell, distX) {
        const height = box.offsetWidth / 4;
        // activeCell.style.backgroundColor = distX ? "green" : "";
        activeCell.style.transform = "translateX(" + maxTranslate(distX, height) + "px)";
    }

    function moveY(activeCell, distY) {
        const height = box.offsetHeight / 4;
        // activeCell.style.backgroundColor = "purple";
        activeCell.style.transform = "translateY(" + maxTranslate(distY, height) + "px)";
    }

    const opositeDirection = function (dir1, dir2) {
        const index1 = getIndexDiff(dir1);
        const index2 = getIndexDiff(dir2);
        return index1 !== 0 && index1 === -index2;
    };


    function drag(e) {
        e.preventDefault();
        const p = pointFromTouch(e.touches[0]);
        if (activeCell) {
            const start = startPoint;
            const distX = p.x - start.x;
            const distY = p.y - start.y;
            const dir = calculateDirection(start, p, 5);
            const dirPrev = calculateDirection(prevPoint, p, 5);
            if (opositeDirection(dir, dirPrev)) {
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
        let y = event.gamma; // In degree in the range [-90,90]
//        const orientation = window.screen.orientation.type;
        if (event.beta > 90) {
            y *= -1;
        }
        let res = false;
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
        if (res) {
            setTimeout(drawAndCheck, animationTime);
        }
    }

    function reinitGame() {
        fifteen.reinit(true);
        drawAndCheck();
    }

    function solvedInitGame() {
        fifteen.reinit(false);
        drawAndCheck();
    }

    box.addEventListener("touchstart", handleStart, false);
    box.addEventListener("touchend", handleEnd, false);
    box.addEventListener("touchcancel", handleEnd, false);
    box.addEventListener("touchmove", drag, false);

    window.addEventListener('keydown', onKeyPress);
    window.addEventListener('deviceorientation', handleOrientation);

    reload.addEventListener("click", reinitGame, false);
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const isSolved = urlParams.get('solved');
    if (isSolved) {
        fifteen.reinit(false);
    }

    drawAndCheck();
})(window, document);
