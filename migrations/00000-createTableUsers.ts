import type { Sql } from 'postgres';
import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(3),
  birthday: z.date(),
  country: z.string(),
  accountDescription: z.string(),
  email: z.email(),
  createdDate: z.date(),
  password: z.string().min(8),
});

export type User = {
  id: number;
  name: string;
  birthday: Date;
  country: string;
  accountDescription: string | null;
  email: string;
  createdDate: Date;
};

export async function up(sql: Sql) {
  await sql`
  CREATE TABLE users(
    id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name varchar (30) NOT NULL,
    birthday date NOT NULL,
    country varchar(30) NOT NULL,
    account_description text,
    email varchar(50) NOT NULL UNIQUE,
    password_hash text NOT NULL

  )`;
}

export async function down(sql: Sql) {
  await sql`DROP TABLE users`;
}
