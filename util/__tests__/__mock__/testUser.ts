import { FullUser, UpdateUser } from '../../../database/users';
import { User } from '../../../migrations/00000-createTableUsers';

// 基本の User
export const mockUser: User = {
  id: 1,
  name: 'Totoro',
  birthday: new Date('2000-07-20'),
  country: 'Japan',
  accountDescription: 'Forest spirit',
  email: 'totoro@example.com',
};

// FullUser
export const mockFullUser: FullUser = {
  ...mockUser,
  createdDate: new Date('2020-01-01'),
};

// FullUser edge: description null
export const mockFullUserNoDescription: FullUser = {
  ...mockFullUser,
  accountDescription: null,
};

// FullUser fail: invalid dates
export const mockFullUserInvalidDate: FullUser = {
  ...mockFullUser,
  birthday: new Date('invalid'),
  createdDate: new Date('invalid'),
};

// UpdateUser 用モック
export const mockUpdateUser: UpdateUser = {
  name: 'Totoro Updated',
  country: 'Japan',
  accountDescription: 'Forest guardian',
};
