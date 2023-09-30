"use strict";
export default function iconChanger (document) {
    const canvas = document.createElement("canvas");
    const link = document.getElementById("favicon");
    if (!link) {
        console.error("Can't find favicon");
    }
    canvas.height = canvas.width = 16; // set the size
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000";

    const changeBage = function (num) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillText(num, 2, 12);
        if (!link) {
            console.log("Can't find favicon");
            return;
        }
        link.href = canvas.toDataURL("image/png");
    };
    return {changeBage: changeBage};
}
