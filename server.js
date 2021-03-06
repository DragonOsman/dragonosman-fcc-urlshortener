require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const dns = require("dns");

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;
const urlSchema = new Schema({
  original_url: { type: String, unique: true },
  short_url: String
});

const Url = mongoose.model("url", urlSchema);

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

// to parse POST request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/api/shorturl/new", (req, res) => {
  const originalUrl = req.body.url;
  const parsedUrl = new URL(originalUrl);
  const domain = parsedUrl.hostname;
  Url.find({}, (err, urls) => {
    if (err) {
      console.log(err);
    }
    const shortUrl = urls.length;

    const url = new Url({
      original_url: originalUrl,
      short_url: shortUrl
    });

    dns.lookup(domain, (err) => {
      if (err) {
        res.json({ error: err });
      }

      if (!originalUrl.match(/^(http|https):\/\//)) {
        res.json({ error: "invalid url" });
      }

      Url.findOne({ original_url: originalUrl }, (err, foundUrl) => {
        if (err) {
          console.log(err);
        }

        if (!foundUrl) {
          url.save((err, url) => {
            if (err) {
              console.log(err);
            }
          });
        }
      });

      res.json({
        original_url: originalUrl,
        short_url: shortUrl
      });
    });
  });
});

app.get("/api/shorturl/:short_url", (req, res) => {
  Url.findOne({ short_url: req.params.short_url }, (err, url) => {
    if (err) {
      console.log(err);
    }
    res.redirect(url.original_url);
  });
});
