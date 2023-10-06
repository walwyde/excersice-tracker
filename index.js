const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const connectdb = require("./utils/dbconn");
const User = require("./Model/UserModel");


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/users", async (req, res) => {
  try {
    const usersArray = await User.find({})
      .sort({ username: 1 })
      .select(["-__v", "-log"])
      .exec();
    res.json(usersArray);
  } catch (ex) {
    console.log(ex);
    res.status(400).json({
      error: ex.message,
      message: "Something went wrong",
    });
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  console.log(from, to, limit);

  const user = await User.findById(_id);

  const exercises = await user.getExercises(from, to, limit);

  res.json({
    username: user.username,
    log: exercises,
    count: exercises.length,
  });
});

app.post("/api/users", async (req, res) => {
  try {
    const { username } = req.body;

    const user = await User.create({ username });

    await user.save();

    res.json({ username: user.username, _id: user._id });
  } catch (ex) {
    console.log(ex);
    res.status(400).json({
      error: ex.message,
      message: ex.keyPattern.username
        ? "Username already exists"
        : "Something went wrong",
    });
  }
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  try {
    const { _id } = req.params;

    const { description, duration, date } = req.body;

    console.log(_id);

    const user = await User.findById(_id);

    console.log(user);

    const exercise = {
      description,
      duration: Number(duration),
      date: date ? new Date(date) : new Date(),
    };

    const updatedUser = await user.addExercise(exercise);

    res.status(201).json(updatedUser);
  } catch (ex) {
    console.log(ex);
    res.status(400).json({
      error: ex.message,
      message: "Something went wrong",
    });
  }
});

const listener = app.listen(process.env.PORT || 3000, async () => {

const db = await connectdb();

  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", function () {
    console.log("Connected to the database!");
  });
  console.log("Your app is listening on port " + listener.address().port);
});
