export async function queryTheses(req, res) {
  let query = {
    attributes: ["id", "professorId", "title", "summary"],
    limit: req.query.limit,
    offset: req.query.offset,
  };
}
