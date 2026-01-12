
import db from '../utils/db';

class ProfileDAO {
  static getById (owner_id:number, org_id:number) {
    return db.profile.findUnique({
      where: {
        owner_id_org_id: {
          owner_id,
          org_id
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
