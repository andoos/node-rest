var express = require("express");
var app = express();

app.use(express.json());

const fs = require("fs");

function jsonReader(path, cb) {
  fs.readFile(path, (err, fileData) => {
    if (err) {
      return cb && cb(err);
    }
    try {
      const object = JSON.parse(fileData);
      return cb && cb(null, object);
    } catch (err) {
      return cb && cb(err);
    }
  });
}

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

app.get("/recipes", (_req, res) => {
  console.log("GET request /recipes");

  jsonReader("./data.json", (err, data) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    jsonResponse = {
      recipeNames: [],
    };

    for (let i = 0; i < data.recipes.length; i++) {
      jsonResponse.recipeNames.push(data.recipes[i].name);
    }

    res.status(200).send(jsonResponse);
  });
});

app.get("/recipes/details/:name", (req, res) => {
  console.log("GET request /recipes/details/" + req.params.name);

  jsonReader("./data.json", (err, data) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    jsonResponse = {
      details: {
        ingredients: [],
        numSteps: 0,
      },
    };

    for (let i = 0; i < data.recipes.length; i++) {
      if (data.recipes[i].name === req.params.name) {
        jsonResponse.details.ingredients = data.recipes[i].ingredients;
        jsonResponse.details.numSteps = data.recipes[i].ingredients.length;
        res.status(200).send(jsonResponse);
        return;
      }
    }

    res.status(200).send({});
  });
});

app.post("/recipes", (req, res) => {
  console.log("POST request /recipes with body:\n", req.body);

  jsonReader("./data.json", (err, data) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    for (let i = 0; i < data.recipes.length; i++) {
      if (data.recipes[i].name === req.body.name) {
        res.status(400).send({ error: "Recipe already exists" });
        return;
      }
    }

    data["recipes"].push(req.body);

    fs.writeFile("./data.json", JSON.stringify(data, null, 4), (err) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
    });

    res.status(201).send();
  });
});

app.put("/recipes", (req, res) => {
  console.log("PUT request /recipes with body:\n", req.body);

  jsonReader("./data.json", (err, data) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    for (let i = 0; i < data.recipes.length; i++) {
      if (data.recipes[i].name === req.body.name) {
        data.recipes[i].ingredients = req.body.ingredients;
        data.recipes[i].instructions = req.body.instructions;

        fs.writeFile("./data.json", JSON.stringify(data, null, 4), (err) => {
          if (err) {
            res.status(500).send(err);
            return;
          }
        });
        res.status(204).send();
        return;
      }
    }
    res.status(404).send({ error: "Recipe does not exist" });
  });
});
