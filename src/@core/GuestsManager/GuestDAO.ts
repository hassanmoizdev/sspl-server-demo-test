
import db from '../utils/db';
import { Prisma } from '@prisma/client';

type GuestInput = Pick<Prisma.GuestUncheckedCreateInput, 'email'|'person_id'|'creator_id'|'org_id'>;

class GuestDAO {
  static create (data:GuestInput) {
    return db.guest.create({
      data,
      include: {
        person: {
          include: {
            profiles: {
              where: {
                org_id: data.org_id
              },
              include: {
                contact: true
              }
            }
          }
        }
      }
    });
  }
}

export default GuestDAO;
