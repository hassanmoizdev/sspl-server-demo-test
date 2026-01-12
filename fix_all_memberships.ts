
import db from './src/@core/utils/db';

async function fixAll() {
  try {
    const rootOrg = await db.organization.findUnique({ where: { slug: 'sspl' } });
    if (!rootOrg) {
      console.log('Root org not found.');
      return;
    }
    
    console.log(`Root Org (sspl) ID: ${rootOrg.id}`);
    
    // Find memberships that don't match root org ID
    const mismatched = await db.membership.findMany({
      where: {
        org_id: { not: rootOrg.id }
      }
    });
    
    console.log(`Found ${mismatched.length} mismatched memberships.`);
    
    for (const mem of mismatched) {
      console.log(`Fixing membership ID ${mem.id} (matching it to org_id ${rootOrg.id})...`);
      await db.membership.update({
        where: { id: mem.id },
        data: { org_id: rootOrg.id }
      });
    }
    
    console.log('All mismatched memberships have been fixed.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

fixAll();
