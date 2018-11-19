const Battle = require("../models/battle.model");

exports.test = function(req, res) {
  console.log("Connection Tested!");
  res.send("Connection Tested!");
};

exports.battle_details = function(req, res) {
  Battle.findById(req.params.id, function(err, product) {
    if (err) return next(err);
    res.send(product);
  });
};

exports.battle_locations_list = function(req, res) {
  Battle.find().distinct("location", function(err, locations) {
    if (err) return next(err);
    res.send(locations);
  });
};

exports.battle_count = function(req, res) {
  Battle.find().exec(function(err, results) {
    if (err) return next(err);
    res.json(results.length);
  });
};

exports.battle_search = function(req, res) {
  var query = {};
  var search_king = req.param("king");
  var search_location = req.param("location");
  var search_type = req.param("type");
  if (search_king) {
    query = Object.assign(
      { $or: [{ defender_king: search_king }, { attacker_king: search_king }] },
      query
    );
  }
  if (search_location) {
    query = Object.assign({ location: search_location }, query);
  }
  if (search_type) {
    query = Object.assign({ battle_type: search_type }, query);
  }
  Battle.find(query, function(err, searchData) {
    if (err) return next(err);
    res.send(searchData);
  });
};

exports.battle_stats = function(req, res) {
  Promise.all([
    Battle.count({ attacker_outcome: "win" }),
    Battle.count({ attacker_outcome: "loss" }),
    Battle.find().distinct("battle_type"),
    Battle.aggregate([
      {
        $group: {
          _id: null,
          average: { $avg: "$defender_size" },
          min: { $min: "$defender_size" },
          max: { $max: "$defender_size" }
        }
      }
    ]),
    Battle.aggregate([
      {
        $sortByCount: "$attacker_king"
      },
      { $limit: 1 }
    ]),
    Battle.aggregate([
      {
        $sortByCount: "$defender_king"
      },
      { $limit: 1 }
    ]),
    Battle.aggregate([
      {
        $sortByCount: "$region"
      },
      { $limit: 1 }
    ]),
    Battle.aggregate([
      {
        $sortByCount: "$name"
      },
      { $limit: 1 }
    ])
  ])
    .then(results => {
      const [
        winCount,
        lossCount,
        battleTypes,
        size,
        attacker_king,
        defender_king,
        region,
        name
      ] = results;
      var finalResult = {};
      finalResult = Object.assign(
        { attacker_outcome: { win: winCount, loss: lossCount } },
        finalResult
      );
      finalResult = Object.assign({ battle_type: battleTypes }, finalResult);
      finalResult = Object.assign(
        {
          defender_size: {
            average: size[0].average,
            min: size[0].min,
            max: size[0].max
          }
        },
        finalResult
      );
      finalResult = Object.assign(
        {
          most_active: {
            attacker_king: attacker_king[0]._id,
            defender_king: defender_king[0]._id,
            region: region[0]._id,
            name: name[0]._id
          }
        },
        finalResult
      );
      res.send(finalResult);
    })
    .catch(err => {
      console.error("Something went wrong", err);
    });
};
