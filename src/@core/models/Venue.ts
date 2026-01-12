
import db from '../utils/db';

class Venue {
  static create (data:any) {
    return db.venue.create({
      data: {
        ...data,
        creator_id: db.venue.currentUserId(),
        org_id: db.venue.currentUserOrgId() || db.venue.orgId()
      }
    });
  }

  static update (id:number, data:any) {
    return db.venue.update({
      where: {
        id,
        org_id: db.venue.currentUserOrgId() || db.venue.orgId()
      },
      data: data
    });
  }

  static getById (id:number) {
    return db.venue.findFirst({
      where: {
        id,
        org_id: db.venue.currentUserOrgId() || db.venue.orgId()
      },
      omit: {
        created_at: false,
        updated_at: false
      }
    });
  }

  static listAll () {
    return db.venue.findMany({
      where: {
        org_id: db.venue.currentUserOrgId() || db.venue.orgId()
      },
      omit: {
        created_at: false,
        updated_at: false
      }
    });
  }
}

export default Venue;
