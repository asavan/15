(function (window, document) {
    "use strict"; // jshint ;_;
    //Constants
    var LEFT = "left",
        RIGHT = "right",
        UP = "up",
        DOWN = "down",
        NONE = "";

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


    var fifteen = (function() {
        var getIndexDiff = function (direction) {
             if (direction === UP ) {
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
        var shuffle =  function (array) {
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
        var getElementIndex = function (elem) {
            for (var i = 0; i < 16; ++i) {
                if (order[i] === +elem) {
                    return i;
                }
            }
            return -1;
            // return fifteen.order.indexOf(elem + 0);
        };
        var getElement = function(index) {
          return order[index];
        };
        var getIndexezFromIndex = function (index) {
            var point = {};
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
        var _doMagic = function (startPosition, hole, direction) {
            var distance = Math.abs(hole.x - startPosition.x + hole.y - startPosition.y);
            for (var i = 0; i < distance; ++i) {
                go(direction);
            }
        };

        var bigGo = function (dir, startPositionText) {
            var index = getElementIndex(startPositionText);
            var startPosition = getIndexezFromIndex(index);
            var indexHole = getElementIndex(0);
            var holePoint = getIndexezFromIndex(indexHole);

            var toHoleDirection = direction(startPosition, holePoint);
            if (dir === toHoleDirection && toHoleDirection !== NONE) {
                _doMagic(startPosition, holePoint, toHoleDirection);
                return true;
            }
            return false;
        };

        var hole = 15;
        var isCompleted = function () {
            return !order.some(function (item, i) {
                return item > 0 && item - 1 !== i;
            });
        };
        var _go = function (direction) {
            var index = hole + getIndexDiff(direction);
            if (index < 0 || index > 15) {
                // console.log("not go 1 " + index);
                return false;
            }
            if (direction === LEFT || direction === RIGHT) {
                if (Math.floor(hole / 4) !== Math.floor(index / 4)) {
                    // console.log("not go 2 " + index);
                    return false;
                }
            }
            swap(index, hole);
            hole = index;
            return true;
        };
        var go = function (direction) {
            if (!direction || direction === NONE) {
                return false;
            }
            return _go(direction);
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
        var reinit =  function () {
            order = [];
            for (var i = 1; i < 16; ++i) {
                order.push(i);
            }
            shuffle(order);
            order.push(0);
            if (!solvable(order)) {
                swap(0, 1);
            }
        };
        reinit();
        return {go: go, bigGo : bigGo, isCompleted: isCompleted, getElement: getElement};

    })();

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
	box.className = "box";
    for (var i = 0; i < 16; i++) box.appendChild(document.createElement('div'));


    function draw() {
        for (var i = 0, tile; tile = box.childNodes[i], i < 16; i++) {
            var val = fifteen.getElement(i);
            tile.textContent = val;
            tile.style.visibility = val ? 'visible' : 'hidden';
        }
    }

    function drawAndCheck() {
        draw();
        if (fifteen.isCompleted()) {
            box.style.backgroundColor = "red";
            window.removeEventListener('keydown', onKeyPress);
            box.removeEventListener("touchstart", handleStart);
            box.removeEventListener("touchend", handleEnd);
			navigator.vibrate([500, 200, 500]);
        }
    }

    function onKeyPress(e) {
        // e.preventDefault();
        var keyKodeToDirection = function (keyCode) {
            log(keyCode);
            switch (keyCode) {
                case 37:
                case 72:
                    return LEFT;
                case 39:
                case 76:
                    return RIGHT;
                case 38:
                case 75:
                    return UP;
                case 40:
                case 74:
                    return DOWN;
                default:
                    return NONE;
            }
        };
        if (fifteen.go(keyKodeToDirection(e.keyCode))) {
            drawAndCheck();
        }
    }

    window.addEventListener('keydown', onKeyPress, {passive: true});
    box.addEventListener("touchstart", handleStart, false);
    box.addEventListener("touchend", handleEnd, false);

    drawAndCheck();
})(window, document);