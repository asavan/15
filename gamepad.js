(function (window, document) {
    var gamepadSupport = {

        directions: {
            LEFT: "left",
            RIGHT: "right",
            UP: "up",
            DOWN: "down",
            RESTART: "restart"
        },
        stateToKeyCodeMap_: {
            left: 37,
            right: 39,
            up: 38,
            down: 40,
            restart: 84
        },

        BUTTONS: {
            FACE_1: 0, // Face (main) buttons
            FACE_2: 1,
            FACE_3: 2,
            FACE_4: 3,
            LEFT_SHOULDER: 4, // Top shoulder buttons
            RIGHT_SHOULDER: 5,
            LEFT_SHOULDER_BOTTOM: 6, // Bottom shoulder buttons
            RIGHT_SHOULDER_BOTTOM: 7,
            SELECT: 8,
            START: 9,
            LEFT_ANALOGUE_STICK: 10, // Analogue sticks (if depressible)
            RIGHT_ANALOGUE_STICK: 11,
            PAD_TOP: 12, // Directional (discrete) pad
            PAD_BOTTOM: 13,
            PAD_LEFT: 14,
            PAD_RIGHT: 15
        },

        AXES: {
            LEFT_ANALOGUE_HOR: 0,
            LEFT_ANALOGUE_VERT: 1,
            RIGHT_ANALOGUE_HOR: 2,
            RIGHT_ANALOGUE_VERT: 3
        },

        AXIS_THRESHOLD: .75,

        stickMoved_: function (pad, axisId, negativeDirection) {
            if (typeof pad.axes[axisId] == 'undefined') {
                return false;
            } else if (negativeDirection) {
                return pad.axes[axisId] < -gamepadSupport.AXIS_THRESHOLD;
            } else {
                return pad.axes[axisId] > gamepadSupport.AXIS_THRESHOLD;
            }
        },
        buttonPressed_ : function(pad, buttonId) {
            return pad.buttons[buttonId] && pad.buttons[buttonId].pressed;
                // (pad.buttons[buttonId] > gamepad.ANALOGUE_BUTTON_THRESHOLD);
        },
        // A number of typical buttons recognized by Gamepad API and mapped to
        // standard controls. Any extraneous buttons will have larger indexes.
        TYPICAL_BUTTON_COUNT: 16,

        // A number of typical axes recognized by Gamepad API and mapped to
        // standard controls. Any extraneous buttons will have larger indexes.
        TYPICAL_AXIS_COUNT: 4,

        // Whether we’re requestAnimationFrameing like it’s 1999.
        ticking: false,

        // Previous timestamps for gamepad state; used in Chrome to not bother with
        // analyzing the polled data if nothing changed (timestamp is the same
        // as last time).
        prevTimestamps: [],

        /**
         * Initialize support for Gamepad API.
         */
        init: function () {
            var gamepadSupportAvailable = navigator.getGamepads;

            if (!gamepadSupportAvailable) {
                console.log("No gamepads");
            } else {
                // Check and see if gamepadconnected/gamepaddisconnected is supported.
                // If so, listen for those events and don't start polling until a gamepad
                // has been connected.
                if ('ongamepadconnected' in window) {
                    window.addEventListener('gamepadconnected',
                        gamepadSupport.onGamepadConnect, false);
                    window.addEventListener('gamepaddisconnected',
                        gamepadSupport.onGamepadDisconnect, false);
                } else {
                    // If connection events are not supported just start polling
                    console.log("Start polling");
                    gamepadSupport.startPolling();
                }
            }
        },

        /**
         * React to the gamepad being connected.
         */
        onGamepadConnect: function (event) {
            // Start the polling loop to monitor button changes.
            gamepadSupport.startPolling();
        },

        /**
         * React to the gamepad being disconnected.
         */
        onGamepadDisconnect: function (event) {
            var gamepads = gamepadSupport.pollGamepads();

            // If no gamepads are left, stop the polling loop.
            if (gamepads.length === 0) {
                gamepadSupport.stopPolling();
            }
        },

        /**
         * Starts a polling loop to check for gamepad state.
         */
        startPolling: function () {
            // Don’t accidentally start a second loop, man.
            if (!gamepadSupport.ticking) {
                gamepadSupport.ticking = true;
                gamepadSupport.tick();
            }
        },

        /**
         * Stops a polling loop by setting a flag which will prevent the next
         * requestAnimationFrame() from being scheduled.
         */
        stopPolling: function () {
            gamepadSupport.ticking = false;
        },

        /**
         * A function called with each requestAnimationFrame(). Polls the gamepad
         * status and schedules another poll.
         */
        tick: function () {
            gamepadSupport.pollStatus();
            gamepadSupport.scheduleNextTick();
        },

        scheduleNextTick: function () {
            // setTimeout(function () {


            // Only schedule the next frame if we haven’t decided to stop via
            // stopPolling() before.
            if (gamepadSupport.ticking) {
                if (window.requestAnimationFrame) {
                    window.requestAnimationFrame(gamepadSupport.tick);
                } else {
                    setTimeout(gamepadSupport.tick, 1000);
                }
                // Note lack of setTimeout since all the browsers that support
                // Gamepad API are already supporting requestAnimationFrame().
            }
            // }, 200);
        },

        /**
         * Checks for the gamepad status. Monitors the necessary data and notices
         * the differences from previous state (buttons for Chrome/Firefox,
         * new connects/disconnects for Chrome). If differences are noticed, asks
         * to update the display accordingly. Should run as close to 60 frames per
         * second as possible.
         */
        pollStatus: function () {
            // Poll to see if gamepads are connected or disconnected. Necessary
            // only on Chrome.
            var gamepads = gamepadSupport.pollGamepads();

            for (var i = 0; i < gamepads.length; i++) {
                var gamepad = gamepads[i];

                // Don’t do anything if the current timestamp is the same as previous
                // one, which means that the state of the gamepad hasn’t changed.
                // This is only supported by Chrome right now, so the first check
                // makes sure we’re not doing anything if the timestamps are empty
                // or undefined.
                if (gamepad.timestamp &&
                    (gamepad.timestamp === gamepadSupport.prevTimestamps[i])) {
                    continue;
                }
                gamepadSupport.prevTimestamps[i] = gamepad.timestamp;

                gamepadSupport.updateDisplay(gamepad);
            }
        },

        // This function is called only on Chrome, which does not yet support
        // connection/disconnection events, but requires you to monitor
        // an array for changes.
        pollGamepads: function () {
            var gamepads = [];
            var rawGamepads = navigator.getGamepads();
            if (rawGamepads) {
                // We don’t want to use rawGamepads coming straight from the browser,
                // since it can have “holes” (e.g. if you plug two gamepads, and then
                // unplug the first one, the remaining one will be at index [1]).
                for (var i = 0; i < rawGamepads.length; i++) {
                    var currGamePad = rawGamepads[i];
                    if (currGamePad) {
                        if (currGamePad.buttons.length >= 10) {
                            gamepads.push(currGamePad);
                        }
                    }
                }
            }
            return gamepads;
        },

        updateDisplay: function (gamepad) {
            var state;
            var vibrControllers = gamepad.hapticActuators;
            if (vibrControllers && vibrControllers[0]) {
                vibrControllers[0].pulse(1, 200);
            }
            if (gamepadSupport.buttonPressed_(gamepad, gamepadSupport.BUTTONS.PAD_LEFT) ||
                gamepadSupport.stickMoved_(gamepad, gamepadSupport.AXES.LEFT_ANALOGUE_HOR, true) ||
                gamepadSupport.stickMoved_(gamepad, gamepadSupport.AXES.RIGHT_ANALOGUE_HOR, true)) {
                state = gamepadSupport.directions.LEFT;
            } else if (gamepadSupport.buttonPressed_(gamepad, gamepadSupport.BUTTONS.PAD_RIGHT) ||
                gamepadSupport.stickMoved_(gamepad, gamepadSupport.AXES.LEFT_ANALOGUE_HOR, false) ||
                gamepadSupport.stickMoved_(gamepad, gamepadSupport.AXES.RIGHT_ANALOGUE_HOR, false)) {
                state = gamepadSupport.directions.RIGHT;
            } else if (gamepadSupport.buttonPressed_(gamepad, gamepadSupport.BUTTONS.PAD_BOTTOM) ||
                gamepadSupport.stickMoved_(gamepad, gamepadSupport.AXES.LEFT_ANALOGUE_VERT, false) ||
                gamepadSupport.stickMoved_(gamepad, gamepadSupport.AXES.RIGHT_ANALOGUE_VERT, false)) {
                state = gamepadSupport.directions.DOWN;
            } else if (gamepadSupport.buttonPressed_(gamepad, gamepadSupport.BUTTONS.PAD_TOP) ||
                gamepadSupport.stickMoved_(gamepad, gamepadSupport.AXES.LEFT_ANALOGUE_VERT, true) ||
                gamepadSupport.stickMoved_(gamepad, gamepadSupport.AXES.RIGHT_ANALOGUE_VERT, true)) {
                state = gamepadSupport.directions.UP;
            } else if (gamepad.buttons[gamepadSupport.BUTTONS.START].pressed) {
                document.location.reload();
                return;
            } else {
                // console.log(gamepad.buttons);
                // console.log(gamepad.axes);
                return;
            }
            var event = document.createEvent('Event');
            var eventName = 'keydown';
            event.initEvent(eventName, true, true);
            event.keyCode = gamepadSupport.stateToKeyCodeMap_[state];
            window.dispatchEvent(event);
        }
    };


    setTimeout(function () {
        gamepadSupport.init();
    }, 500);
})(window, document);