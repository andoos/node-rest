const express = require("express");
const fs = require("fs").promises;
const { Validator } = require("express-json-validator-middleware");
const utils = require("../utils/jsonReader");

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

router.get("/", async (req, res) => {
  console.log("GET request /recipes");

  try {
    const data = await utils.jsonReader("./utils/data.json");

    const recipeNames = await data.recipes.map((recipe) => recipe.name);

    res.status(200).send({ recipeNames });
  } catch (err) {
    res.status(500).send({ error: "An error occured reading from database" });
  }
});

router.get("/details/:name", async (req, res) => {
  console.log("GET request /recipes/details/" + req.params.name);

  try {
    const data = await utils.jsonReader("./utils/data.json");

    const recipe = await data.recipes.find(
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

router.post("/", validate({ body: recipeSchema }), async (req, res) => {
  console.log("POST request /recipes with body:\n", req.body);

  try {
    const data = await utils.jsonReader("./utils/data.json");

    const recipe = await data.recipes.find(
      (recipe) => recipe.name === req.body.name
    );

    if (recipe) {
      res.status(400).send({ error: "Recipe already exists" });
      return;
    }

    data["recipes"].push(req.body);

    try {
      fs.writeFile("./utils/data.json", JSON.stringify(data, null, 4));
    } catch (err) {
      res.status(500).send({ error: "An error occured writing to database" });
    }

    res.status(201).send();
  } catch (err) {
    res.status(500).send({ error: "An error occured reading from database" });
  }
});

router.put("/", validate({ body: recipeSchema }), async (req, res) => {
  console.log("PUT request /recipes with body:\n", req.body);

  try {
    const data = await utils.jsonReader("./utils/data.json");

    const idx = await data.recipes.findIndex(
      (recipes) => recipes.name === req.body.name
    );

    if (idx === -1) {
      res.status(404).send({ error: "Recipe does not exist" });
      return;
    }

    data.recipes[idx].ingredients = req.body.ingredients;
    data.recipes[idx].instructions = req.body.instructions;

    try {
      fs.writeFile("./utils/data.json", JSON.stringify(data, null, 4));
    } catch (err) {
      res.status(500).send({ error: "An error occured writing to database" });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).send({ error: "An error occured reading from database" });
  }
});

module.exports = router;
