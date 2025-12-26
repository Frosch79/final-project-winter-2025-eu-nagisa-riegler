import { FullUser, UpdateUser } from '../../../database/users';
import { User } from '../../../migrations/00000-createTableUsers';

// 基本の User

export const users: User[] = [
  {
    id: 1,
    name: 'Totoro',
    birthday: new Date('1958-04-16'),
    country: 'Japan',
    accountDescription: 'Forest spirit',
    email: 'totoro@ghibli.test',
  },
  {
    id: 2,
    name: 'Kiki',
    birthday: new Date('1973-06-22'),
    country: 'Japan',
    accountDescription: 'Young witch',
    email: 'kiki@ghibli.test',
  },
  {
    id: 3,
    name: 'Howl',
    birthday: new Date('1986-09-30'),
    country: 'Wales',
    accountDescription: 'Wizard',
    email: 'howl@ghibli.test',
  },
];

export const totoro = users[0] as User;
export const kiki = users[1] as User;
export const howl = users[2] as User;

export const mockFailUser: any = {
  id: undefined,
  name: '',
  birthday: new Date('2000-07-20'),
  country: '',
  accountDescription: '',
  email: '',
};

// FullUser
export const mockFullUser: FullUser = {
  ...(users[0] as User),
  createdDate: new Date('2020-01-01'),
};

// FullUser edge: description null
export const mockFullUserNoDescription: FullUser = {
  ...mockFullUser,
  accountDescription: null,
};

// FullUser fail: invalid dates
export const mockFullUserInvalidDate: FullUser = {
  ...mockFailUser,
  birthday: new Date('invalid'),
  createdDate: new Date('invalid'),
};

// UpdateUser 用モック
export const mockUpdateUser: UpdateUser = {
  name: 'Totoro Updated',
  country: 'Japan',
  accountDescription: 'Forest guardian',
};
