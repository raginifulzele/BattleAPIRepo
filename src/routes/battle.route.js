const express = require("express");
const router = express.Router();

const battle_controller = require("../controllers/battle.controller");

// a simple test url to check that all of our files are communicating correctly.
router.get("/", battle_controller.test);

router.get("/list", battle_controller.battle_locations_list);

router.get("/search", battle_controller.battle_search);

router.get("/count", battle_controller.battle_count);

router.get("/stats", battle_controller.battle_stats);

module.exports = router;
