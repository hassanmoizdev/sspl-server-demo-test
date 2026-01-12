import db from "../utils/db";
import { Prisma } from "@prisma/client";

type QuestionResponseOptionInput = Pick<
  Prisma.QuestionResponseOptionUncheckedCreateInput,
  "label" | "value"
>;
type QuestionInput = Pick<
  Prisma.QuestionUncheckedCreateInput,
  "statement" | "description" | "type"
> & {
  options?: QuestionResponseOptionInput[];
  statements?: QuestionInput[];
};
type QuestionGroupInput = Pick<
  Prisma.QuestionGroupUncheckedCreateInput,
  "title" | "description"
> & {
  questions?: QuestionInput[];
};
export type QuestionnaireInput = Pick<
  Prisma.QuestionnaireUncheckedCreateInput,
  "title" | "description" | "conference_id"
> & {
  question_groups?: QuestionGroupInput[];
};

type ResponseInput = Pick<
  Prisma.QuestionResponseUncheckedCreateInput,
  "question_id" | "value"
>;

type SubmissionQuery = {
  submitter_id?: number;
  session_id?: number | null;
  conference_id?: number | null;
};

class Questionnaire {
  static create(data: QuestionnaireInput) {
    return db.questionnaire.create({
      data: {
        ...data,
        question_groups: data.question_groups && {
          create: data.question_groups.map((group) => ({
            ...group,
            questions: group.questions && {
              create: group.questions.map((q) => ({
                ...q,
                options: q.options && {
                  create: q.options.map((op) => ({
                    ...op,
                  })),
                },
                statements: q.statements && {
                  create: q.statements.map((s) => ({
                    statement: s.statement,
                    description: s.description,
                  })),
                },
              })),
            },
          })),
        },
        creator_id: db.questionnaire.currentUserId(),
        org_id: db.questionnaire.currentUserOrgId() || db.questionnaire.orgId(),
      },
      include: {
        question_groups: {
          include: {
            questions: {
              include: {
                options: true,
                statements: {
                  omit: {
                    type: true,
                    description: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  static getByQuery(query: any) {
    return db.questionnaire.findFirst({
      where: {
        ...query,
        org_id: db.questionnaire.currentUserOrgId() || db.questionnaire.orgId(),
      },
      include: {
        question_groups: {
          include: {
            questions: {
              include: {
                options: true,
                statements: {
                  omit: {
                    type: true,
                    description: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  static getAllWithQuestions() {
    return db.questionnaire.findMany({
      where: {
        org_id: db.questionnaire.currentUserOrgId() || db.questionnaire.orgId(),
      },
      include: {
        conference: true,
        question_groups: {
          include: {
            questions: {
              include: {
                options: true,
                statements: {
                  select: {
                    id: true,
                    statement: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  static list() {
    return db.questionnaire.findMany({
      where: {
        org_id: db.questionnaire.currentUserOrgId() || db.questionnaire.orgId(),
      },
    });
  }

  static getSubmission(query: SubmissionQuery) {
    return db.questionnaireSubmission.findFirst({
      where: {
        ...query,
        submitter_id: db.questionnaireSubmission.currentUserId(),
      },
    });
  }

  static getSubmissionConferenceResult(condition: any) {
    const where: any = {};

    if (condition.submitter_id) {
      where.submitter_id = condition.submitter_id;
    }

    if (condition.conference_id) {
      where.conference_id = condition.conference_id;
    }

    if (condition.session_id) {
      where.session_id = condition.session_id;
    }
    return db.questionnaireSubmission.findMany({
      where: where,
      include: {
        submitted_by: true,
        session: true,
        conference: true,
        responses: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
            submission: true,
          },
        },
      },
    });
  }

  static getConferenceSubmitterList({
    conference_id,
    session_id,
    paging,
  }: any) {
    const where: any = {};

    if (conference_id) {
      where.conference_id = conference_id;
    }

    if (session_id) {
      where.session_id = session_id;
    }
    
    return db.$transaction([
      db.questionnaireSubmission.findMany({
        where: where,
        skip: paging?.skip ?? 0,
        take: paging?.take ?? 10,
        include: {
          submitted_by: {
            include: {
              account: {
                select: {
                  email: true,
                  phone: true,
                },
              },
            },
          },
          session: true,
          conference: true,
          responses: {
            include: {
              question: {
                include: {
                  options: true,
                },
              },
              submission: true,
            },
          },
        },
      }),
      db.questionnaireSubmission.count({
        where: where,
      }),
    ]);
  }

  static getSubmissionOverallConferenceResult() {
    return db.questionnaireSubmission.findMany({
      include: {
        submitted_by: true,
        session: true,
        conference: true,
        responses: {
          include: {
            question: true,
          },
        },
      },
    });
  }

  static createSubmition(
    data: ResponseInput[],
    target: { session_id?: number | null; conference_id?: number | null }
  ) {
    return db.questionnaireSubmission.create({
      data: {
        ...target,
        submitter_id: db.questionResponse.currentUserId(),
        responses: {
          create: data.map((r) => ({
            ...r,
          })),
        },
      },
    });
  }
}

export default Questionnaire;
