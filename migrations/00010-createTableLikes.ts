import type { Sql } from 'postgres';
import { z } from 'zod';

export const likeSchema = z.object({
  id: z.number(),
  albumId: z.number(),
  userId: z.number(),
  createdDate: z.date(),
  userName: z.string(),
});

export type Like = {
  id: number;
  albumId: number;
  userId: number;
  createdDate: Date;
  userName: string;
};

export async function up(sql: Sql) {
  await sql`
  CREATE TABLE likes(
id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
album_id integer NOT NULL REFERENCES albums (id) ON DELETE CASCADE,
user_id integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
created_date DATE DEFAULT (DATE('now'))
  )`;
}

export async function down(sql: Sql) {
  await sql`DROP TABLE likes`;
}
