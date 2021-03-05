require("dotenv").config();
const express = require("express");
const cors = require("cors");
const BitlyClient = require("bitly").BitlyClient;
const bitly = new BitlyClient(process.env.BITLY_ACCESS_TOKEN);
const path = require("path");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", (req, res) => {
  res.sendFile(path.join(`${process.cwd()}`, "/views/index.html"));
});

// Your first API endpoint
app.get("/api/hello", (req, res) => {
  res.json({ greeting: "hello API" });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
