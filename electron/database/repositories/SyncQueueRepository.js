import db from "../../database.js";

export function addToSyncQueue({
  tableName,
  recordId,
  operation,
  payload,
  deviceId = "MAIN_PC"
}) {

  const stmt = db.prepare(`
    INSERT INTO sync_queue (
      id,
      device_id,
      table_name,
      record_id,
      operation,
      payload,
      sync_status,
      created_at
    )
    VALUES (
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      'pending',
      datetime('now')
    )
  `);

  stmt.run(
    crypto.randomUUID(),
    deviceId,
    tableName,
    recordId,
    operation,
    JSON.stringify(payload)
  );
}

export function getPendingSyncItems() {

  return db.prepare(`
    SELECT *
    FROM sync_queue
    WHERE sync_status='pending'
  `).all();

}

export function markAsSynced(id) {

  db.prepare(`
    UPDATE sync_queue
    SET
      sync_status='synced',
      synced_at=datetime('now')
    WHERE id=?
  `).run(id);

}