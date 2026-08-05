import db from "../../database.js";

export function createCompany(company) {

  db.prepare(`
    INSERT INTO companies (
      id,
      name,
      phone,
      address,
      commercial_reg,
      tax_number,
      created_at,
      updated_at
    )
    VALUES (?,?,?,?,?,?,?,?)
  `).run(
      company.id,
      company.name,
      company.phone,
      company.address,
      company.commercialReg,
      company.taxNumber,
      new Date().toISOString(),
      new Date().toISOString()
  );

}