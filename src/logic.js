"use strict";
import {calculateDirection, DOWN, LEFT, NONE, RIGHT, UP} from "./core.js";
export function getIndexDiff(direction) {
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
}


export function opositeDirection(dir1, dir2) {
    const index1 = getIndexDiff(dir1);
    const index2 = getIndexDiff(dir2);
    return index1 !== 0 && index1 === -index2;
}

export function logic(settings) {
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
        if (res) {
            ++movesCount;
        }
        return res;
    };

    let hole = 15;
    const isCompleted = function () {
        return !order.some((item, i) => item > 0 && item - 1 !== i);
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

}
