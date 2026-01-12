
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
    
    console.log('Account found:', JSON.stringify({
      id: acc.id,
      email: acc.email,
      status: acc.status
    }, null, 2));
    
    console.log('Memberships found:', JSON.stringify(acc.memberships, null, 2));
    
    if (acc.memberships.length === 0) {
      console.log('WARNING: This user has NO memberships. This is why the login fails even with the fallback.');
      
      // Attempt to fix by creating a default membership for the root org
      console.log('Attempting to fix by creating a default membership for root org...');
      const rootOrg = await db.organization.findUnique({ where: { slug: 'sspl' } });
      if (rootOrg) {
        await db.membership.create({
          data: {
            acc_id: acc.id,
            org_id: rootOrg.id,
            role: 'SUPER_ADMIN',
            status: 'ACTIVE'
          }
        });
        console.log('Default SUPER_ADMIN membership created for root org.');
      } else {
        console.log('Root organization (slug: sspl) not found. Cannot create membership.');
      }
    }
  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    process.exit();
  }
}

verify();
