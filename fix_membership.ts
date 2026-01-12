
import Account from './src/@core/models/Account';
import db from './src/@core/utils/db';

async function verify() {
  const email = 'super_admin@gmail.com';
  console.log(`Checking account for: ${email}`);
  
  try {
    const acc = await Account.getByEmailWithAllMemberships(email);
    if (!acc) {
      console.log('Account not found!');
      return;
    }
    
    console.log('Account status:', acc.status);
    console.log('Memberships:', JSON.stringify(acc.memberships, null, 2));
    
    const rootOrg = await db.organization.findUnique({ where: { slug: 'sspl' } });
    console.log('Root Org (sspl):', JSON.stringify(rootOrg, null, 2));
    
    if (acc.memberships.length > 0) {
      const memOrgId = acc.memberships[0].org_id;
      if (rootOrg && memOrgId !== rootOrg.id) {
        console.log(`CRITICAL: Membership Org ID (${memOrgId}) does NOT match Root Org ID (${rootOrg.id})`);
        console.log('Attempting to fix by updating membership org_id...');
        await db.membership.update({
          where: { id: acc.memberships[0].id },
          data: { org_id: rootOrg.id }
        });
        console.log('Membership org_id updated to match root org.');
      } else if (rootOrg && memOrgId === rootOrg.id) {
        console.log('Membership Org ID matches Root Org ID. The data seems correct.');
      }
    } else {
      console.log('No memberships found. Creating one...');
      if (rootOrg) {
        await db.membership.create({
          data: {
            acc_id: acc.id,
            org_id: rootOrg.id,
            role: 'SUPER_ADMIN',
            status: 'ACTIVE'
          }
        });
        console.log('Default membership created.');
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

verify();
