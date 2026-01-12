
import db from '../utils/db';

class Guest {
  static async exists(email:string) {
    const guest = await db.guest.findFirst({
      where: {
        email,
        org_id: db.guest.currentUserOrgId() || db.guest.orgId()
      }
    });

    return !!guest;
  }

  static async create(data:any) {
    const person = await db.person.create({
      data: {
        prefix: data.prefix,
        first_name: data.first_name,
        last_name: data.last_name,
        gender: data.gender,
        profiles: data.profile && {
          create: {
            ...data.profile,
            contact: data.profile.contact && {
              create: data.profile.contact
            },
            org_id: db.profile.currentUserOrgId() || db.guest.orgId()
          }
        }
      }
    });

    return db.guest.create({
      data: {
        email: data.email,
        person_id: person.id,
        creator_id: db.guest.currentUserId(),
        org_id: db.guest.currentUserOrgId() || db.guest.orgId()
      },
      include: {
        person: {
          include: {
            profiles: {
              where: { org_id: db.guest.currentUserOrgId() || db.guest.orgId() },
              include: {
                contact: true
              }
            }
          }
        }
      }
    });
  }

  static update(id:number, data:any) {
    return db.guest.update({
      where: {
        id
      },
      data: {
        email: data.email || undefined
      },
      include: {
        person: {
          include: {
            profiles: {
              where: {
                org_id: db.guest.currentUserOrgId() || db.guest.orgId()
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

  static getById(id:number) {
    return db.guest.findFirst({
      where: {
        id,
        org_id: db.guest.currentUserOrgId() || db.guest.orgId()
      },
      omit: {
        created_at: false,
        updated_at: false
      },
      include: {
        person: {
          include: {
            profiles: {
              where: {
                org_id: db.guest.currentUserOrgId() || db.guest.orgId()
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

  static listAll() {
    return db.guest.findMany({
      where: {
        org_id: db.guest.currentUserOrgId() || db.guest.orgId()
      },
      omit: {
        created_at: false,
        updated_at: false
      },
      include: {
        person: {
          include: {
            profiles: {
              where: {
                org_id: db.guest.currentUserOrgId() || db.guest.orgId()
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

  static delete (id:number) {
    return db.guest.delete({
      where: {
        id
      }
    });
  }
}

export default Guest;