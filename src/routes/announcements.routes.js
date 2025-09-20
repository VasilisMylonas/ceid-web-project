import express from "express";
import db from "../models/index.js";
import { Op } from "sequelize";
import { AnnouncementFeedFormat } from "../constants.js";

const router = express.Router();
// No auth middleware, this is a public endpoint

// Public endpoint for presentation announcements feed
router.get("/feed", async (req, res) => {
  const { from, to, format } = req.query;

  const where = {};

  if (from || to) {
    where.date = {};
    if (from) where.date[Op.gte] = from;
    if (to) where.date[Op.lte] = to;
  }

  const presentations = await db.Presentation.findAll({
    where,
    include: [
      {
        model: db.Thesis,
        attributes: ["id", "title"],
      },
    ],
    order: [["date", "ASC"]],
  });

  if (format === "xml") {
    res.set("Content-Type", "application/xml");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<feed>\n${presentations
      .map(
        (p) =>
          `  <presentation>\n    <id>${p.id}</id>\n    <date>${format(
            p.date,
            "yyyy-MM-dd'T'HH:mm:ssXXX"
          )}</date>\n    <kind>${p.kind}</kind>\n    <hall>${
            p.hall || ""
          }</hall>\n    <link>${p.link || ""}</link>\n    <thesis>\n      <id>${
            p.Thesis?.id || ""
          }</id>\n      <title>${
            p.Thesis?.title || ""
          }</title>\n    </thesis>\n  </presentation>`
      )
      .join("\n")}\n</feed>`;
    return res.send(xml);
  }

  // Default: JSON
  res.json(
    presentations.map((p) => ({
      id: p.id,
      date: p.date,
      kind: p.kind,
      hall: p.hall,
      link: p.link,
      thesis: p.Thesis ? { id: p.Thesis.id, title: p.Thesis.title } : null,
    }))
  );
});

export default router;
