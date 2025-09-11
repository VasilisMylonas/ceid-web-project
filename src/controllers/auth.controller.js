import { StatusCodes } from "http-status-codes";
import AuthService from "../services/auth.service.js";

export async function login(req, res) {
  const token = await AuthService.login(req.body.username, req.body.password);

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json();
  }

  res.success({ token }, {}, StatusCodes.OK);
}

export async function logout(req, res) {
  // TODO WONTFIX
  res.status(StatusCodes.NOT_IMPLEMENTED).json({
    message:
      "Logout not implemented, please clear the token on the client side. See https://jwt.io/ for more information.",
  });
}

export async function refresh(req, res) {
  // TODO WONTFIX: Implement refresh token logic
  res.status(StatusCodes.NOT_IMPLEMENTED).json({
    message: "Refresh token not implemented yet.",
  });
}
