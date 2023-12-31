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
  const exercise = this.log.find((exercise) => exercise._id.toString() === id);

  if (!exercise) {
    return { username: this.username, _id: this._id, exercise: {} };
  }

  return {
    username: this.username,
    _id: this._id,
    description: exercise._doc.description,
    duration: exercise._doc.duration,
    date: exercise._doc.date.toDateString(),
  };
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

  const updateExercises = async (exercises) => {
    const buffer = [];
    await exercises.map((exercise) => {
      buffer.push({
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString(),
      });
    });

    return buffer;
  };

  const updatedExercises = await updateExercises(exercises);

  return {
    username: this.username,
    _id: this._id,
    exercises: updatedExercises,
  };
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
