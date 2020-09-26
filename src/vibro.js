"use strict";
export default function songChooser(settings) {
    function randomItem(items) {
        return items[Math.floor(Math.random() * items.length)];
    }

    const SPARTAK = [300, 200, 300, 200, 150, 100, 150, 100, 150, 300, 100, 100, 100, 100, 150, 100, 200, 300, 120, 130, 120, 300];
    const MORTAL = [100, 200, 100, 200, 100, 200, 100, 200, 100, 100, 100, 100, 100, 200, 100, 200, 100, 200, 100, 200, 100, 100, 100, 100, 100, 200, 100, 200, 100, 200, 100, 200, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 50, 100, 800];
    const IMPERIAL = [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40, 500];

    const songs = [SPARTAK, MORTAL, IMPERIAL];

    const getRandomSong = function () {
        return randomItem(songs);
    };
    const getSong = function () {
        if (settings.useRandomSong) {
            return getRandomSong();
        }
        return SPARTAK;
    };
    return {getSong: getSong};
}
