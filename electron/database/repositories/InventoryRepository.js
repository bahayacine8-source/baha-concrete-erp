import db from "../../database.js";

export function addMaterial(material) {

  db.prepare(`
    INSERT INTO materials (
      id,
      company_id,
      name,
      unit,
      current_quantity,
      minimum_quantity,
      created_at,
      updated_at
    )
    VALUES (?,?,?,?,?,?,?,?)
  `).run(
      material.id,
      material.companyId,
      material.name,
      material.unit,
      material.currentQuantity,
      material.minimumQuantity,
      new Date().toISOString(),
      new Date().toISOString()
  );

}