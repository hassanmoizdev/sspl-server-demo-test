
import User from '../models/User';
import profileSchema from '../validators/profile-data-validator';
import accountSchema from '../validators/account-data-validator';
import personSchema from '../validators/person-data-validator';

export const updateProfile = async (data:any) => {
  const parser = personSchema.partial().extend({
    account: accountSchema.partial().optional(),
    profile: profileSchema.partial().optional()
  });

  const updatedUser = await User.updateProfile(parser.parse(data));
  const { profiles, account, ...person } = updatedUser;

  return {
    ...person,
    profile: profiles[0],
    account
  };
};

export const getProfile = async () => {
  const user = await User.getProfile();
  if (!user)
    throw new Error('Profile not found');

  const { profiles, account, ...person } = user;

  return {
    ...person,
    profile: profiles[0],
    account
  };
};
