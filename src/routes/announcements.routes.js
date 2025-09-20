import express from "express";
import db from "../models/index.js";
import { Op, Sequelize } from "sequelize";
import { AnnouncementFeedFormat } from "../constants.js";
import js2xmlparser from "js2xmlparser";
import Joi from "joi";
import { validate } from "../middleware/validation.js";

const router = express.Router();
// No auth middleware, this is a public endpoint

const announcementsValidators = {
  get: {
    query: Joi.object({
      from: Joi.date().iso(),
      to: Joi.date().iso(),
      format: Joi.string().valid(...Object.values(AnnouncementFeedFormat)),
    }).unknown(false),
  },
};

// Public endpoint for presentation announcements feed
router.get("/feed", validate(announcementsValidators.get), async (req, res) => {
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

  const presentations = await db.Announcement.findAll({
    where,
    order: [["createdAt", "ASC"]],
  });

  if (format === AnnouncementFeedFormat.XML) {
    const xmlData = js2xmlparser.parse(
      "announcements",
      presentations.map((p) => p.get({ plain: true }))
    );
    res.set("Content-Type", "application/xml");
    res.send(xmlData);
  } else {
    // Default: JSON
    res.json(presentations);
  }
});

export default router;
