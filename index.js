require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// MongoDB Connection
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGO_URI);
const db = client.db("fcc-urlshortener-microservice");
const urls = db.collection("urls");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// requiring packages
const dns = require('dns');
const urlParser = require('url');

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
    // console.log(req.body);
    const url = req.body.url;
    const dnslookup = dns.lookup(urlParser.parse(url).hostname, async (err, address) => {
        if(!address) {
            res.json({error: "invalid url"});
        } else {
            const urlCount = await urls.countDocuments({});
            const urlDoc = {
                url,
                short_url: urlCount
            }

            const result = await urls.insertOne(urlDoc);
            // console.log(result);
            res.json({ original_url: url, short_url: urlCount });
        }
    })
});

app.get('/api/shorturl/:short_url', async(req, res) => {
    const short_url = req.params.short_url;
    const urlDoc = await urls.findOne({ short_url: +short_url });
    res.redirect(urlDoc.url);
});

// For /api/shorturl/<short_url>
app.post('/api/shorturl/:short_url', function (req, res) {
    
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
