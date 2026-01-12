
import ContextManagerInterface from './ContextManagerInterface';
import AccountDAO from './AccountDAO';
import MembershipDAO from './MembershipDAO';
import ProfileDAO from './ProfileDAO';
import accountSchema, { passwordSchema, AccountData, PasswordData } from './data-parsers/account-data-parser';
import personSchema, { PersonData } from './data-parsers/person-data-parser';
import profileSchema, { ProfileData } from './data-parsers/profile-data-parser';
import { hashPassword } from '../utils/auth';

const registrationDataSchema = personSchema.extend({
  account: accountSchema.merge(passwordSchema),
  profile: profileSchema.optional()
});

const registrationUpdateSchema = personSchema.partial().extend({
  account: accountSchema.partial().optional(),
  profile: profileSchema.partial().optional()
});

export type UserAccountRegistrationData = PersonData & {
  account: AccountData & PasswordData;
  profile?: ProfileData
};

export type UserAccountUpdateData = Partial<PersonData> & {
  account?: Partial<AccountData>;
  profile?: Partial<ProfileData>;
};

const DEFAULT_PROFILE:ProfileData = {
  contact: {}
};

/**
 * Create User Account
 * @param this 
 * @param data 
 * @returns 
 */
async function create (this:ContextManagerInterface, data:UserAccountRegistrationData) {
  // Parse data.
  const parsedData = registrationDataSchema.parse(data);

  // Check if account already exists.
  if (await AccountDAO.exists(parsedData.account.email))
    throw new Error('An account already exists against this email address.');

  // Encrypt password.
  const pwdHash = await hashPassword(parsedData.account.password);

  // Create account.
  const { account, profile, ...user } = parsedData;
  const newAccount = await AccountDAO.create(
    {...account, password: pwdHash, status: 'ACTIVE'},
    user
  );

  // Create default user profile
  if (!newAccount.user)
    throw new Error('Unable to associate user with the account.');

  const newProfile = await ProfileDAO.create({
    ...(profile||DEFAULT_PROFILE),
    owner_id: newAccount.user.id,
    org_id: this.org.id
  });

  // Create membership
  const membership = await MembershipDAO.create({
    acc_id: newAccount.id,
    org_id: this.org.id,
    role: 'USER',
    expires_at: undefined // TODO: Implement membership and subscriptions.
  });

  return {
    account: newAccount,
    membership,
    profile: newProfile
  };
}

/**
 * Update User Account
 * @param this 
 * @param id 
 * @param data 
 * @returns 
 */
async function update (this:ContextManagerInterface, id:number, data:UserAccountUpdateData) {
  // Parse data.
  const parsedData = registrationUpdateSchema.parse(data);

  const {account, profile, ...user} = parsedData;
  const updatedAccount = await AccountDAO.update(id, (account||{}), user);
  const updatedProfile = await ProfileDAO.update(this.currentUser.id, this.org.id, (profile||{}));

  return {
    account: updatedAccount,
    profile: updatedProfile
  };
}

/**
 * AccountsManager Factory
 * @param ctx 
 * @returns 
 */
function AccountsManager (ctx:ContextManagerInterface) {
  return Object.assign({}, ctx, {
    create,
    update
  });
}

export default AccountsManager;
