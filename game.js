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

    const SPARTAK = [300, 200, 300, 200, 150, 100, 150, 100, 150, 300, 100, 100, 100, 100, 150, 100, 200, 300, 120, 130, 120, 300];
    const MORTAL = [100, 200, 100, 200, 100, 200, 100, 200, 100, 100, 100, 100, 100, 200, 100, 200, 100, 200, 100, 200, 100, 100, 100, 100, 100, 200, 100, 200, 100, 200, 100, 200, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 50, 100, 800];
    const IMPERIAL = [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40, 500];

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

    const fifteen = (function () {
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
        const _doMagic = function (startPosition, hole, direction) {
            const distance = Math.abs(hole.x - startPosition.x + hole.y - startPosition.y);
            let res = false;
            for (let i = 0; i < distance; ++i) {
                res |= _go(direction);
            }
            if (res) ++movesCount;
            return res;
        };

        const bigGo = function (dir, index) {
            const startPosition = getIndexesFromIndex(index);
            const holePoint = getIndexesFromIndex(hole);
            const toHoleDirection = direction(startPosition, holePoint);
            if (dir === toHoleDirection && toHoleDirection !== NONE) {
                return _doMagic(startPosition, holePoint, toHoleDirection);
            }
            return false;
        };

        let hole = 15;
        const isCompleted = function () {
            return !order.some(function (item, i) {
                return item > 0 && item - 1 !== i;
            });
        };

        const _canGo = function (direction) {
            if (!direction || direction === NONE) {
                return false;
            }
            const index = hole + getIndexDiff(direction);
            if (index < 0 || index > 15) {
                return false;
            }
            if (direction === LEFT || direction === RIGHT) {
                if (Math.floor(hole / 4) !== Math.floor(index / 4)) {
                    return false;
                }
            }
            return true;
        };

        const canGo = function (direction, index) {
            const index2 = hole + getIndexDiff(direction);
            return index === index2;
        };

        const canGo2 = function (dir, index) {
            const startPosition = getIndexesFromIndex(index);
            const holePoint = getIndexesFromIndex(hole);
            const toHoleDirection = direction(startPosition, holePoint);
            if (dir === toHoleDirection && toHoleDirection !== NONE) {
                return getActiveElements(index).length > 0;
            }
            return false;
        };


        const _go = function (direction) {
            if (!_canGo(direction)) {
                return false;
            }
            const index = hole + getIndexDiff(direction);
            swap(index, hole, order);
            hole = index;
            return true;
        };

        const go = function (direction) {
            const res = _go(direction);
            if (res) ++movesCount;
            return res;
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
        reinit(false);
        return {
            go: go,
            bigGo: bigGo,
            isCompleted: isCompleted,
            getElement: getElement,
            getMovesCount: getMovesCount,
            reinit: reinit,
            canGo: canGo2,
            getActiveElements: getActiveElements
        };

    })();

    let ongoingTouches = [];
    let startPositionText = "";
    let activeCell = null;


    function pointFromTouch(touch) {
        const point = {};
        point.x = touch.pageX || touch.clientX;
        point.y = touch.pageY || touch.clientY;
        return point;
    }

    const handleStart = function (evt) {
        evt.preventDefault();
        if (!evt.target.classList.contains('cell') || activeCell) {
            return;
        }
        activeCell = evt.target;
        activeCell.style.backgroundColor = "blue";
        startPositionText = evt.target.textContent;
        // log(fifteen.getActiveElements(getElementIndex(startPositionText)));

        const touches = evt.changedTouches;
        const start = pointFromTouch(touches[0]);
        ongoingTouches.push(start);
    };

    const getElementIndex = function (elem) {
        for (let i = 0; i < 16; ++i) {
            if (fifteen.getElement(i) === +elem) {
                return i;
            }
        }
        return -1;
    };

    function endMoving(activeCell) {
        activeCell.style.backgroundColor = "";
        activeCell.style.transform = "translate(0px)";
    }

    const handleEnd = function (evt) {
        if (activeCell) {
            endMoving(activeCell);
            for (let index of fifteen.getActiveElements(getElementIndex(startPositionText))) {
                endMoving(getCellByIndex(index));
            }
        }
        activeCell = null;
        if (ongoingTouches.length < 1) {
            return;
        }
        evt.preventDefault();
        const touches = evt.changedTouches;

        const end = pointFromTouch(touches[touches.length - 1]);
        const start = ongoingTouches[0];

        const direction = calculateDirection(start, end);
        if (fifteen.bigGo(direction, getElementIndex(startPositionText))) {
            drawAndCheck();
        }
        ongoingTouches = [];
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
    // box.className = "box";
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
        for (let i = 0, tile; i < 16; i++) {
            const tile = box.childNodes[i];
            const val = fifteen.getElement(i);
            tile.textContent = val;
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
            box.style.backgroundColor = "red";
            reload.className = "reload";
            navigator.vibrate(0);
            navigator.vibrate(SPARTAK);
        } else {
            navigator.vibrate(0);
            reload.className = "reload hidden";
            box.style.backgroundColor = "";
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
        if (fifteen.go(keyKodeToDirection(e.keyCode))) {
            drawAndCheck();
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
        const color = distX ? "green" : "";
        activeCell.style.backgroundColor = color;
        activeCell.style.transform = "translateX(" + maxTranslate(distX, height) + "px)";
    }

    function moveY(activeCell, distY) {
        const height = box.offsetHeight / 4;
        activeCell.style.backgroundColor = "purple";
        activeCell.style.transform = "translateY(" + maxTranslate(distY, height) + "px)";
    }


    function drag(e) {
        e.preventDefault();
        const p = pointFromTouch(e.touches[0]);
        if (activeCell) {
            const start = ongoingTouches[0];
            const distX = p.x - start.x;
            const distY = p.y - start.y;
            const dir = calculateDirection(start, p, 1);
            if (fifteen.canGo(dir, getElementIndex(startPositionText))) {
                if (HORIZONTAL.includes(dir)) {
                    for (let index of fifteen.getActiveElements(getElementIndex(startPositionText))) {
                        // log(dir + " " + distX + " " + distY);
                        moveX(getCellByIndex(index), distX);
                    }
                    // moveX(activeCell, distX);
                } else {
                    for (let index of fifteen.getActiveElements(getElementIndex(startPositionText))) {
                        moveY(getCellByIndex(index), distY);
                    }
                    // moveY(activeCell, distY);
                }
            } else {
                // moveX(activeCell, 0);
                for (let index of fifteen.getActiveElements(getElementIndex(startPositionText))) {
                    moveX(getCellByIndex(index), 0);
                }
            }
        }
    }

    function handleOrientation(event) {
        let y = event.gamma; // In degree in the range [-90,90]
        const orientation = window.screen.orientation.type;
        const str = "alpha " + event.alpha + " beta " + event.beta + " gamma " + event.gamma + " or " + orientation;
        log(str);
        if (orientation === "landscape-secondary") {
            y *= -1;
        }
        let res = false;
        if (y > 50) {
            res |= fifteen.bigGo(RIGHT, 0);
            res |= fifteen.bigGo(RIGHT, 4);
            res |= fifteen.bigGo(RIGHT, 8);
            res |= fifteen.bigGo(RIGHT, 12);
        }
        if (y < -50) {
            res |= fifteen.bigGo(LEFT, 3);
            res |= fifteen.bigGo(LEFT, 7);
            res |= fifteen.bigGo(LEFT, 11);
            res |= fifteen.bigGo(LEFT, 15);
        }
        if (res) {
            requestAnimationFrame(drawAndCheck);
        }
    }

    function reinitGame() {
        fifteen.reinit(true);
        drawAndCheck();
    }

    box.addEventListener("touchstart", handleStart, false);
    box.addEventListener("touchend", handleEnd, false);
    box.addEventListener("touchcancel", handleEnd, false);
    box.addEventListener("touchmove", drag, false);

    window.addEventListener('keydown', onKeyPress);
    window.addEventListener('deviceorientation', handleOrientation);

    reload.addEventListener("click", reinitGame, false);


    drawAndCheck();
})(window, document);
