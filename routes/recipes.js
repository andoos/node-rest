const express = require("express");
const fs = require("fs");

const utils = require("../utils/json-reader");

const router = express.Router();

router.get("/", (_req, res) => {
  console.log("GET request /recipes");

  utils.jsonReader("./data.json", (err, data) => {
    if (err) {
      res.status(500).send({ error: "An error occured reading from database" });
      return;
    }

    const recipeNames = data.recipes.map((recipe) => recipe.name);

    res.status(200).send({ recipeNames });
  });
});

router.get("/details/:name", (req, res) => {
  console.log("GET request /recipes/details/" + req.params.name);

  utils.jsonReader("./data.json", (err, data) => {
    if (err) {
      res.status(500).send({ error: "An error occured reading from database" });
      return;
    }

    const recipe = data.recipes.find(
      (recipe) => recipe.name === req.params.name
    );

    if (!recipe) {
      res.status(200).send({});
      return;
    }

    res.status(200).send({
      details: {
        ingredients: recipe.ingredients,
        numSteps: recipe.ingredients.length,
      },
    });
  });
});

router.post("/", (req, res) => {
  console.log("POST request /recipes with body:\n", req.body);

  utils.jsonReader("./data.json", (err, data) => {
    if (err) {
      res.status(500).send({ error: "An error occured reading from database" });
      return;
    }

    const recipe = data.recipes.find((recipe) => recipe.name === req.body.name);

    if (recipe) {
      res.status(400).send({ error: "Recipe already exists" });
      return;
    }

    data["recipes"].push(req.body);

    fs.writeFile("./data.json", JSON.stringify(data, null, 4), (err) => {
      if (err) {
        res.status(500).send({ error: "An error occured writing to database" });
        return;
      }
    });

    res.status(201).send();
  });
});

router.put("/", (req, res) => {
  console.log("PUT request /recipes with body:\n", req.body);

  utils.jsonReader("./data.json", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send({ error: "An error occured reading from database" });
      return;
    }

    const idx = data.recipes.findIndex(
      (recipes) => recipes.name === req.body.name
    );

    if (idx === -1) {
      res.status(404).send({ error: "Recipe does not exist" });
      return;
    }

    data.recipes[idx].ingredients = req.body.ingredients;
    data.recipes[idx].instructions = req.body.instructions;

    fs.writeFile("./data.json", JSON.stringify(data, null, 4), (err) => {
      if (err) {
        res.status(500).send({ error: "An error occured writing to database" });
        return;
      }
    });
    res.status(204).send();
  });
});

module.exports = router;
