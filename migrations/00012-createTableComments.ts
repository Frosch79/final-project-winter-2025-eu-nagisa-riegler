import type { Sql } from 'postgres';
import { z } from 'zod';

export const commentSchema = z.object({
  id: z.number(),
  albumId: z.number(),
  userId: z.number(),
  content: z.string(),
  createdDate: z.date(),
});

export type Comment = {
  id: number;
  albumId: number;
  userId: number;
  content: string;
  createdDate: Date;
};
export async function up(sql: Sql) {
  await sql`
  CREATE TABLE comments(
id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
album_id integer NOT NULL REFERENCES albums (id) ON DELETE CASCADE,
user_id integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
content TEXT NOT NULL,
created_date DATE DEFAULT (DATE('now'))
  )`;
}

export async function down(sql: Sql) {
  await sql`DROP TABLE comments`;
}
