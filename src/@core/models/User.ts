
import db from '../utils/db';

class User {
  static getProfile () {
    return db.person.findUnique({
      where: {
        id: db.person.currentUserId()
      },
      omit: {
        id: true,
        acc_id: true,
        prefix: true
      },
      include: {
        account: {
          select: {
            email: true,
            phone: true
          }
        },
        profiles: {
          where: {
            org_id: db.person.currentUserOrgId() || db.person.orgId(),
          },
          include: {
            contact: {
              omit: {
                email: true,
                phone: true
              }
            }
          }
        }
      }
    });
  }

  static updateProfile (data:any) {
    return db.person.update({
      where: {
        id: db.person.currentUserId()
      },
      data: {
        ...data,
        profile: undefined,
        account: data.account && {
          update: data.account
        },
        profiles: data.profile && {
          upsert: {
            where: {
              owner_id_org_id: {
                owner_id: db.person.currentUserId(),
                org_id: db.person.currentUserOrgId() || db.person.orgId()
              }
            },
            create: {
              ...data.profile,
              org_id: db.person.currentUserOrgId() || db.person.orgId(),
              contact: data.profile.contact && {
                create: data.profile.contact
              }
            },
            update: {
              ...data.profile,
              contact: data.profile.contact && {
                update: data.profile.contact
              }
            }
            
          }
        }
      },
      omit: {
        id: true,
        acc_id: true,
        prefix: true
      },
      include: {
        account: {
          select: {
            email: true,
            phone: true
          }
        },
        profiles: {
          where: {
            org_id: db.person.currentUserOrgId() || db.person.orgId(),
          },
          include: {
            contact: {
              omit: {
                email: true,
                phone: true
              }
            }
          }
        }
      }
    });
  }
}

export default User;
