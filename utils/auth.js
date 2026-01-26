import jwt from "jsonwebtoken";
export function setUser(payload) {
  const secret = process.env.SECRET_KEY;
  if (!secret) throw new Error("No jwt key found");

  const token = jwt.sign(payload, secret, { expiresIn: "1d" });
  return token;
}

export function getUser(token) {
  const secret = process.env.SECRET_KEY;
  if (!secret) throw new Error("No jwt key found");

  const user = jwt.verify(token, secret);
  return user;
}
