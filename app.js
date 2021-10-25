const express = require("express");
const cors = require("cors");
const mongodb = require("mongodb");
const bcryptjs = require("bcryptjs");

const app = express();
const mongoclient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;

const url = "mongodb+srv://ronit:ronit123@cluster0.rcs55.mongodb.net/url-shortener?retryWrites=true&w=majority";

app.use(cors({
  origin: '*'
}));
app.use(express.json());

app.post("/shorturl", async (req, res) => {
  console.log(req.body);
  try {
    let con = await mongoclient.connect(url);
    let db = con.db("url-shortener");
    await db.collection("links").insertOne(req.body);
    await con.close();
    res.send({ message: "success" });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/shorturl", async (req, res) => {
  try {
    let con = await mongoclient.connect(url);
    let db = con.db("url-shortener");
    let links = await db.collection("links").find().toArray();
    await con.close();
    res.send(links);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.put("/shorturl/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let o_id = new ObjectId(id);
    let con = await mongoclient.connect(url);
    let db = con.db("url-shortener");
    await db
      .collection("links")
      .findOneAndUpdate({ _id: o_id }, { $set: req.body });
    await con.close();
    res.send({ message: "success" });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.delete("/shorturl/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let o_id = new ObjectId(id);
    let con = await mongoclient.connect(url);
    let db = con.db("url-shortener");
    await db.collection("links").deleteOne({ _id: o_id });
    await con.close();
    res.send({ message: "success" });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/user/register", async (req, res) => {
  console.log(req.body);
  try {
    let con = await mongoclient.connect(url);
    let db = con.db("url-shortener");
    var salt = await bcryptjs.genSalt(10);
    var hash = await bcryptjs.hash(req.body.password, salt);
    req.body.password = hash;
    await db.collection("users").insertOne(req.body);
    await con.close();
    res.send({ message: "success" });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/user/login", async (req, res) => {
  console.log(req.body);
  try {
    let con = await mongoclient.connect(url);
    let db = con.db("url-shortener");
    let user = await db.collection("users").findOne({email: req.body.email});

    if(user)
    {
      let result = await bcryptjs.compare(req.body.password, user.password);
      if(result){
        res.send({message: "success"});
      }
      else{
        res.status(401).send({message: "incorrect password"});
      }
    }
    else
    {
      res.status(401).send({message: "user not found"});
    }

    await con.close();
    res.send({ message: "success" });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
