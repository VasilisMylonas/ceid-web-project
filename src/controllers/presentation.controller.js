import { StatusCodes } from "http-status-codes";

export async function getPresentation(req, res) {
  res.status(StatusCodes.OK).json(req.presentation);
}

export async function deletePresentation(req, res) {
  await req.presentation.destroy();
  res.status(StatusCodes.NO_CONTENT).send();
}

export async function patchPresentation(req, res) {
  await req.presentation.update(req.body);
  res.status(StatusCodes.OK).json(req.presentation);
}
