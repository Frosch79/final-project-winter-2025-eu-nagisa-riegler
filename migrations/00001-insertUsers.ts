import type { Sql } from 'postgres';

const users = [
  /* password only uses test */
  {
    id: 1,
    name: 'Chihiro Ogino',
    birthday: new Date('1992-08-16'),
    country: 'Japan',
    accountDescription: 'welcome to my page',
    email: 'chihiro@example.com',
    passwordHash: 'hashed_password_1',
  },
  {
    id: 2,
    name: 'Haku',
    birthday: new Date('1988-03-01'),
    country: 'Spirit World',
    accountDescription: 'Dragon river spirit',
    email: 'haku@example.com',
    passwordHash: 'hashed_password_2',
  },
  {
    id: 3,
    name: 'Sheeta',
    birthday: new Date('1985-07-12'),
    country: 'Gondoa',
    accountDescription: 'Laputa descendent',
    email: 'sheeta@example.com',
    passwordHash: 'hashed_password_3',
  },
  {
    id: 4,
    name: 'Pazu',
    birthday: new Date('1984-04-24'),
    country: 'Slag Ravine',
    accountDescription: 'Engineer in training',
    email: 'pazu@example.com',
    passwordHash: 'hashed_password_4',
  },
  {
    id: 5,
    name: 'San',
    birthday: new Date('1990-05-03'),
    country: 'Forest',
    accountDescription: 'Princess of the wolves',
    email: 'san@example.com',
    passwordHash: 'hashed_password_5',
  },
  {
    id: 6,
    name: 'Ashitaka',
    birthday: new Date('1980-01-14'),
    country: 'Emishi',
    accountDescription: 'Traveling warrior',
    email: 'ashitaka@example.com',
    passwordHash: 'hashed_password_6',
  },
  {
    id: 7,
    name: 'Kiki',
    birthday: new Date('1998-10-01'),
    country: 'Koriko',
    accountDescription: 'Young witch in training',
    email: 'kiki@example.com',
    passwordHash: 'hashed_password_7',
  },
  {
    id: 8,
    name: 'Porco Rosso',
    birthday: new Date('1965-02-05'),
    country: 'Italy',
    accountDescription: 'I only lose to women and pigs',
    email: 'porco@example.com',
    passwordHash: 'hashed_password_8',
  },
  {
    id: 9,
    name: 'Howl Jenkins',
    birthday: new Date('1977-06-20'),
    country: 'Ingary',
    accountDescription: 'Wizard with a moving castle',
    email: 'howl@example.com',
    passwordHash: 'hashed_password_9',
  },
  {
    id: 10,
    name: 'Sophie Hatter',
    birthday: new Date('1982-12-02'),
    country: 'Ingary',
    accountDescription: 'Hat shop girl',
    email: 'sophie@example.com',
    passwordHash: 'hashed_password_10',
  },
];

export async function up(sql: Sql) {
  for (const user of users) {
    await sql`
      INSERT INTO
        users (
        name,
        birthday,
        country,
        account_description,
        email,
        password_hash
    )
      VALUES
        (
          ${user.name},
          ${user.birthday},
          ${user.country},
          ${user.accountDescription},
          ${user.email},
          ${user.passwordHash}
        )
    `;
  }
}

export async function down(sql: Sql) {
  for (const user of users) {
    await sql`
      DELETE FROM users
      WHERE
        id = ${user.id}
    `;
  }
}
