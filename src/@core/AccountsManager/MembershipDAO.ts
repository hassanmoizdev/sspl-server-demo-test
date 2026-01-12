import db from "../utils/db";
import { Prisma } from "@prisma/client";

type MembershipInput = Pick<
  Prisma.MembershipUncheckedCreateInput,
  "acc_id" | "org_id" | "expires_at" | "role" | "plan_id" | "status"
>;

class MembershipDAO {
  static create(data: MembershipInput) {
    return db.membership.create({
      data,
    });
  }

  static update(data: any) {
    return db.membership.update({
      where: {
        acc_id_org_id: {
          acc_id: data?.acc_id,
          org_id: data?.org_id,
        },
      },
      data: {
        ...data,
      },
    });
  }

  static getMany({ skip, take, status }: any) {
    const whereCondition: any = {};

    if (status) {
      whereCondition.status = status;
    }
    return db.$transaction([
      db.membership.findMany({
        where: whereCondition,
        orderBy: {
          created_at: "desc",
        },
        skip: skip ?? 0,
        take: take ?? 10,
        include: {
          membershipPlan:true,
          account: {
            include: {
              user: true,
            },
          },
        },
      }),
      db.membership.count({
        where: whereCondition,
      }),
    ]);
  }

  static getByAccIdAndOrgId({
    acc_id,
    org_id,
  }: {
    acc_id: number;
    org_id: number;
  }) {
    return db.membership.findUnique({
      where: {
        acc_id_org_id: { acc_id, org_id },
      },
    });
  }

  
  static getOnlyById(id: number) {
    return db.membership.findUnique({
      where: {
        id,
      },
    });
  }
}

export default MembershipDAO;
