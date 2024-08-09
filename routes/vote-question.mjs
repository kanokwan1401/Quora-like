import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const questionsVoteRouter = Router();
// Upvotes a specific question
questionsVoteRouter.post("/:id/upvote", async (req, res) => {
  const questionIdFromClient = req.params.id;

  try {
    const questionResult = await connectionPool.query(
      `
      select * from questions
      where id = $1
      `,
      [questionIdFromClient]
    );

    if (questionResult.rowCount === 0) {
      return res.status(404).json({
        message: "Not Found: Question not found.",
      });
    }

    await connectionPool.query(
      `
      insert into question_votes (question_id, vote)
      values ($1, 1)
      `,
      [questionIdFromClient]
    );

    const result = await connectionPool.query(
      `
      select
        questions.id,
        questions.title,
        questions.description,
        questions.category,
        questions.created_at,
        questions.updated_at,
        sum(case when question_votes.vote = 1 then 1 else 0 end) as upvotes,
        sum(case when question_votes.vote = -1 then 1 else 0 end) as downvotes
      from questions
      left join question_votes on questions.id = question_votes.question_id
      where questions.id = $1
      group by questions.id
      `,
      [questionIdFromClient]
    );

    return res.status(200).json({
      message: "OK: Successfully upvoted the question.",
      data: result.rows,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message:
        "Server could not Upvotes a specific question because database issue",
    });
  }
});

// Downvotes a specific question
questionsVoteRouter.post("/:id/downvote", async (req, res) => {
  const questionIdFromClient = req.params.id;

  try {
    const questionResult = await connectionPool.query(
      `
      select * from questions 
      where id = $1
      `,
      [questionIdFromClient]
    );
    if (questionResult.rowCount === 0) {
      return res.status(404).json({
        message: "Not Found: Question not found.",
      });
    }
    await connectionPool.query(
      `
      insert into question_votes (question_id, vote)
      values ($1, -1)
      `,
      [questionIdFromClient]
    );

    const result = await connectionPool.query(
      `
      select
        questions.id,
        questions.title,
        questions.description,
        questions.category,
        questions.created_at,
        questions.updated_at,
        sum(case when question_votes.vote = 1 then 1 else 0 end) as upvotes,
        sum(case when question_votes.vote = -1 then 1 else 0 end) as downvotes
      from questions
      left join question_votes on questions.id = question_votes.question_id
      where questions.id = $1
      group by questions.id
      `,
      [questionIdFromClient]
    );

    return res.status(200).json({
      message: "OK: Successfully upvoted the question.",
      data: result.rows,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message:
        "Server could not Upvotes a specific question because database issue",
    });
  }
});

export default questionsVoteRouter;
