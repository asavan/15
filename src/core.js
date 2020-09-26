export const LEFT = "left",
    RIGHT = "right",
    UP = "up",
    DOWN = "down",
    NONE = "";
export const HORIZONTAL = [LEFT, RIGHT];
export const VERTICAL = [UP, DOWN];

export function calculateDirection(startPoint, endPoint, threshold) {

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
