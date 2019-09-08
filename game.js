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

    var SPARTAK = [300, 200, 300, 200, 150, 100, 150, 100, 150, 300, 100, 100, 100, 100, 150, 100, 200, 300, 120, 130, 120, 300];
    var MORTAL = [100, 200, 100, 200, 100, 200, 100, 200, 100, 100, 100, 100, 100, 200, 100, 200, 100, 200, 100, 200, 100, 100, 100, 100, 100, 200, 100, 200, 100, 200, 100, 200, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 50, 100, 800];
    var IMPERIAL = [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40, 500];

    function calculateDirection(startPoint, endPoint, threshold) {

        var tr = threshold || 30;
        var x = endPoint.x - startPoint.x;
        var y = endPoint.y - startPoint.y;

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

    var fifteen = (function () {
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
        var order = [];
        var movesCount = 0;
        var getElement = function (index) {
            return order[index];
        };
        var shuffle = function (array) {
            var counter = array.length;

            // While there are elements in the array
            while (counter > 0) {
                // Pick a random index
                var index = Math.floor(Math.random() * counter);

                // Decrease counter by 1
                counter--;

                // And swap the last element with it
                var temp = array[counter];
                array[counter] = array[index];
                array[index] = temp;
            }

            return array;
        };

        const getIndexesFromIndex = function (index) {
            const point = {};
            point.x = index % 4;
            point.y = Math.floor(index / 4);
            return point;
        };

        var direction = function (startPoint, endPoint) {
            var x = endPoint.x - startPoint.x;
            var y = endPoint.y - startPoint.y;
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

        var bigGo = function (dir, index) {
            var startPosition = getIndexesFromIndex(index);
            var holePoint = getIndexesFromIndex(hole);
            var toHoleDirection = direction(startPosition, holePoint);
            if (dir === toHoleDirection && toHoleDirection !== NONE) {
                return _doMagic(startPosition, holePoint, toHoleDirection);
            }
            return false;
        };

        var hole = 15;
        var isCompleted = function () {
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
            console.log(index + " " + index2);
            return index === index2;
        };

        const _go = function (direction) {
            if (!_canGo(direction)) {
                return false;
            }
            const index = hole + getIndexDiff(direction);
            swap(index, hole);
            hole = index;
            return true;
        };

        const go = function (direction) {
            const res = _go(direction);
            if (res) ++movesCount;
            return res;
        };
        var swap = function (i1, i2) {
            var t = order[i1];
            order[i1] = order[i2];
            order[i2] = t;
        };
        var solvable = function (a) {
            for (var kDisorder = 0, i = 1, len = a.length - 1; i < len; i++) {
                for (var j = i - 1; j >= 0; j--) {
                    if (a[j] > a[i]) {
                        ++kDisorder;
                    }
                }
            }
            return !(kDisorder % 2);
        };
        var reinit = function () {
            movesCount = 0;
            order = [];
            for (var i = 1; i < 16; ++i) {
                order.push(i);
            }
            // shuffle(order);
            order.push(0);
            hole = 15;
            // if (!solvable(order)) {
            // swap(0, 1);
            // }
            swap(14, 15);
            hole = 14;
        };
        var getMovesCount = function () {
            return movesCount;
        };
        reinit();
        return {go: go, bigGo: bigGo, isCompleted: isCompleted, getElement: getElement, getMovesCount: getMovesCount, canGo: canGo};

    })();

    var ongoingTouches = [];
    var startPositionText = "";
    let activeCell = null;


    function pointFromTouch(touch) {
        const point = {};
        point.x = touch.pageX || touch.clientX;
        point.y = touch.pageY || touch.clientY;
        return point;
    }

    const handleStart = function (evt) {
        evt.preventDefault();
        activeCell = evt.target;
        activeCell.style.backgroundColor= "blue";
        startPositionText = evt.target.textContent;

        const touches = evt.changedTouches;
        const start = pointFromTouch(touches[0]);
        ongoingTouches.push(start);
    };

    var getElementIndex = function (elem) {
        for (var i = 0; i < 16; ++i) {
            if (fifteen.getElement(i) === +elem) {
                return i;
            }
        }
        return -1;
    };

    var handleEnd = function (evt) {
        if (ongoingTouches.length < 1) {
            return;
        }
        evt.preventDefault();
        var touches = evt.changedTouches;

        var end = pointFromTouch(touches[touches.length - 1]);
        var start = ongoingTouches[0];

        var direction = calculateDirection(start, end);
        if (fifteen.bigGo(direction, getElementIndex(startPositionText))) {
            drawAndCheck();
        }
        if (activeCell) {
            activeCell.style.transform = "translate(0px)";
            activeCell.style.backgroundColor = "";
        }
        activeCell = null;
        ongoingTouches = [];
    };

    function log(msg) {
        var p = document.getElementById('log');
        if (p) {
            p.innerHTML = msg + "\n" + p.innerHTML;
        }
        console.log(msg)
    }


    var box = document.body.appendChild(document.createElement('div'));
    box.className = "box";
    var log1 = document.body.appendChild(document.createElement('div'));
    log1.setAttribute("id", "log");

    for (let i = 0; i < 16; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        box.appendChild(cell);
    }

    const iconChanger = function () {
        var canvas = document.createElement('canvas');
        var link = document.getElementById('favicon');
        canvas.height = canvas.width = 16; // set the size
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000';

        const changeBage = function (num) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillText(fifteen.getMovesCount(), 2, 12);
            link.href = canvas.toDataURL('image/png');
        };
        return {changeBage: changeBage}
    }();


    function draw() {
        for (let i = 0, tile;  i < 16; i++) {
            const tile = box.childNodes[i];
            const val = fifteen.getElement(i);
            tile.textContent = val;
            if (val) {
                tile.className = 'cell';
            } else {
                tile.className = 'cell hole';
            }
        }
    }

    function drawAndCheck() {
        draw();
        if (fifteen.isCompleted()) {
            box.style.backgroundColor = "red";
            navigator.vibrate(0);
            navigator.vibrate(SPARTAK);
        } else {
            navigator.vibrate(0);
            iconChanger.changeBage(fifteen.getMovesCount());
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
    
    function drag(e) {
        e.preventDefault();
        const p = pointFromTouch(e.touches[0]);
        const start = ongoingTouches[0];
        if (activeCell) {
            const distX = p.x - start.x;
            const distY = p.y - start.y;
            const dir = calculateDirection(start, p, 1);
            if (fifteen.canGo(dir, getElementIndex(startPositionText))) {
                log(distX);
                if (Math.abs(distX) >= Math.abs(distY)) {
                    activeCell.style.transform = "translateX(" + distX + "px)";
                } else {
                    activeCell.style.transform = "translateY(" + distY + "px)";
                }
            }
        }
    }

    function handleOrientation(event) {
        const y = event.gamma; // In degree in the range [-90,90]
        let res = false;
        if (y > 70) {
            res |= fifteen.bigGo(RIGHT, 0);
            res |= fifteen.bigGo(RIGHT, 4);
            res |= fifteen.bigGo(RIGHT, 8);
            res |= fifteen.bigGo(RIGHT, 12);
        }
        if (y < -70) {
            res |= fifteen.bigGo(LEFT, 3);
            res |= fifteen.bigGo(LEFT, 7);
            res |= fifteen.bigGo(LEFT, 11);
            res |= fifteen.bigGo(LEFT, 15);
        }
        if (res) {
            requestAnimationFrame(drawAndCheck);
        }
    }

    window.addEventListener('keydown', onKeyPress);
    box.addEventListener("touchstart", handleStart, false);
    box.addEventListener("touchend", handleEnd, false);
    box.addEventListener("touchmove", drag, false);
    window.addEventListener('deviceorientation', handleOrientation);


    drawAndCheck();
})(window, document);
