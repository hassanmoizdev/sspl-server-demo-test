
import db from '../utils/db';
import { Prisma } from '@prisma/client';

type PersonInput = Pick<Prisma.PersonUncheckedCreateInput, 'prefix'|'first_name'|'last_name'|'gender'>;
type ProfileInput = Pick<Prisma.ProfileUncheckedCreateInput, 'title'|'overview'|'pmdc_number'|'org_number'|'institute'|'country'|'org_id'> & {
  contact?: Pick<Prisma.ContactUncheckedCreateInput, 'email'|'phone'|'whatsapp'|'twitter'|'skype'>;
};

class PersonDAO {
  static create (data:PersonInput, profile?:ProfileInput) {
    return db.person.create({
      data: {
        ...data,
        profiles: profile && {
          create: {
            ...profile,
            contact: profile.contact && {
              create: profile.contact
            }
          }
        }
      },
      include: {
        profiles: {
          where: {
            org_id: profile?.org_id
          },
          include: {
            contact: true
          }
        }
      }
    });
  }
}

export default PersonDAO;
