(function (window, document) {
    "use strict"; // jshint ;_;
    //Constants
    var LEFT = "left",
        RIGHT = "right",
        UP = "up",
        DOWN = "down",
        NONE = "";

    var SPARTAK = [300,200,300,200,150,100,150,100,150,300,100,100,100,100,150,100,200,300,120,130,120,300];
    var MORTAL = [100, 200, 100, 200, 100, 200, 100, 200, 100, 100, 100, 100, 100, 200, 100, 200, 100, 200, 100, 200, 100, 100, 100, 100, 100, 200, 100, 200, 100, 200, 100, 200, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 50, 100, 800];
    var IMPERIAL = [500,110,500,110,450,110,200,110,170,40,450,110,200,110,170,40,500];
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
        var movesCount = 0;
        var getElement = function(index) {
          return order[index];
        };
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

        var getIndexesFromIndex = function (index) {
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
            var res = false;
            for (var i = 0; i < distance; ++i) {
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
        var _go = function (direction) {
            if (!direction || direction === NONE) {
                return false;
            }
            var index = hole + getIndexDiff(direction);
            if (index < 0 || index > 15) {
                return false;
            }
            if (direction === LEFT || direction === RIGHT) {
                if (Math.floor(hole / 4) !== Math.floor(index / 4)) {
                    return false;
                }
            }
            swap(index, hole);
            hole = index;
            return true;
        };
        var go = function (direction) {
            var res = _go(direction);
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
        var reinit =  function () {
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
			swap(15, 16);
        };
        var getMovesCount = function () {
            return movesCount;
        }
        reinit();
        return {go: go, bigGo : bigGo, isCompleted: isCompleted, getElement: getElement, getMovesCount: getMovesCount};

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

    var handleStart = function (evt) {
        evt.preventDefault();
        startPositionText = evt.target.textContent;

        var touches = evt.changedTouches;
        var start = pointFromTouch(touches[0]);
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

    var handleEnd = function(evt) {
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
        ongoingTouches = [];
    };


    var box = document.body.appendChild(document.createElement('div'));
	box.className = "box";
    for (var i = 0; i < 16; i++) {
        var cell = document.createElement('div');
        box.appendChild(cell);
        if (i === 12) {
            cell.addEventListener("click", function() {
                var res = navigator.vibrate(IMPERIAL);
                console.log(res);
            });
        }
    }

    var canvas = document.createElement('canvas'),
        link = document.getElementById('favicon');
          canvas.height = canvas.width = 16; // set the size
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000';


    function draw() {
        for (var i = 0, tile; tile = box.childNodes[i], i < 16; i++) {
            var val = fifteen.getElement(i);
            tile.textContent = val;
            tile.style.visibility = val ? 'visible' : 'hidden';
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillText(fifteen.getMovesCount(), 2, 12);
        link.href = canvas.toDataURL('image/png');
    }

    function drawAndCheck() {
        draw();
        if (fifteen.isCompleted()) {
            box.style.backgroundColor = "red";
            navigator.vibrate(0);
			navigator.vibrate(SPARTAK);
        } else {
            navigator.vibrate(0);
            box.style.backgroundColor = "";
        }
    }

    function onKeyPress(e) {
        // e.preventDefault();
        var keyKodeToDirection = function (keyCode) {
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
	
	function handleOrientation(event) {
  var x = event.beta;  // In degree in the range [-180,180]
  var y = event.gamma; // In degree in the range [-90,90]

  console.log( "beta : " + x + "\n");
  console.log( "gamma: " + y + "\n");
  if (x > 40) {
	  fifteen.bigGo(RIGHT, 0);
	  fifteen.bigGo(RIGHT, 4);
	  fifteen.bigGo(RIGHT, 8);
	  fifteen.bigGo(RIGHT, 12);
  }
  if (x < -40) {
	  fifteen.bigGo(LEFT, 3);
	  fifteen.bigGo(RIGHT, 7);
	  fifteen.bigGo(RIGHT, 11);
	  fifteen.bigGo(RIGHT, 15);
  }
}

    window.addEventListener('keydown', onKeyPress);
    box.addEventListener("touchstart", handleStart, false);
    box.addEventListener("touchend", handleEnd, false);
	window.addEventListener('deviceorientation', handleOrientation);
	

    drawAndCheck();
})(window, document);
