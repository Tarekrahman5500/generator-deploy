import { EntityManager } from 'typeorm';

export async function moveSerial(params: {
  manager: EntityManager;
  groupId: string;
  fieldId: string;
  newSerialNo: number;
}): Promise<void> {
  const { manager, groupId, fieldId, newSerialNo } = params;

  // Lock the row we move (and ensure it's in the group)
  const current = await manager.query(
    `
    SELECT id, serial_no AS serialNo
    FROM field
    WHERE id = ? AND group_id = ?
    FOR UPDATE
    `,
    [fieldId, groupId],
  );

  if (!current.length) throw new Error('Field not found in group');

  const oldSerial: number = Number(current[0].serialNo);
  if (!Number.isFinite(oldSerial) || oldSerial <= 0) {
    throw new Error('Field has invalid serialNo');
  }

  const newSerial = Math.max(1, Math.floor(newSerialNo));
  if (newSerial === oldSerial) return;

  // Lock the whole group rows to prevent concurrent reorder conflicts
  await manager.query(
    `
    SELECT id
    FROM field
    WHERE group_id = ?
    FOR UPDATE
    `,
    [groupId],
  );

  if (newSerial < oldSerial) {
    // Moving UP: shift down others in [newSerial .. oldSerial-1]
    await manager.query(
      `
      UPDATE field
      SET serial_no = serial_no + 1
      WHERE group_id = ?
        AND id <> ?
        AND serial_no >= ?
        AND serial_no < ?
      `,
      [groupId, fieldId, newSerial, oldSerial],
    );
  } else {
    // Moving DOWN: shift up others in [oldSerial+1 .. newSerial]
    await manager.query(
      `
      UPDATE field
      SET serial_no = serial_no - 1
      WHERE group_id = ?
        AND id <> ?
        AND serial_no > ?
        AND serial_no <= ?
      `,
      [groupId, fieldId, oldSerial, newSerial],
    );
  }

  // Place the moved field
  await manager.query(
    `
    UPDATE field
    SET serial_no = ?
    WHERE id = ? AND group_id = ?
    `,
    [newSerial, fieldId, groupId],
  );
}

export async function normalizeSerials(params: {
  manager: EntityManager;
  groupId: string;
}): Promise<void> {
  const { manager, groupId } = params;

  // Lock group rows
  const rows: Array<{ id: string; serialNo: number | null }> =
    await manager.query(
      `
    SELECT id, serial_no AS serialNo
    FROM field
    WHERE group_id = ?
    ORDER BY
      (serial_no IS NULL) ASC,
      serial_no ASC,
      id ASC
    FOR UPDATE
    `,
      [groupId],
    );

  if (!rows.length) return;

  // Renumber sequentially 1..N in the current sorted order
  const caseSql = rows
    .map((r, idx) => `WHEN '${r.id}' THEN ${idx + 1}`)
    .join(' ');

  await manager.query(
    `
    UPDATE field
    SET serial_no = CASE id
      ${caseSql}
      ELSE serial_no
    END
    WHERE group_id = ?
    `,
    [groupId],
  );
}
