import type { Sql } from 'postgres';
import { z } from 'zod';

export const photoSchema = z.object({
  id: z.number(),
  albumId: z.number(),
  title: z.string(),
  cloudinaryDataPath: z.string(),
  description: z.string(),
  location: z.string(),
  createdDate: z.date(),
});

export type Photo = {
  id: number;
  albumId: number;
  title: string;
  cloudinaryDataPath: string;
  description: string | null;
  location: string | null;
  createdDate: Date;
};

export async function up(sql: Sql) {
  await sql`
  CREATE TABLE photos(
id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
album_id integer NOT NULL REFERENCES albums (id) ON DELETE CASCADE,
title varchar(30),
cloudinary_data_path TEXT NOT NULL,
description TEXT,
location TEXT,
created_date DATE DEFAULT (DATE('now'))
  )`;
}

export async function down(sql: Sql) {
  await sql`DROP TABLE photos`;
}
