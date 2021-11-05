const express = require("express");

const recipesRouter = require("./routes/recipes");

const app = express();

app.use(express.json());

app.use("/recipes", recipesRouter);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

// async/await instead of callback
