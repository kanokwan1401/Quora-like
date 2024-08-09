import express from "express";
import questionsRouter from "./routes/questions.mjs";
import questionsAnswerRouter from "./routes/answer.mjs";
import questionsVoteRouter from "./routes/vote-question.mjs";
import answerVoteRouter from "./routes/vote-answer.mjs";

const app = express();
const port = 4000;

app.use(express.json());
app.use("/questions", questionsRouter);
app.use("/questions", questionsAnswerRouter);
app.use("/questions", questionsVoteRouter);
app.use("/answers", answerVoteRouter);

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
