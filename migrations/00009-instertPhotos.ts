import type { Sql } from 'postgres';

const photos = [
  /* cloudinaryDataPaths are dummy path */

  {
    id: 1,
    albumId: 1,
    title: 'Bathhouse Exterior',
    cloudinaryDataPath:
      'https://res.cloudinary.com/demo/image/upload/v1/ghibli/bathhouse.jpg',
    description: 'Front view of the bathhouse that inspired Spirited Away',
    location: 'Dogo Onsen, Matsuyama, Japan',
    createdDate: '2024-01-01',
  },
  {
    id: 2,
    albumId: 1,
    title: 'Spirited Alley',
    cloudinaryDataPath:
      'https://res.cloudinary.com/demo/image/upload/v1/ghibli/spirited_alley.jpg',
    description: 'A mysterious alley reminiscent of the spirit world',
    location: 'Dogo Onsen, Matsuyama, Japan',
    createdDate: '2024-01-02',
  },
  {
    id: 3,
    albumId: 2,
    title: 'River Scene',
    cloudinaryDataPath:
      'https://res.cloudinary.com/demo/image/upload/v1/ghibli/river_scene.jpg',
    description: 'The river that reminds me of Kohaku River',
    location: 'Nagano, Japan',
    createdDate: '2024-01-03',
  },
  {
    id: 4,
    albumId: 3,
    title: 'Sky View',
    cloudinaryDataPath:
      'https://res.cloudinary.com/demo/image/upload/v1/ghibli/laputa_sky.jpg',
    description: 'Floating rocks inspired by Laputa',
    location: 'Zhangjiajie, China',
    createdDate: '2024-01-04',
  },
  {
    id: 5,
    albumId: 4,
    title: 'Mining Town',
    cloudinaryDataPath:
      'https://res.cloudinary.com/demo/image/upload/v1/ghibli/mining_town.jpg',
    description: null,
    location: null,
    createdDate: '2024-01-05',
  },
  {
    id: 6,
    albumId: 5,
    title: 'Forest Guardian',
    cloudinaryDataPath:
      'https://res.cloudinary.com/demo/image/upload/v1/ghibli/forest_guardian.jpg',
    description: 'Ancient forest scenery',
    location: 'Yakushima, Japan',
    createdDate: '2024-01-06',
  },
  {
    id: 7,
    albumId: 6,
    title: 'Emishi Landscape',
    cloudinaryDataPath:
      'https://res.cloudinary.com/demo/image/upload/v1/ghibli/emishi_landscape.jpg',
    description: null,
    location: null,
    createdDate: '2024-01-07',
  },
  {
    id: 8,
    albumId: 7,
    title: "Kiki's Town Life",
    cloudinaryDataPath:
      'https://res.cloudinary.com/demo/image/upload/v1/ghibli/kiki_town.jpg',
    description: null,
    location: null,
    createdDate: '2024-01-08',
  },
  {
    id: 9,
    albumId: 8,
    title: 'Flying Over the Adriatic',
    cloudinaryDataPath:
      'https://res.cloudinary.com/demo/image/upload/v1/ghibli/flying_adriatic.jpg',
    description: null,
    location: null,
    createdDate: '2024-01-09',
  },
  {
    id: 10,
    albumId: 9,
    title: 'Castle Scenery',
    cloudinaryDataPath:
      'https://res.cloudinary.com/demo/image/upload/v1/ghibli/castle_scenery.jpg',
    description: 'European countryside',
    location: 'Colmar, France',
    createdDate: '2024-01-10',
  },
  {
    id: 11,
    albumId: 10,
    title: 'Hat Shop View',
    cloudinaryDataPath:
      'https://res.cloudinary.com/demo/image/upload/v1/ghibli/hat_shop.jpg',
    description: null,
    location: null,
    createdDate: '2024-01-11',
  },
  {
    id: 12,
    albumId: 11,
    title: 'Mysterious Forest',
    cloudinaryDataPath:
      'https://res.cloudinary.com/demo/image/upload/v1/ghibli/mysterious_forest.jpg',
    description: null,
    location: null,
    createdDate: '2024-01-12',
  },
  {
    id: 13,
    albumId: 12,
    title: 'Town Streets',
    cloudinaryDataPath:
      'https://res.cloudinary.com/demo/image/upload/v1/ghibli/town_streets.jpg',
    description: null,
    location: null,
    createdDate: '2024-01-13',
  },
  {
    id: 14,
    albumId: 13,
    title: 'Hidden Corners',
    cloudinaryDataPath:
      'https://res.cloudinary.com/demo/image/upload/v1/ghibli/hidden_corners.jpg',
    description: null,
    location: null,
    createdDate: '2024-01-14',
  },
  {
    id: 15,
    albumId: 13,
    title: 'Secret Garden',
    cloudinaryDataPath:
      'https://res.cloudinary.com/demo/image/upload/v1/ghibli/secret_garden.jpg',
    description: 'Peaceful garden scenery',
    location: 'Cotswolds, UK',
    createdDate: '2024-01-15',
  },
];

export async function up(sql: Sql) {
  for (const photo of photos) {
    await sql`
      INSERT INTO
        photos (
          album_id,
          title,
          cloudinary_data_path,
          description,
          location
        )
      VALUES
        (
          ${photo.albumId},
          ${photo.title},
          ${photo.cloudinaryDataPath},
          ${photo.description},
          ${photo.location}
        )
    `;
  }
}

export async function down(sql: Sql) {
  for (const photo of photos) {
    await sql`
      DELETE FROM photos
      WHERE
        id = ${photo.id}
    `;
  }
}
