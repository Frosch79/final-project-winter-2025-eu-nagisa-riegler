import type { Sql } from 'postgres';
import { z } from 'zod';

export const userLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});
export const updateUserSchema = z.object({
  name: z.string().min(3),
  country: z.string(),
  accountDescription: z.string(),
});
export const userSchema = z.object({
  name: z.string().min(3),
  birthday: z.coerce.date(),
  country: z.string(),
  accountDescription: z.string(),
  email: z.email(),
  password: z.string().min(8),
});

export type User = {
  id: number;
  name: string;
  birthday: Date;
  country: string;
  accountDescription: string | null;
  email: string;
};

export async function up(sql: Sql) {
  await sql`
    CREATE TABLE users (
      id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      name varchar(30) NOT NULL,
      birthday date NOT NULL,
      country varchar(30) NOT NULL,
      account_description text,
      email varchar(50) NOT NULL UNIQUE,
      password_hash text NOT NULL,
      created_date timestamp NOT NULL DEFAULT now()
    )
  `;
}

export async function down(sql: Sql) {
  await sql`DROP TABLE users`;
}
