import type { Sql } from 'postgres';
import { z } from 'zod';

export const visibilitySchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type Visibility = {
  id: number;
  name: string;
};

export async function up(sql: Sql) {
  await sql`
  CREATE TABLE visibilities(
id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
name varchar(25) NOT NULL UNIQUE
  )`;
}

export async function down(sql: Sql) {
  await sql`DROP TABLE visibilities`;
}
