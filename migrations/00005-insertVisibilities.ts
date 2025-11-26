import type { Sql } from 'postgres';

const visibilities = [
  {
    id: 1,
    name: 'public',
  },
  {
    id: 2,
    name: 'followersOnly',
  },
  {
    id: 3,
    name: 'private',
  },
];

export async function up(sql: Sql) {
  for (const visibility of visibilities) {
    await sql`
      INSERT INTO
        visibilities(
        name
    )
      VALUES
        (
          ${visibility.name}


        )
    `;
  }
}

export async function down(sql: Sql) {
  for (const visibility of visibilities) {
    await sql`
      DELETE FROM visibilities
      WHERE
        id = ${visibility.id}
    `;
  }
}
