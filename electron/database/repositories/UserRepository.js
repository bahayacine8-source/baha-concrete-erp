import db from "../../database.js";

export function getUserByEmail(email) {

  return db.prepare(`
    SELECT *
    FROM users
    WHERE email=?
  `).get(email);

}