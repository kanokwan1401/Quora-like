import { Router } from "express";
import { validateCreateAnswer } from "../middlewares/answer.validation.mjs";
import connectionPool from "../utils/db.mjs";

const questionsAnswerRouter = Router();

// Optional Requirement
// Creates an answer for a specific question
questionsAnswerRouter.post(
  "/:id/answers",
  [validateCreateAnswer],
  async (req, res) => {
    const questionIdFromClient = req.params.id;
    const newAnswers = {
      ...req.body,
      question_id: questionIdFromClient,
      created_at: new Date(),
      updated_at: new Date(),
    };

    if (!newAnswers.content) {
      return res.status(400).json({
        message: "Bad Request: Missing or invalid request data.",
      });
    }

    try {
      const questionResult = await connectionPool.query(
        `select * from questions where id = $1`,
        [questionIdFromClient]
      );
      if (questionResult.rowCount === 0) {
        return res.status(404).json({
          message: "Not Found: Question not found.",
        });
      }
      const result = await connectionPool.query(
        `
      insert into answers (content, question_id, created_at, updated_at)
      values ($1, $2, $3, $4)
      returning id, question_id, content, created_at, updated_at
      `,
        [
          newAnswers.content,
          newAnswers.question_id,
          newAnswers.created_at,
          newAnswers.updated_at,
        ]
      );

      return res.status(201).json({
        message: "Created: Answer created successfully",
        data: result.rows[0],
      });
    } catch {
      return res.status(500).json({
        message: "Server could not create answers because database issue",
      });
    }
  }
);

//Retrieves answers for a specific question
questionsAnswerRouter.get("/:id/answers", async (req, res) => {
  const questionIdFromClient = req.params.id;

  try {
    const result = await connectionPool.query(
      `
      select * from answers where question_id = $1
      `,
      [questionIdFromClient]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Not Found: Question not found.",
      });
    }
    return res.status(201).json({
      message: "OK: Successfully retrieved the answers.",
      data: result.rows,
    });
  } catch {
    return res.status(500).json({
      message: "Server could not retrieves answers because database issue",
    });
  }
});

export default questionsAnswerRouter;
