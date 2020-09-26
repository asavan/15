"use strict";
import "./game.css";

import settings from "./settings.js";
import gameFunction from "./game.js";
import {launchWithUrlParse} from "./helper.js";

launchWithUrlParse(window, document, settings, gameFunction);
