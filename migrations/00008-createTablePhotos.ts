import type { Sql } from 'postgres';
import { z } from 'zod';

export const photoSchema = z.object({
  title: z.string(),
  cloudinaryDataPath: z.string(),
  description: z.string(),
  location: z.string(),
  albumId: z.number(),
});

export type Photo = {
  id: number;
  albumId: number;
  title: string | null;
  cloudinaryDataPath: string;
  description: string | null;
  location: string | null;
  createdDate: Date;
};
export type UserPhoto = {
  id: number | null;
  albumId: number | null;
  title: string | null;
  cloudinaryDataPath: string | null;
  description: string | null;
  location: string | null;
  createdDate: Date | null;
};

export async function up(sql: Sql) {
  await sql`
    CREATE TABLE photos (
      id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      album_id integer NOT NULL REFERENCES albums (id) ON DELETE CASCADE,
      title varchar(30),
      cloudinary_data_path text NOT NULL,
      description text,
      location text,
      created_date timestamp NOT NULL DEFAULT now()
    )
  `;
}

export async function down(sql: Sql) {
  await sql`DROP TABLE photos`;
}
