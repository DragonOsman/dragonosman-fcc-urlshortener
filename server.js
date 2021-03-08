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
  original_url: String,
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
  const domain = new URL(originalUrl).hostname;
  let shortUrl;
  Url.find({}, "original_url", (err, urls) => {
    if (err) {
      console.log(err);
    }
    console.log(urls);
    shortUrl = urls.length;
  });
  const url = new Url({
    original_url: originalUrl,
    short_url: shortUrl
  });

  dns.lookup(domain, (err) => {
    if (err) {
      res.json({ error: "invalid url" });
    }

    const saveUrlInDatabase = (urlDoc, done) => {
      urlDoc.save((err, url) => {
        if (err) {
          return done(err);
        }
        console.log(`url ${url} saved to database`);
        return done(null, url);
      });
    };

    saveUrlInDatabase(url, (err, data) => {
      if (err) {
        console.log(err);
      }
      if (!data) {
        console.log("Missing done() argument");
      }
    });

    res.json({
      original_url: originalUrl,
      short_url: shortUrl
    });
  });
});

app.get("/api/shorturl/:short_url", (req, res) => {
  let doc;
  const retrieveOriginalUrl = (url, done) => {
    doc = Url.findOne({ short_url: req.params.short_url }, (err, url) => {
      if (err) {
        done(err);
      }
      done(null, url);
    });
  };

  retrieveOriginalUrl(req.params.short_url, (err, data) => {
    if (err) {
      console.log(err);
    }
    if (!data) {
      console.log("Missing done() argument");
    }
  });
  console.log(doc);
});
