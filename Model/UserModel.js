const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  log: [
    {
      description: String,
      duration: Number,
      date: Date,
    },
  ],
});

userSchema.methods.addExercise = async function (exercise) {
  this.log.push(exercise);
  await this.save();

  return { username: this.username, _id: this._id, ...exercise };
};

userSchema.methods.getExercise = async function (id) {
  return this.log.find((exercise) => exercise._id === id);
};

userSchema.methods.getExercises = async function (from, to, limit) {
  let exercises = this.log;

  if (from && to) {
    exercises = exercises.filter((exercise) => {
      return exercise.date >= new Date(from) && exercise.date <= new Date(to);
    });
  }

  if (limit > 0 && limit < exercises.length) {
    exercises = exercises.slice(0, limit);
  }

  return { username: this.username, _id: this._id, exercises };
};

userSchema.methods.totalDuration = function (from, to) {
  let exercises = this.log;

  if (from && to) {
    exercises = exercises.filter((exercise) => {
      return exercise.date >= new Date(from) && exercise.date <= new Date(to);
    });
  }

  return exercises.reduce((total, exercise) => {
    return total + exercise.duration;
  }, 0);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
