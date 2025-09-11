import { StatusCodes } from "http-status-codes";

export default class PresentationController {
  static async get(req, res) {
    res.status(StatusCodes.OK).json(req.presentation);
  }
  static async delete(req, res) {
    await req.presentation.destroy();
    res.status(StatusCodes.NO_CONTENT).json();
  }
  static async put(req, res) {
    await req.presentation.update(req.body);
    res.status(StatusCodes.OK).json(req.presentation);
  }
}
