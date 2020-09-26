"use strict";
import {LEFT, RIGHT, DOWN, UP} from './core.js'
export default function handleOrientation(event, settings, drawWithAnimation, animateGo) {
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
