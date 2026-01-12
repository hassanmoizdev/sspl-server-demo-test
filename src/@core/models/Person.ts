
import db from '../utils/db';

class Person {
  static update (id:number, data:any) {
    return db.person.update({
      where: {
        id
      },
      data: {
        ...data,
        email: undefined, // TODO: Should update on guest table instead.
        profile: undefined, // TODO: Should create alias fields?
        profiles: data.profile && {
          update: {
            where: {
              owner_id_org_id: {
                owner_id: id,
                org_id: db.person.currentUserOrgId() || db.person.orgId()
              }
            },
            data: {
              ...data.profile,
              contact: data.profile.contact && {
                update: {
                  where: {
                    person_id: id,
                    org_id: db.person.currentUserOrgId() || db.person.orgId()
                  },
                  data: data.profile.contact
                }
              }
            }
          }
        }
      },
      include: {
        profiles: {
          where: {
            org_id: db.person.currentUserOrgId() || db.person.orgId()
          },
          include: {
            contact: true
          }
        }
      }
    });
  }
}

export default Person;
