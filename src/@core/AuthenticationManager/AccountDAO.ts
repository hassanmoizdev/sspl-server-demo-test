
import db from '../utils/db';
// import { Prisma } from '@prisma/client';

class AccountDAO {
  static getByEmail (email:string, org_id:number) {
    return db.account.findUnique({
      where: { email },
      omit: {
        password: false
      },
      include: {
        user: true,
        memberships: {
          where: { org_id }
        }
      }
    });
  }
}

export default AccountDAO;
