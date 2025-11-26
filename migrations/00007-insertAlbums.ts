import type { Sql } from 'postgres';

const albums = [
  {
    id: 1,
    userId: 1,
    title: 'Spirited Journey',
    description:
      'Inspired memories from places that resemble the spirit world.',
    location: 'Dogo Onsen, Matsuyama, Japan',
    createdDate: '2024-01-01',
    visibilityId: 1,
  },
  {
    id: 2,
    userId: 2,
    title: 'River Spirit Traces',
    description: 'Scenes that remind me of the Kohaku River.',
    location: 'Nagano Prefecture, Japan',
    createdDate: '2024-01-02',
    visibilityId: 1,
  },
  {
    id: 3,
    userId: 3,
    title: 'Laputa Inspirations',
    description: 'Sky views similar to the Laputa landscapes.',
    location: 'Wulingyuan Scenic Area, Zhangjiajie, China',
    createdDate: '2024-01-03',
    visibilityId: 2,
  },
  {
    id: 4,
    userId: 4,
    title: 'Mining Town Views',
    description: 'Rustic mining towns that resemble my home.',
    location: 'Tomonoura, Hiroshima, Japan',
    createdDate: '2024-01-04',
    visibilityId: 1,
  },
  {
    id: 5,
    userId: 5,
    title: 'Forest Guardian Moments',
    description: 'Wilderness similar to the ancient forest I protect.',
    location: 'Yakushima, Kagoshima, Japan',
    createdDate: '2024-01-05',
    visibilityId: 2,
  },
  {
    id: 6,
    userId: 6,
    title: 'Emishi Landscape',
    description: 'Scenery reminiscent of the northern tribes.',
    location: 'Shirakami-Sanchi, Aomori, Japan',
    createdDate: '2024-01-06',
    visibilityId: 1,
  },
  {
    id: 7,
    userId: 7,
    title: "Kiki's Town Life",
    description: 'European coastal towns that inspired Koriko.',
    location: 'Visby, Gotland, Sweden',
    createdDate: '2024-01-07',
    visibilityId: 1,
  },
  {
    id: 8,
    userId: 8,
    title: 'Flying Over the Adriatic',
    description: 'Views from the places I often fly over.',
    location: 'Rovinj, Istria, Croatia',
    createdDate: '2024-01-08',
    visibilityId: 3,
  },
  {
    id: 9,
    userId: 9,
    title: 'Wandering Castle Scenery',
    description: 'European countryside similar to my travels.',
    location: 'Colmar, Alsace, France',
    createdDate: '2024-01-09',
    visibilityId: 2,
  },
  {
    id: 10,
    userId: 10,
    title: 'Chipping Inspirations',
    description: 'The charming towns that inspired Market Chipping.',
    location: 'Cotswolds, England, United Kingdom',
    createdDate: '2024-01-10',
    visibilityId: 1,
  },
  {
    id: 11,
    userId: 3,
    title: 'Scenery from a Walk',
    description: null,
    location: null,
    createdDate: '2025-01-06',
    visibilityId: 3,
  },
  {
    id: 12,
    userId: 5,
    title: 'Travel Notes',
    description: null,
    location: null,
    createdDate: '2025-01-07',
    visibilityId: 2,
  },
  {
    id: 13,
    userId: 7,
    title: 'Random Album',
    description: null,
    location: null,
    createdDate: '2025-01-08',
    visibilityId: 1,
  },
];

export async function up(sql: Sql) {
  for (const album of albums) {
    await sql`
      INSERT INTO
        albums(
        user_id,title,description,location,created_date,visibility_id
    )
      VALUES
        (
          ${album.userId},
          ${album.title},
          ${album.description},
          ${album.location},
          ${album.createdDate},
          ${album.visibilityId}


        )
    `;
  }
}

export async function down(sql: Sql) {
  for (const album of albums) {
    await sql`
      DELETE FROM albums
      WHERE
        id = ${album.id}
    `;
  }
}
