import type { Sql } from 'postgres';

const photos = [
  /* cloudinaryDataPaths are dummy path */

  {
    id: 1,
    albumId: 1,
    title: 'Bathhouse Exterior',
    cloudinaryDataPath:
      'https://res.cloudinary.com/dvvu2bciu/image/upload/v1765976807/my_app/vqlhyrbowqorzxdv0eth.jpg',
    description: 'Front view of the bathhouse that inspired Spirited Away',
    location: 'Dogo Onsen, Matsuyama, Japan',
    createdDate: '2024-01-01',
  },
  {
    id: 2,
    albumId: 1,
    title: 'Spirited Alley',
    cloudinaryDataPath:
      'https://res.cloudinary.com/dvvu2bciu/image/upload/v1764932405/my_app/hadbfs3iinmufoc40461.jpg',
    description: 'A mysterious alley reminiscent of the spirit world',
    location: 'Dogo Onsen, Matsuyama, Japan',
    createdDate: '2024-01-02',
  },
  {
    id: 3,
    albumId: 2,
    title: 'River Scene',
    cloudinaryDataPath:
      'https://res.cloudinary.com/dvvu2bciu/image/upload/v1764933224/my_app/pgxr7utx5pgzpgculf6k.jpg',
    description: 'The river that reminds me of Kohaku River',
    location: 'Nagano, Japan',
    createdDate: '2024-01-03',
  },
  {
    id: 4,
    albumId: 3,
    title: 'Sky View',
    cloudinaryDataPath:
      'https://res.cloudinary.com/dvvu2bciu/image/upload/v1764940958/my_app/axmvg6zdcgltuaoqv775.jpg',
    description: 'Floating rocks inspired by Laputa',
    location: 'Zhangjiajie, China',
    createdDate: '2024-01-04',
  },
  {
    id: 5,
    albumId: 4,
    title: 'Mining Town',
    cloudinaryDataPath:
      'https://res.cloudinary.com/dvvu2bciu/image/upload/v1764941571/my_app/jqh9j4sp70otqmdfmx6f.jpg',
    description: null,
    location: null,
    createdDate: '2024-01-05',
  },
  {
    id: 6,
    albumId: 5,
    title: 'Forest Guardian',
    cloudinaryDataPath:
      'https://res.cloudinary.com/dvvu2bciu/image/upload/v1765209213/my_app/gdfdvrogvyssteuh0rgj.jpg',
    description: 'Ancient forest scenery',
    location: 'Yakushima, Japan',
    createdDate: '2024-01-06',
  },
  {
    id: 7,
    albumId: 6,
    title: 'Emishi Landscape',
    cloudinaryDataPath:
      'https://res.cloudinary.com/dvvu2bciu/image/upload/v1765307100/my_app/hrovwrmf72llnkm8lw57.jpg',
    description: null,
    location: null,
    createdDate: '2024-01-07',
  },
  {
    id: 8,
    albumId: 7,
    title: "Kiki's Town Life",
    cloudinaryDataPath:
      'https://res.cloudinary.com/dvvu2bciu/image/upload/v1765977245/my_app/wjkscypcg9ifcpj5av3z.jpg',
    description: null,
    location: null,
    createdDate: '2024-01-08',
  },
  {
    id: 9,
    albumId: 8,
    title: 'Flying Over the Adriatic',
    cloudinaryDataPath:
      'https://res.cloudinary.com/dvvu2bciu/image/upload/v1766080772/my_app/nw5frydexfdr1tbzf4xm.jpg',
    description: null,
    location: null,
    createdDate: '2024-01-09',
  },
  {
    id: 10,
    albumId: 9,
    title: 'Castle Scenery',
    cloudinaryDataPath:
      'https://res.cloudinary.com/dvvu2bciu/image/upload/v1772120740/my_app/xqaqtpsdhpnjsxh1h5eo.jpg',
    description: 'European countryside',
    location: 'Colmar, France',
    createdDate: '2024-01-10',
  },
  {
    id: 11,
    albumId: 10,
    title: 'Hat Shop View',
    cloudinaryDataPath:
      'https://res.cloudinary.com/dvvu2bciu/image/upload/v1774435684/my_app/sbkf9gr9gldz6ege8s5t.jpg',
    description: null,
    location: null,
    createdDate: '2024-01-11',
  },
  {
    id: 12,
    albumId: 11,
    title: 'Mysterious Forest',
    cloudinaryDataPath:
      'https://res.cloudinary.com/dvvu2bciu/image/upload/v1774539519/my_app/rmcgbjkyezkvpvum3n2k.jpg',
    description: null,
    location: null,
    createdDate: '2024-01-12',
  },
  {
    id: 13,
    albumId: 12,
    title: 'Town Streets',
    cloudinaryDataPath:
      'https://res.cloudinary.com/dvvu2bciu/image/upload/v1774543181/my_app/elt4qxaxs9r58kdzdada.jpg',
    description: null,
    location: null,
    createdDate: '2024-01-13',
  },
  {
    id: 14,
    albumId: 13,
    title: 'Hidden Corners',
    cloudinaryDataPath:
      'https://res.cloudinary.com/dvvu2bciu/image/upload/v1776432693/my_app/poce26xomfepu1limisb.jpg',
    description: null,
    location: null,
    createdDate: '2024-01-14',
  },
  {
    id: 15,
    albumId: 13,
    title: 'Secret Garden',
    cloudinaryDataPath:
      'https://res.cloudinary.com/dvvu2bciu/image/upload/v1776432768/my_app/eligfq0karfucshy9qtt.jpg',
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
