import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const answerVoteRouter = Router();

// Upvotes a specific answer
answerVoteRouter.post("/:id/upvote", async (req, res) => {
  const answerIdFromClient = req.params.id;

  try {
    const answerResult = await connectionPool.query(
      `
      select * from answers
      where id = $1
      `,
      [answerIdFromClient]
    );

    if (answerResult.rowCount === 0) {
      return res.status(404).json({
        message: "Not Found: Question not found.",
      });
    }

    await connectionPool.query(
      `
      insert into answer_votes (answer_id, vote)
      values ($1, 1)
      `,
      [answerIdFromClient]
    );

    const result = await connectionPool.query(
      `
      select
        answers.id,
        answers.question_id,
        answers.content,
        answers.created_at,
        answers.updated_at,
        sum(case when answer_votes.vote = 1 then 1 else 0 end) as upvotes,
        sum(case when answer_votes.vote = -1 then 1 else 0 end) as downvotes
      from answers
      left join answer_votes on answers.id = answer_votes.answer_id
      where answers.id = $1
      group by answers.id
      `,
      [answerIdFromClient]
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

// Downvotes a specific answer
answerVoteRouter.post("/:id/downvote", async (req, res) => {
  const answerIdFromClient = req.params.id;

  try {
    const answerResult = await connectionPool.query(
      `
      select * from answers
      where id = $1
      `,
      [answerIdFromClient]
    );

    if (answerResult.rowCount === 0) {
      return res.status(404).json({
        message: "Not Found: Question not found.",
      });
    }

    await connectionPool.query(
      `
      insert into answer_votes (answer_id, vote)
      values ($1, -1)
      `,
      [answerIdFromClient]
    );

    const result = await connectionPool.query(
      `
      select
        answers.id,
        answers.question_id,
        answers.content,
        answers.created_at,
        answers.updated_at,
        sum(case when answer_votes.vote = 1 then 1 else 0 end) as upvotes,
        sum(case when answer_votes.vote = -1 then 1 else 0 end) as downvotes
      from answers
      left join answer_votes on answers.id = answer_votes.answer_id
      where answers.id = $1
      group by answers.id
      `,
      [answerIdFromClient]
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

export default answerVoteRouter;
