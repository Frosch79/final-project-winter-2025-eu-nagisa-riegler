import type { Sql } from 'postgres';
import { z } from 'zod';

export const followSchema = z.object({
  followerId: z.number(),
  followedId: z.number(),
  createdDate: z.date(),
});

export type Follow = {
  id: number;
  followerId: number;
  followedId: number;
  createdDate: Date;
};

export async function up(sql: Sql) {
  await sql`
  CREATE TABLE follows(
id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
follower_user_id integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
followed_user_id integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
created_date DATE DEFAULT (DATE('now'))
  )`;
}

export async function down(sql: Sql) {
  await sql`DROP TABLE follows`;
}
