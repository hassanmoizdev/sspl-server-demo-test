import db from "../utils/db";

class MembershipPlan {
  static create(data: any) {
    return db.membershipPlan.create({
      data: {
        ...data,
      },
    });
  }
  static getMany({ skip, take }: any) {
    return db.$transaction([
      db.membershipPlan.findMany({
        where: {},
        orderBy: {
          created_at: "desc",
        },
        skip: skip ?? 0,
        take: take ?? 10,
      }),
      db.membershipPlan.count(),
    ]);
  }

  static getOnlyById(id: number) {
    return db.membershipPlan.findUnique({
      where: {
        id,
      },
    });
  }

  static getSingle(id: number) {
    return db.membershipPlan.findUnique({
      where: {
        id,
      },
    });
  }

  static update(plan_id: number, data: any) {
    return db.membershipPlan.update({
      where: {
        id: plan_id,
      },
      data: {
        ...data,
      },
    });
  }
}

export default MembershipPlan;
