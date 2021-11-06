const express = require("express");
const fs = require("fs");
const { Validator } = require("express-json-validator-middleware");
const utils = require("../utils/json-reader");

const router = express.Router();

const recipeSchema = {
  type: "object",
  required: ["name", "ingredients", "instructions"],
  name: {
    type: "string",
  },
  ingredients: {
    type: "array",
    items: {
      type: "string",
    },
  },
  instructions: {
    type: "array",
    items: {
      type: "string",
    },
  },
};

const { validate } = new Validator();

router.get("/", (req, res) => {
  console.log("GET request /recipes");

  try {
    const data = utils.jsonReader("./utils/data.json");

    const recipeNames = data.recipes.map((recipe) => recipe.name);

    res.status(200).send({ recipeNames });
  } catch (err) {
    res.status(500).send({ error: "An error occured reading from database" });
  }
});

router.get("/details/:name", (req, res) => {
  console.log("GET request /recipes/details/" + req.params.name);

  try {
    const data = utils.jsonReader("./utils/data.json");

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
  } catch (err) {
    res.status(500).send({ error: "An error occured reading from database" });
  }
});

router.post("/", validate({ body: recipeSchema }), (req, res) => {
  console.log("POST request /recipes with body:\n", req.body);

  try {
    const data = utils.jsonReader("./utils/data.json");

    const recipe = data.recipes.find((recipe) => recipe.name === req.body.name);

    if (recipe) {
      res.status(400).send({ error: "Recipe already exists" });
      return;
    }

    data["recipes"].push(req.body);

    try {
      fs.writeFileSync("./utils/data.json", JSON.stringify(data, null, 4));
    } catch (err) {
      res.status(500).send({ error: "An error occured writing to database" });
    }

    res.status(201).send();
  } catch (err) {
    res.status(500).send({ error: "An error occured reading from database" });
  }
});

router.put("/", validate({ body: recipeSchema }), (req, res) => {
  console.log("PUT request /recipes with body:\n", req.body);

  try {
    const data = utils.jsonReader("./utils/data.json");

    const idx = data.recipes.findIndex(
      (recipes) => recipes.name === req.body.name
    );

    if (idx === -1) {
      res.status(404).send({ error: "Recipe does not exist" });
      return;
    }

    data.recipes[idx].ingredients = req.body.ingredients;
    data.recipes[idx].instructions = req.body.instructions;

    try {
      fs.writeFileSync("./utils/data.json", JSON.stringify(data, null, 4));
    } catch (err) {
      res.status(500).send({ error: "An error occured writing to database" });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).send({ error: "An error occured reading from database" });
  }
});

module.exports = router;
