import type { Sql } from 'postgres';

const likes = [
  { id: 1, albumId: 1, userId: 2, createdDate: '2024-01-01' },
  { id: 2, albumId: 2, userId: 1, createdDate: '2024-01-02' },
  { id: 3, albumId: 3, userId: 4, createdDate: '2024-01-03' },
  { id: 4, albumId: 4, userId: 3, createdDate: '2024-01-04' },
  { id: 5, albumId: 5, userId: 8, createdDate: '2024-01-05' },
  { id: 6, albumId: 8, userId: 5, createdDate: '2024-01-06' },
  { id: 7, albumId: 1, userId: 1, createdDate: '2024-01-07' },
  { id: 8, albumId: 3, userId: 3, createdDate: '2024-01-08' },
  { id: 9, albumId: 5, userId: 5, createdDate: '2024-01-09' },
  { id: 10, albumId: 8, userId: 8, createdDate: '2024-01-10' },
  { id: 11, albumId: 2, userId: 5, createdDate: '2024-01-11' },
  { id: 12, albumId: 4, userId: 6, createdDate: '2024-01-12' },
  { id: 13, albumId: 6, userId: 7, createdDate: '2024-01-13' },
  { id: 14, albumId: 9, userId: 5, createdDate: '2024-01-14' },
  { id: 15, albumId: 10, userId: 6, createdDate: '2024-01-15' },
  { id: 16, albumId: 13, userId: 7, createdDate: '2024-01-16' },
  { id: 17, albumId: 13, userId: 10, createdDate: '2024-01-17' },
];

export async function up(sql: Sql) {
  for (const like of likes) {
    await sql`
      INSERT INTO
        likes(
        album_id,
        user_id,
        created_date
    )
      VALUES
        (
          ${like.albumId},
          ${like.userId},
          ${like.createdDate}


        )
    `;
  }
}

export async function down(sql: Sql) {
  for (const like of likes) {
    await sql`
      DELETE FROM likes
      WHERE
        id = ${like.id}
    `;
  }
}
