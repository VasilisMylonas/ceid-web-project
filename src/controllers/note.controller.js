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
    const { content } = req.body;
    if (content) {
      req.note.content = content;
    }
    await req.note.save();
    res.status(StatusCodes.OK).json(req.note);
  }
}
