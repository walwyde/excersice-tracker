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
  try {
    const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = await User.findById(_id);

  if (!user) {
    return res.status(404).json({
      error: "User not found",
      message: "User not found",
    });
  }

  const userLog = await user.getExercises(from, to, limit);

  res.json({
    username: userLog.username,
    _id: userLog._id,
    count: userLog.exercises && userLog.exercises.length,
    log: userLog.exercises ? userLog.exercises : [],
  });
  } catch (ex) {
    console.log(ex);
    res.status(400).json({
      error: ex.message,
      message: "Something went wrong",
    });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { username } = req.body;

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({
        username: existingUser.username,
        _id: existingUser._id,
      });
    }

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
      date: date ? new Date(date).toDateString() : new Date().toDateString(),
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

app.get("/api/users/:_id/exercises", async (req, res) => {
  const { _id } = req.params;

  console.log(_id);

  const user = await User.findOne({ log: { $elemMatch: { _id } } });

  if (!user) {
    return res.status(404).json({
      error: "User not found",
      message: "User not found",
    });
  }

  const exercise = await user.getExercise(_id);

  res.json(exercise);
});

const listener = app.listen(process.env.PORT || 3000, async () => {
  await connectdb();
  console.log("Your app is listening on port " + listener.address().port);
});
