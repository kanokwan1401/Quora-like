import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import { validateCreateQuestionData } from "../middlewares/question.validation.mjs";

const questionsRouter = Router();

// Creates a new question.
questionsRouter.post("/", [validateCreateQuestionData], async (req, res) => {
  const newQuestion = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
  };

  if (!newQuestion.title || !newQuestion.description || !newQuestion.category) {
    return res.status(400).json({
      message: "Bad Request: Missing or invalid request data.",
    });
  }

  try {
    const result = await connectionPool.query(
      `insert into questions (title, description, category, created_at, updated_at)
      values ($1, $2, $3, $4, $5)
      returning id, title, description, category, created_at, updated_at
      `,
      [
        newQuestion.title,
        newQuestion.description,
        newQuestion.category,
        newQuestion.created_at,
        newQuestion.updated_at,
      ]
    );
    return res.status(201).json({
      message: "Created: Question created successfully.",
      data: result.rows[0],
    });
  } catch {
    return res.status(500).json({
      message: "Server could not create questions because database issue",
    });
  }
});

// Retrieves a list of all questions.
// Search questions by title or category (Optional Requirement)
questionsRouter.get("/", async (req, res) => {
  const title = req.query.title || "";
  const category = req.query.category || "";

  try {
    let query;
    let queryParams = [];

    if (title || category) {
      query = `
        select * from questions
        where
          ($1 = '' OR title ilike $1)
          and
          ($2 = '' OR category ilike $2)
      `;
      queryParams = [
        title ? `%${title}%` : "",
        category ? `%${category}%` : "",
      ];
    } else {
      query = "select * from questions";
    }

    const results = await connectionPool.query(query, queryParams);

    const message =
      title || category
        ? "OK: Successfully retrieved the search results."
        : "OK: Successfully retrieved the list of questions.";

    return res.status(200).json({
      message: message,
      data: results.rows,
    });
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({
      message:
        "Server could not retrieve a list of all questions because of a database issue.",
    });
  }
});

// Retrieves a specific question by its ID.
questionsRouter.get("/:id", async (req, res) => {
  const questionIdFromClient = req.params.id;

  try {
    const results = await connectionPool.query(
      `select * from questions where id=$1`,
      [questionIdFromClient]
    );
    if (!results.rows[0]) {
      return res.status(404).json({
        message: "Not Found: Question not found",
      });
    }
    return res.status(200).json({
      message: "Successfully retrieved the question",
      data: results.rows[0],
    });
  } catch {
    return res.status(500).json({
      message:
        "Server could not retrieves a specific question by its ID because database issue",
    });
  }
});

// Updates the title or description of a specific question
questionsRouter.put("/:id", async (req, res) => {
  const questionIdFromClient = req.params.id;
  const updatedQuestion = { ...req.body, updated_at: new Date() };

  if (
    !updatedQuestion.title ||
    !updatedQuestion.description ||
    !updatedQuestion.category ||
    !updatedQuestion.created_at
  ) {
    return res.status(400).json({
      message: "Bad Request: Missing or invalid request data.",
    });
  }
  try {
    const result = await connectionPool.query(
      `
      update questions
      set title = $2,
          description = $3,
          category = $4,
          created_at = $5,
          updated_at = $6
      where id = $1
      returning id, title, description, category, created_at, updated_at
      `,
      [
        questionIdFromClient,
        updatedQuestion.title,
        updatedQuestion.description,
        updatedQuestion.category,
        updatedQuestion.created_at,
        updatedQuestion.updated_at,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Not Found: Question not found.",
      });
    }

    return res.status(200).json({
      message: "OK: Successfully updated the question.",
      data: result.rows[0],
    });
  } catch {
    return res.status(500).json({
      message: "Server could not updated question because database issue",
    });
  }
});

// Deletes a specific question
// Delete Question and answers under question should be delete (Optional Requirement)
questionsRouter.delete("/:id", async (req, res) => {
  const questionIdFromClient = req.params.id;

  try {
    // Delete answers related to the question.
    await connectionPool.query(
      `
      delete from answers 
      where question_id = $1
      `,
      [questionIdFromClient]
    );

    const result = await connectionPool.query(
      `
      delete from questions
      where id = $1
      `,
      [questionIdFromClient]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Not Found: Question not found.",
      });
    }

    return res.status(200).json({
      message: "OK: Successfully deleted the question",
    });
  } catch {
    return res.status(500).json({
      message: "Server could not delete question because database issue",
    });
  }
});

export default questionsRouter;
