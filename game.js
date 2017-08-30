var fifteen = {
    Move: {up: -4, left: -1, down: 4, right: 1},
    order: [],
    init: function () {
        for (var i = 1; i < 16; ++i) {
            fifteen.order.push(i);
        }
        fifteen.shuffle(fifteen.order);
        fifteen.order.push(0);
        if (!fifteen.solvable(fifteen.order)) fifteen.swap(0, 1);
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
    hole: 15,
    isCompleted: function () {
        return !this.order.some(function (item, i) {
            return item > 0 && item - 1 !== i;
        });
    },
    _go: function (move) {
        var index = this.hole + move;
        if (!this.order[index]) return false;
        if (move == fifteen.Move.left || move == fifteen.Move.right) {
            if (Math.floor(this.hole / 4) !== Math.floor(index / 4)) {
                return false;
            }
        }
        this.swap(index, this.hole);
        this.hole = index;
        return true;
    },
	go: function(direction) {
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
var box = document.body.appendChild(document.createElement('div'));
for (var i = 0; i < 16; i++) box.appendChild(document.createElement('div'));

window.addEventListener('keydown', function (e) {
    var keyKodeToDirection = function(keyCode) {
        return {39: 'left', 37: 'right', 40: 'up', 38: 'down'}[keyCode];
    }
    if (fifteen.go(keyKodeToDirection(e.keyCode))) {
        draw();
        if (fifteen.isCompleted()) {
            box.style.backgroundColor = "red";
            window.removeEventListener('keydown', arguments.callee);
        }
    }
});

function draw() {
    for (var i = 0, tile; tile = box.childNodes[i], i < 16; i++) {
        tile.textContent = fifteen.order[i];
        tile.style.visibility = fifteen.order[i] ? 'visible' : 'hidden';
    }
};
draw();
box.focus();