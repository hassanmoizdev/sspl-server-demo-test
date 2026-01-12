
import db from '../utils/db';

class Profile {
  static update (data:any) {
    return db.profile.upsert({
      where: {
        owner_id_org_id: {
          owner_id: db.profile.currentUserId(),
          org_id: db.profile.currentUserOrgId() || db.profile.orgId()
        }
      },
      create: {
        ...data,
        contact: data.contact && {
          create: data.contact
        },
        owner_id: db.profile.currentUserId(),
        org_id: db.profile.currentUserOrgId() || db.profile.orgId()
      },
      update: {
        ...data,
        contact: data.contact && {
          upsert: {
            where: {
              person_id: db.profile.currentUserId(),
              org_id: db.profile.currentUserOrgId() || db.profile.orgId()
            },
            create: data.contact,
            update: data.contact
          }
        }
      },
      include: {
        contact: true
      }
    });
  }

  // static update (data:any) {
  //   return db.profile.update({
  //     where: {
  //       owner_id_org_id: {
  //         owner_id: db.profile.currentUserId(),
  //         org_id: db.profile.currentUserOrgId() || db.profile.orgId()
  //       }
  //     },
  //     data: {
  //       ...data,
  //       contact: data.contact && {
  //         upsert: {
  //           where: {
  //             person_id: db.profile.currentUserId(),
  //             org_id: db.profile.currentUserOrgId() || db.profile.orgId()
  //           },
  //           update: data.contact,
  //           create: data.contact
  //         }
  //       }
  //     },
  //     include: {
  //       contact: true
  //     }
  //   });
  // }

  static async getProfile () {
    const profile = await db.profile.findFirst({
      where: {
        owner_id: db.profile.currentUserId(),
        org_id: db.profile.currentUserOrgId() || db.profile.orgId()
      },
      include: {
        contact: true
      }
    });

    if (profile)
      return profile;

    return Profile.update({ contact: {} });
  }
}

export default Profile;
