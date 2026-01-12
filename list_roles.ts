
import db from './src/@core/utils/db';

async function listUsers() {
  try {
    const roles = await db.membership.findMany({
      include: {
        account: {
          select: {
            email: true
          }
        }
      }
    });
    
    console.log('User Roles:');
    roles.forEach(r => {
      console.log(`${r.account.email}: ${r.role} (Org: ${r.org_id})`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

listUsers();
