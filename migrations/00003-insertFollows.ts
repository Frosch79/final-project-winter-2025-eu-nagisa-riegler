import type { Sql } from 'postgres';

const follows = [
  {
    id: 1,
    followerId: 1,
    followedId: 2,
    createdDate: '2024-01-01',
  },
  {
    id: 2,
    followerId: 1,
    followedId: 3,
    createdDate: '2024-01-02',
  },

  {
    id: 3,
    followerId: 2,
    followedId: 1,
    createdDate: '2024-01-03',
  },
  {
    id: 4,
    followerId: 2,
    followedId: 5,
    createdDate: '2024-01-04',
  },

  {
    id: 5,
    followerId: 3,
    followedId: 4,
    createdDate: '2024-01-05',
  },
  {
    id: 6,
    followerId: 3,
    followedId: 7,
    createdDate: '2024-01-06',
  },

  {
    id: 7,
    followerId: 4,
    followedId: 3,
    createdDate: '2024-01-07',
  },
  {
    id: 8,
    followerId: 4,
    followedId: 6,
    createdDate: '2024-01-08',
  },

  {
    id: 9,
    followerId: 5,
    followedId: 1,
    createdDate: '2024-01-09',
  },
  {
    id: 10,
    followerId: 5,
    followedId: 8,
    createdDate: '2024-01-10',
  },

  {
    id: 11,
    followerId: 6,
    followedId: 5,
    createdDate: '2024-01-11',
  },
  {
    id: 12,
    followerId: 6,
    followedId: 9,
    createdDate: '2024-01-12',
  },

  {
    id: 13,
    followerId: 7,
    followedId: 1,
    createdDate: '2024-01-13',
  },
  {
    id: 14,
    followerId: 7,
    followedId: 10,
    createdDate: '2024-01-14',
  },

  {
    id: 15,
    followerId: 8,
    followedId: 9,
    createdDate: '2024-01-15',
  },
  {
    id: 16,
    followerId: 8,
    followedId: 4,
    createdDate: '2024-01-16',
  },

  {
    id: 17,
    followerId: 9,
    followedId: 10,
    createdDate: '2024-01-17',
  },
  {
    id: 18,
    followerId: 9,
    followedId: 2,
    createdDate: '2024-01-18',
  },

  {
    id: 19,
    followerId: 10,
    followedId: 3,
    createdDate: '2024-01-19',
  },
  {
    id: 20,
    followerId: 10,
    followedId: 8,
    createdDate: '2024-01-20',
  },
];

export async function up(sql: Sql) {
  for (const follow of follows) {
    await sql`
      INSERT INTO
        follows(follower_user_id,followed_user_id,created_date
    )
      VALUES
        (
          ${follow.followerId},
          ${follow.followedId},
          ${follow.createdDate}

        )
    `;
  }
}

export async function down(sql: Sql) {
  for (const follow of follows) {
    await sql`
      DELETE FROM follows
      WHERE
        id = ${follow.id}
    `;
  }
}
