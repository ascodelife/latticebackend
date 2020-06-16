import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import latticeRoute from "./api/routes/latticeRoute";

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/lattice", latticeRoute);
app.post("/api/status", (req, res) => {
  console.log(req.body);
  res.send(`接收到数据：${JSON.stringify(req.body)}`);
});

app.listen(5000, () => {
  console.log("Server started at http://localhost:5000");
});
