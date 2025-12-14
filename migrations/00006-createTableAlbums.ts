import type { Sql } from 'postgres';
import { z } from 'zod';

export const albumSchema = z.object({
  location: z.string(),
  visibilityName: z.string(),
  title: z.string(),
  description: z.string(),
});

export type Album = {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  location: string | null;
  createdDate: Date;
  visibilityId: number;
};

export type AlbumWithVisibilityName = {
  title: string;
  description: string | null;
  location: string | null;
  createdDate: Date;
  visibilityName: string;
};
export type FeedAlbum = {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  location: string | null;
  createdDate: Date;
  visibilityId: number;
  name: string;
  commentCount: number;
  likeCount: number;
};

export async function up(sql: Sql) {
  await sql`
    CREATE TABLE albums (
      id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      user_id integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
      title varchar(30) NOT NULL,
      description text,
      location text,
      created_date timestamp NOT NULL DEFAULT now(),
      visibility_id integer NOT NULL REFERENCES visibilities (id) ON DELETE CASCADE
    )
  `;
}

export async function down(sql: Sql) {
  await sql`DROP TABLE albums`;
}
