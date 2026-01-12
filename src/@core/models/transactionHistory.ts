import { rolesDBKeys } from "../../@core/utils/constant";
import db from "../utils/db";

class TransactionHistory {
  static create(data: any) {
    return db.transactionHistory.create({
      data: {
        ...data,
      },
    });
  }

  static getOnlyById(id: number) {
    return db.transactionHistory.findUnique({
      where: {
        id,
      },
    });
  }

  static getOnlyByMembershipId(id: number) {
    return db.transactionHistory.findFirst({
      where: {
        membership_id: id,
      },
    });
  }

  static getMany({ skip, take, status, user }: any) {
    const whereCondition: any = {};

    if (status) {
      whereCondition.status = status;
    }

    if (user?.role !== rolesDBKeys?.SUPER_ADMIN) {
      whereCondition.payer_id = user?.id;
    }

    return db.$transaction([
      db.transactionHistory.findMany({
        where: whereCondition,
        orderBy: {
          created_at: "desc",
        },
        skip: skip ?? 0,
        take: take ?? 10,
        include: {
          payer: {
            include: {
              account: true,
            },
          },
          membership: {
            include: {
              membershipPlan: true,
              account: true,
            },
          },
        },
      }),
      db.transactionHistory.count({
        where: whereCondition,
      }),
    ]);
  }
}

export default TransactionHistory;
