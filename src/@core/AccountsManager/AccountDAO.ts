
import db from '../utils/db';
import { Prisma, Account, Person } from '@prisma/client';

type AccountInput = Pick<Prisma.AccountUncheckedCreateInput, 'email'|'phone'|'password'|'status'>;
type PersonInput = Pick<Prisma.PersonUncheckedCreateInput, 'prefix'|'first_name'|'last_name'|'gender'>;

class AccountDAO {
  static exists (email:string) {
    return db.account.findUnique({
      where: { email }
    });
  }

  static create (data:AccountInput, user:PersonInput) {
    return db.account.create({
      data: {
        ...data,
        user: {
          create: user
        }
      },
      include: {
        user: true
      }
    });
  }

  static update (id:number, data:Partial<AccountInput>, user?:Partial<PersonInput>) {
    return db.account.update({
      where: { id },
      data: {
        ...data,
        user: user && {
          update: user
        }
      },
      include: {
        user: true
      }
    });
  }
}

export default AccountDAO;
