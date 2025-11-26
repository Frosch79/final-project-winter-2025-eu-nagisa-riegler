import type { Follow } from '@/migrations/00002-createTableFollows';
import { Session } from '@/migrations/00014-createTableSessions';
import { sql } from './connect';

export async function getAllFollowed(sessionToken: Session['token']) {
  /* I follow someone */
  const followedUser = await sql<Follow[]>`
  SELECT DISTINCT users.name FROM follows
  INNER JOIN users ON users.id = followed_user_id
  INNER JOIN sessions ON (
    sessions.token = ${sessionToken}
    AND sessions.user_id = follows.follower_user_id
    AND expiry_timestamp > now()
  )
  `;
  return followedUser;
}

export async function getAllFollowers(sessionToken: Session['token']) {
  /* someone follows me */
  const followers = await sql<Follow[]>`
  SELECT DISTINCT users.name FROM follows
  INNER JOIN users ON users.id = follower_user_id
  INNER JOIN sessions ON (
    sessions.token = ${sessionToken}
    AND sessions.user_id = follows.followed_user_id
    AND expiry_timestamp > now()
  )
  `;
  return followers;
}

export async function createFollow(
  sessionToken: Session['token'],
  newFollow: Follow,
) {
  /* following */
  const createdFollow = await sql<Follow[]>`
    INSERT INTO
          follows(
          follower_user_id,
          followed_user_id
      ) (
        SELECT
            user_id,
            ${newFollow.followedId}
          FROM
            sessions
          WHERE
            token =${sessionToken}
          AND sessions.expiry_timestamp > now()
          )
          RETURNING
          follows.*
      `;

  return createdFollow;
}

export async function deleteFollow(
  sessionToken: Session['token'],
  followId: Follow['id'],
) {
  /* unfollow */
  const deletedFollow = await sql<Follow[]>`
  DELETE FROM follows WHERE id= ${followId} AND follower_user_id IN (
      SELECT
      user_id
      FROM
      sessions
      WHERE
      token= ${sessionToken}
      AND sessions.expiry_timestamp > now()
    )
    RETURNING
    follows.*
    `;
  return deletedFollow;
}

export async function selectFollowExists(followId: Follow['id']) {
  const [record] = await sql<{ exists: boolean }[]>`
    SELECT
      EXISTS (
        SELECT
          TRUE
        FROM
          follows
        WHERE
          id = ${followId}
      )
  `;

  return Boolean(record?.exists);
}
