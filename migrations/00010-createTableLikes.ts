import type { Sql } from 'postgres';
import { z } from 'zod';

export const likeSchema = z.object({
  albumId: z.number(),
});

export type Like = {
  id: number;
  albumId: number;
  userId: number;
  createdDate: Date;
};
export type LikeUsers = {
  id: number;
  albumId: number;
  userId: number;
  createdDate: Date;
  name: string;
};

export async function up(sql: Sql) {
  await sql`
  CREATE TABLE likes(
id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
album_id integer NOT NULL REFERENCES albums (id) ON DELETE CASCADE,
user_id integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
created_date timestamp NOT NULL DEFAULT now()
  )`;
}

export async function down(sql: Sql) {
  await sql`DROP TABLE likes`;
}
