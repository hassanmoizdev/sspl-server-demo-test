import db from "../utils/db";
import { Prisma } from "@prisma/client";

export type ScenarioInput = Pick<
  Prisma.ScenarioUncheckedCreateInput,
  "title" | "description"
> & {
  questions?: (Pick<
    Prisma.ScenarioQuestionUncheckedCreateInput,
    "statement" | "description" | "type" | "order"
  > & {
    options?: Pick<Prisma.ScenarioOptionUncheckedCreateInput, "label" | "is_correct">[];
  })[];
};

class Scenario {
  static create(data: ScenarioInput) {
    const creatorId = db.scenario.currentUserId();
    const orgId = db.scenario.currentUserOrgId() || db.scenario.orgId();

    if (isNaN(creatorId)) {
      throw new Error("Invalid User ID (NaN) in context. Please check your authentication token.");
    }

    return db.scenario.create({
      data: {
        title: data.title,
        description: data.description,
        creator_id: creatorId,
        org_id: orgId,
        questions: data.questions && {
          create: data.questions.map((q) => ({
            statement: q.statement,
            description: q.description,
            type: q.type,
            order: q.order,
            options: q.options && {
              create: q.options.map((op) => ({
                label: op.label,
                is_correct: op.is_correct,
              })),
            },
          })),
        },
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });
  }

  static getById(id: number) {
    return db.scenario.findFirst({
      where: {
        id,
        org_id: db.scenario.currentUserOrgId() || db.scenario.orgId(),
      },
      include: {
        questions: {
          orderBy: {
            order: 'asc'
          },
          include: {
            options: true,
          },
        },
      },
    });
  }

  static list() {
    return db.scenario.findMany({
      where: {
        org_id: db.scenario.currentUserOrgId() || db.scenario.orgId(),
      },
      orderBy: {
        created_at: 'desc'
      },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });
  }

  static delete(id: number) {
    return db.scenario.delete({
      where: {
        id,
        org_id: db.scenario.currentUserOrgId() || db.scenario.orgId(),
      },
    });
  }
}

export default Scenario;
