
import db from '../utils/db';
import { Prisma } from '@prisma/client';

type ProfileInput = Pick<Prisma.ProfileUncheckedCreateInput, 'title'|'overview'|'pmdc_number'|'org_number'|'institute'|'country'|'owner_id'|'org_id'> & {
  contact?: Pick<Prisma.ContactUncheckedCreateInput, 'email'|'phone'|'whatsapp'|'twitter'|'skype'>;
};

class ProfileDAO {
  static create (data:ProfileInput) {
    return db.profile.create({
      data: {
        ...data,
        contact: data.contact && {
          create: data.contact
        }
      },
      include: {
        contact: {
          omit: {
            email: true,
            phone: true
          }
        }
      }
    });
  }

  static update (owner_id:number, org_id:number, data:Partial<Omit<ProfileInput, 'owner_id'|'org_id'>>) {
    return db.profile.update({
      where: {
        owner_id_org_id: {
          owner_id,
          org_id
        }
      },
      data: {
        ...data,
        contact: data.contact && {
          upsert: {
            update: data.contact,
            create: data.contact
          }
        }
      },
      include: {
        contact: {
          omit: {
            email: true,
            phone: true
          }
        }
      }
    });
  }
}

export default ProfileDAO;
