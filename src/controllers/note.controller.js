import { StatusCodes } from "http-status-codes";

export default class NoteController {
  static async get(req, res) {
    res.status(StatusCodes.OK).json(req.note);
  }

  static async delete(req, res) {
    await req.note.destroy();
    res.status(StatusCodes.NO_CONTENT).send();
  }

  static async put(req, res) {
    if (req.body.content.length > 300) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Note exceeds 300 characters." });
    }
    req.note.content = req.body.content;
    await req.note.save();
    res.status(StatusCodes.OK).json(req.note);
  }
}
