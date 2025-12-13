import type { Sql } from 'postgres';

const comments = [
  {
    id: 1,
    albumId: 1,
    userId: 2,
    content: 'Amazing shots of the bathhouse!',
    createdDate: '2024-01-01',
  },
  {
    id: 2,
    albumId: 2,
    userId: 1,
    content: 'I love the river scenery!',
    createdDate: '2024-01-02',
  },
  {
    id: 3,
    albumId: 3,
    userId: 4,
    content: 'The sky looks magical!',
    createdDate: '2024-01-03',
  },
  {
    id: 4,
    albumId: 4,
    userId: 3,
    content: 'Rustic town vibes are great.',
    createdDate: '2024-01-04',
  },
  {
    id: 5,
    albumId: 5,
    userId: 8,
    content: 'The forest feels alive!',
    createdDate: '2024-01-05',
  },
  {
    id: 6,
    albumId: 8,
    userId: 5,
    content: 'Flying views are breathtaking!',
    createdDate: '2024-01-06',
  },
  {
    id: 7,
    albumId: 1,
    userId: 1,
    content: 'I like the details in these photos.',
    createdDate: '2024-01-07',
  },
  {
    id: 8,
    albumId: 3,
    userId: 3,
    content: 'Looks like Laputa!',
    createdDate: '2024-01-08',
  },
  {
    id: 9,
    albumId: 5,
    userId: 5,
    content: 'Nature is stunning here.',
    createdDate: '2024-01-09',
  },
  {
    id: 10,
    albumId: 8,
    userId: 8,
    content: 'Wish I could fly there too!',
    createdDate: '2024-01-10',
  },
  {
    id: 11,
    albumId: 2,
    userId: 5,
    content: 'Beautiful water reflections.',
    createdDate: '2024-01-11',
  },
  {
    id: 12,
    albumId: 4,
    userId: 6,
    content: 'Love the architecture.',
    createdDate: '2024-01-12',
  },
  {
    id: 13,
    albumId: 6,
    userId: 7,
    content: 'Great capture of the landscape.',
    createdDate: '2024-01-13',
  },
  {
    id: 14,
    albumId: 9,
    userId: 5,
    content: 'Europe looks lovely!',
    createdDate: '2024-01-14',
  },
  {
    id: 15,
    albumId: 10,
    userId: 6,
    content: 'Charming town scenes.',
    createdDate: '2024-01-15',
  },
  {
    id: 16,
    albumId: 13,
    userId: 7,
    content: 'Hidden corners are amazing!',
    createdDate: '2024-01-16',
  },
  {
    id: 17,
    albumId: 13,
    userId: 10,
    content: 'Love this secret garden.',
    createdDate: '2024-01-17',
  },
];

export async function up(sql: Sql) {
  for (const comment of comments) {
    await sql`
      INSERT INTO
        comments(
        album_id,
        user_id,
        content
    )
      VALUES
        (
          ${comment.albumId},
          ${comment.userId},
          ${comment.content}


        )
    `;
  }
}

export async function down(sql: Sql) {
  for (const comment of comments) {
    await sql`
      DELETE FROM comments
      WHERE
        id = ${comment.id}
    `;
  }
}
