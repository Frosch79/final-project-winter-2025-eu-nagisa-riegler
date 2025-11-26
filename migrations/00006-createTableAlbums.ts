import type { Sql } from 'postgres';
import { z } from 'zod';

export const albumSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string(),
  description: z.string(),
  location: z.string(),
  createdDate: z.date(),
  visibilityId: z.number(),
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
export type FeedAlbum = {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  location: string | null;
  createdDate: Date;
  visibilityId: number;
  userName: string;
};

export type AlbumByUser = {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  location: string | null;
  createdDate: Date;
  visibilityId: number;
  userName: string;
  likes_count: number;
  comments_count: number;
};

export async function up(sql: Sql) {
  await sql`
  CREATE TABLE albums(
id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
user_id integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
title varchar(30) NOT NULL,
description TEXT,
location TEXT,
created_date DATE DEFAULT (DATE('now')),
visibility_id integer NOT NULL REFERENCES visibilities (id) ON DELETE CASCADE
  )`;
}

export async function down(sql: Sql) {
  await sql`DROP TABLE albums`;
}
