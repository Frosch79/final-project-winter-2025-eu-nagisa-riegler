import { User } from '@/migrations/00000-createTableUsers';
import { Session } from '@/migrations/00014-createTableSessions';
import { sql } from './connect';

export async function getValidSession(sessionToken: Session['token']) {
  const [session] = await sql<Pick<Session, 'id' | 'token'>[]>`
    SELECT
      sessions.id,
      sessions.token
    FROM
      sessions
    WHERE
      sessions.token = ${sessionToken}
      AND expiry_timestamp > now()
  `;
  return session;
}

export async function createSessionInsecure(
  token: Session['token'],
  userId: User['id'],
) {
  const [session] = await sql<Session[]>`
    INSERT INTO
      sessions (token, user_id)
    VALUES
      (
        ${token},
        ${userId}
      )
    RETURNING
      sessions.id,
      sessions.token,
      sessions.user_id
  `;

  await sql`
    DELETE FROM sessions
    WHERE
      expiry_timestamp < now()
  `;

  return session;
}

export async function deleteSession(sessionToken: Session['token']) {
  const [session] = await sql<Pick<Session, 'id' | 'token'>[]>`
    DELETE FROM sessions
    WHERE
      sessions.token = ${sessionToken}
    RETURNING
      sessions.id,
      sessions.token
  `;
  return session;
}
