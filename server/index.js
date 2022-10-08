const express = require("express");
const app = express();
const http = require("http").Server(app);
const path = require("path");
const io = require("socket.io")(http);
const mongoose = require("mongoose");


const port = process.env.PORT || 5000;

const Calculations = require("./Calculation");

mongoose.connect('mongodb+srv://root:root@cluster0.opbijmg.mongodb.net/?retryWrites=true&w=majority', {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

app.use(express.static(path.join(__dirname, "..", "client", "build")));

const changeStream = Calculations.watch();

io.on("connection", (client) => {
  Calculations.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .exec((err, calc) => {
      if (err) return console.error(err);

      client.emit("calc", calc);
    });

  changeStream.on("change", () => {
    Calculations.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .exec((err, calc) => {
        if (err) return console.error(err);

        client.emit("calc", calc);
      });
  });

  client.on("lstCalculation", (calculation) => {
    const calc = new Calculations({
      calculation: calculation.calculation,
    });

    calc.save((err) => {
      if (err) {
        return console.error(err);
      }
    });
  });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static("../client/build"));
}

http.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
