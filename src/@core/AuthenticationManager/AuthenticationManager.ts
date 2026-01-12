
import ContextManagerInterface from './ContextManagerInterface';
import AccountDAO from './AccountDAO';
import ProfileDAO from './ProfileDAO';
import { verifyPassword } from '../utils/auth';

async function login (this:ContextManagerInterface, email:string, password:string) {
  const account = await AccountDAO.getByEmail(email, this.org.id);

  if (!account || !(await verifyPassword(password, account.password)))
    throw new Error('Invalid credentials.');

  const membership = account.memberships.at(0);

  if (!membership)
    throw new Error('You are not a member of this organization.');

  if (!account.user)
    throw new Error('This account has no associated user.');

  const profile = await ProfileDAO.getById(account.user.id, this.org.id);

  return {
    account: { ...account, password: undefined },
    membership,
    profile
  };
}

function AuthenticationManager (ctx:ContextManagerInterface) {
  return Object.assign({}, ctx, {
    login
  });
}

export default AuthenticationManager;
