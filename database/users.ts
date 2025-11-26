import type { User } from '@/migrations/00000-createTableUsers';
import type { Session } from '@/migrations/00014-createTableSessions';
import { sql } from './connect';

type UserWithPasswordHash = User & { passwordHash: string };

export async function getUserInsecure(userEmail: User['email']) {
  const [user] = await sql<User[]>`
    SELECT
      users.id, users.name, users.email
    FROM
      users
      WHERE email= ${userEmail.toLowerCase()}
  `;
  return user;
}

/* if already login */
export async function getUser(sessionToken: Session['token']) {
  const [user] = await sql<User[]>`
    SELECT
      users.id,
      users.name,
      users.birthday,
      users.country,
      users.account_description,
      users.email,
      users.created_date
    FROM
      users
      INNER JOIN sessions ON (
        sessions.token = ${sessionToken}
        AND users.id = sessions.user_id
        AND expiry_timestamp > now()
      )
  `;
  return user;
}

export async function createUserInsecure(
  userData: Omit<User, 'id'>,
  passwordHash: UserWithPasswordHash['passwordHash'],
) {
  const [user] = await sql<User[]>`
  INSERT INTO
    users(name,birthday,country,account_description,email,password_hash)
  VALUES
  (
    ${userData.name},
    ${userData.birthday},
    ${userData.country},
    ${userData.accountDescription || 'welcome to my page'},
    ${userData.email.toLowerCase()},
    ${passwordHash}
  )
  RETURNING
  users.*

    `;
  return user;
}

export async function getUserWithPasswordHashInsecure(email: User['email']) {
  const [user] = await sql<UserWithPasswordHash[]>`
    SELECT
      *
    FROM
      users
    WHERE
      email = ${email.toLowerCase()}
  `;
  return user;
}
