
import db from "./db";

const init = (orgData:any) => {
  return db.organization.upsert({
    where: {
      slug: orgData.slug
    },
    update: orgData,
    create: orgData
  });
}

export default init;
