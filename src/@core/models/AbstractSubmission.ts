import db from "../utils/db";

class AbstractSubmission {
  static create(acc_id: any, data: any) {
    return db.abstractSubmission.create({
      data: {
        ...data,
        creator_id: acc_id,
      },
    });
  }
  static getMany({ skip, take, status }: any) {
    const whereCondition: any = {};
    if (status) {
      whereCondition.status = status;
    }
    return db.$transaction([
      db.abstractSubmission.findMany({
        where: whereCondition,
        orderBy: {
          created_at: "desc",
        },
        skip: skip ?? 0,
        take: take ?? 10,
        include: {
          conference: true,
          meeting: true,
        },
      }),
      db.abstractSubmission.count(),
    ]);
  }

  static update(data: any) {
    return db.abstractSubmission.update({
      where: {
        id: data?.id,
      },
      data: {
        ...data,
      },
    });
  }
}

export default AbstractSubmission;
