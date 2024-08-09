export const validateCreateAnswer = (req, res, next) => {
  if (!req.body.content || req.body.content.length > 300) {
    return res.status(401).json({
      message:
        "Please submit the content of your answer as specified, no more than 300 characters.",
    });
  }

  next();
};
