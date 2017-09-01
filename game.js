(function (window, document) {
    "use strict"; // jshint ;_;
    //Constants
    var LEFT = "left",
        RIGHT = "right",
        UP = "up",
        DOWN = "down",
        NONE = "none";

    function calculateDirection(startPoint, endPoint, treshhold) {

        var tr = treshhold || 30;
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

    function opositeDirection(direction) {
        if (direction === LEFT) {
            return RIGHT;
        }
        if (direction === RIGHT) {
            return LEFT;
        }
        if (direction === UP) {
            return DOWN;
        }
        if (direction === DOWN) {
            return UP;
        }
        return NONE;
    }


    var fifteen = {
        Move: {up: -4, left: -1, down: 4, right: 1},
        order: [],
        init: function () {
            for (var i = 1; i < 16; ++i) {
                fifteen.order.push(i);
            }
            fifteen.shuffle(fifteen.order);
            fifteen.order.push(0);
            if (!fifteen.solvable(fifteen.order)) {
                fifteen.swap(0, 1);
            }
        },
        shuffle: function (array) {
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
        },
        getElementIndex: function (elem) {
            for (var i = 0; i < 16; ++i) {
                if (fifteen.order[i] == elem) {
                    return i;
                }
            }
            return -1;
            // return fifteen.order.indexOf(elem + 0);
        },
        getIndexezFromIndex: function (index) {
            var point = {};
            point.x = index % 4;
            point.y = Math.floor(index / 4);
            return point;
        },
        direction: function (startPoint, endPoint) {
            var x = endPoint.x - startPoint.x;
            var y = endPoint.y - startPoint.y;

            if (Math.abs(x) > 0 && Math.abs(y) > 0) {
                return NONE;
            }
            if (Math.abs(x) > 0) {
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
        },
        _doMagic: function (startPosition, hole, direction) {
            var distance = Math.abs(hole.x - startPosition.x + hole.y - startPosition.y);
            for (var i = 0; i < distance; ++i) {
                fifteen.go(opositeDirection(direction));
            }
        },

        bigGo: function (direction, startPositionText) {
            var index = fifteen.getElementIndex(startPositionText);
            var startPosition = fifteen.getIndexezFromIndex(index);
            var indexHole = fifteen.getElementIndex(0);
            var holePoint = fifteen.getIndexezFromIndex(indexHole);

            var toHoleDirection = fifteen.direction(startPosition, holePoint);
            if (direction === toHoleDirection && toHoleDirection !== NONE) {
                fifteen._doMagic(startPosition, holePoint, toHoleDirection);
                // drawAndCheck();
                return true;
            }
            return false;
        },

        hole: 15,
        isCompleted: function () {
            return !this.order.some(function (item, i) {
                return item > 0 && item - 1 !== i;
            });
        },
        _go: function (move) {
            // console.log(move);
            var index = this.hole + move;
            if (index < 0 || index > 15) {
                // console.log("not go 1 " + index);
                return false;
            }
            if (move === fifteen.Move.left || move === fifteen.Move.right) {
                if (Math.floor(this.hole / 4) !== Math.floor(index / 4)) {
                    // console.log("not go 2 " + index);
                    return false;
                }
            }
            this.swap(index, this.hole);
            this.hole = index;
            return true;
        },
        go: function (direction) {
            if (!direction || direction === NONE) {
                return false;
            }
            return this._go(this.Move[direction]);
        },
        swap: function (i1, i2) {
            var t = this.order[i1];
            this.order[i1] = this.order[i2];
            this.order[i2] = t;
        },
        solvable: function (a) {
            for (var kDisorder = 0, i = 1, len = a.length - 1; i < len; i++) {
                for (var j = i - 1; j >= 0; j--) {
                    if (a[j] > a[i]) {
                        ++kDisorder;
                    }
                }
            }
            return !(kDisorder % 2);
        }
    };
    fifteen.init();


    var ongoingTouches = [];
    var startPositionText = "";

    function log(msg) {
        var p = document.getElementById('log');
        if (p) {
            p.innerHTML = msg + "\n" + p.innerHTML;
        }
        console.log(msg)
    }

    function pointFromTouch(touch) {
        var point = {};
        point.x = touch.pageX || touch.clientX;
        point.y = touch.pageY || touch.clientY;
        return point;
    }

    function handleStart(evt) {
        evt.preventDefault();
        startPositionText = evt.target.outerText;

        var touches = evt.changedTouches;
        var start = pointFromTouch(touches[0]);
        ongoingTouches.push(start);
    }

    function handleEnd(evt) {
        evt.preventDefault();
        var touches = evt.changedTouches;

        var end = pointFromTouch(touches[touches.length - 1]);
        var start = ongoingTouches[0];

        var direction = calculateDirection(start, end);
        if (fifteen.bigGo(direction, startPositionText)) {
            drawAndCheck();
        }
        ongoingTouches = [];
    }

    var box = document.body.appendChild(document.createElement('div'));
    for (var i = 0; i < 16; i++) box.appendChild(document.createElement('div'));


    function draw() {
        for (var i = 0, tile; tile = box.childNodes[i], i < 16; i++) {
            tile.textContent = fifteen.order[i];
            tile.style.visibility = fifteen.order[i] ? 'visible' : 'hidden';
        }
    }

    var onKeyPress = function (e) {
        var keyKodeToDirection = function (keyCode) {
            return {39: 'left', 37: 'right', 40: 'up', 38: 'down'}[keyCode];
        };
        if (fifteen.go(keyKodeToDirection(e.keyCode))) {
            drawAndCheck();
        }
    };

    function drawAndCheck() {
        draw();
        if (fifteen.isCompleted()) {
            box.style.backgroundColor = "red";
            window.removeEventListener('keydown', onKeyPress);
            box.removeEventListener("touchstart", handleStart);
            box.removeEventListener("touchend", handleEnd);
        }
    }

    window.addEventListener('keydown', onKeyPress);

    // box.addEventListener("touchmove", handleMove, false);
    box.addEventListener("touchstart", handleStart, false);
    box.addEventListener("touchend", handleEnd, false);

    drawAndCheck();
})(window, document);