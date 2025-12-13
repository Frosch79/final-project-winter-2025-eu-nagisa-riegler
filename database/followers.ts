import { User } from '@/migrations/00000-createTableUsers';
import type { Follow } from '@/migrations/00002-createTableFollows';
import { Session } from '@/migrations/00014-createTableSessions';
import { sql } from './connect';

export type FollowUser = Follow & { userName: User['name'] };

export async function getUserAllFollowedInsecure(userId: User['id']) {
  /* user follow someone */
  const followedUsers = await sql<FollowUser[]>`
  SELECT DISTINCT follows.*,
  name AS user_name FROM follows
  INNER JOIN users ON users.id = followed_user_id
  WHERE follower_user_id =${userId}
  `;
  return followedUsers;
}

export async function getUserAllFollowersInsecure(userId: User['id']) {
  /* someone follows me */
  const followers = await sql<FollowUser[]>`
  SELECT DISTINCT
  follows.*,
  users.name AS user_name FROM follows
  INNER JOIN users ON users.id = follower_user_id
  WHERE followed_user_id = ${userId}
  `;
  return followers;
}

export async function getIsFollowed(
  sessionToken: Session['token'],
  userId: User['id'],
) {
  const [result] = await sql<{ exists: boolean }[]>`
   SELECT
      EXISTS (
        SELECT
          TRUE
        FROM
          follows
       INNER JOIN sessions ON(
    sessions.token = ${sessionToken}
    AND sessions.user_id = follows.follower_user_id
    AND expiry_timestamp > now()
        )
        WHERE
            follows.follower_user_id =sessions.user_id AND ( sessions.user_id =  ${userId}  OR follows.followed_user_id = ${userId} )    --my followed user and myself
      )

  `;
  return Boolean(result?.exists);
}

export async function createFollow(
  sessionToken: Session['token'],
  newFollow: Follow['followedUserId'],
) {
  /* following */
  const [createdFollow] = await sql<Follow[]>`
    INSERT INTO
          follows(
          follower_user_id,
          followed_user_id
      ) (
        SELECT
            user_id,
            ${newFollow}
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
  followedId: Follow['id'],
) {
  /* unfollow */
  const [deletedFollow] = await sql<Follow[]>`
  DELETE FROM follows WHERE followed_user_id= ${followedId} AND follower_user_id IN (
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
