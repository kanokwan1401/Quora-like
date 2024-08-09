export const validateCreateQuestionData = (req, res, next) => {
  if (!req.body.title) {
    return res.status(401).json({
      message: "Please enter the title of the question as well.",
    });
  }

  if (!req.body.description) {
    return res.status(401).json({
      message: "Please enter the description of the question as well.",
    });
  }

  if (!req.body.category) {
    return res.status(401).json({
      message: "Please enter the category of the question as well.",
    });
  }

  next();
};
