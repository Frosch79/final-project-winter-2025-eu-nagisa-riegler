import type { Sql } from 'postgres';
import { z } from 'zod';

export const followSchema = z.object({
  followedId: z.number(),
});

export type Follow = {
  id: number;
  followerUserId: number;
  followedUserId: number;
  createdDate: Date;
};

export async function up(sql: Sql) {
  await sql`
  CREATE TABLE follows(
id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
follower_user_id integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
followed_user_id integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
created_date timestamp NOT NULL DEFAULT now()
  )`;
}

export async function down(sql: Sql) {
  await sql`DROP TABLE follows`;
}
