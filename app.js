const express = require("express");
const { ValidationError } = require("express-json-validator-middleware");
const recipesRouter = require("./routes/recipes");

const app = express();

app.use(express.json());

app.use("/recipes", recipesRouter);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

app.use((error, req, res, next) => {
  if (error instanceof ValidationError) {
    res.status(400).send({ error: "Incorrect request body format" });
  }
});
