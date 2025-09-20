import express from "express";
import db from "../models/index.js";
import { Op } from "sequelize";
import { AnnouncementFeedFormat } from "../constants.js";

const router = express.Router();
// No auth middleware, this is a public endpoint

const announcementsValidators = {};

// Public endpoint for presentation announcements feed
router.get("/", async (req, res) => {
  const { from, to, format } = req.query;

  const where = {};

  // Date filtering
  if (from || to) {
    where.date = {};
    if (from) {
      where.date[Op.gte] = from;
    }

    if (to) {
      where.date[Op.lte] = to;
    }
  }

  const presentations = await db.Presentation.findAll({
    where,
    include: [
      {
        model: db.Thesis,
        attributes: ["id"],
        include: [
          {
            model: db.Student,
            attributes: ["id", "am"],
            include: [
              {
                model: db.User,
                attributes: ["id", "name", "email"],
              },
            ],
          },
        ],
      },
    ],
    order: [["date", "ASC"]],
  });

  if (format === "xml") {
    res.set("Content-Type", "application/xml");
    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      "<feed>",
      ...presentations.map((p) => {
        const thesis = p.Thesis || {};
        return `
<presentation>
  <id>${p.id}</id>
  <date>${p.date ? new Date(p.date).toISOString() : ""}</date>
  <kind>${p.kind || ""}</kind>
  <hall>${p.hall || ""}</hall>
  <link>${p.link || ""}</link>
  <thesis>
    <id>${thesis.id || ""}</id>
    <title>${thesis.title || ""}</title>
  </thesis>
</presentation>
        `;
      }),
      "</feed>",
    ].join("\n");

    return res.send(xml);
  }

  // Default: JSON
  res.json(presentations);
});

export default router;
