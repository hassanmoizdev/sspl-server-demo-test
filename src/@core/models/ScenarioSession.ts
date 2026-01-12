import db from "../utils/db";
import { Prisma } from "@prisma/client";

class ScenarioSession {
  static create(data: { scenario_id: number; join_code: string; expires_at: Date }) {
    return db.scenarioSession.create({
      data: {
        scenario_id: data.scenario_id,
        join_code: data.join_code,
        expires_at: data.expires_at,
        status: "PENDING",
      },
    });
  }

  static getByJoinCode(joinCode: string) {
    return db.scenarioSession.findUnique({
      where: { join_code: joinCode },
      include: {
        scenario: {
          include: {
            questions: {
              orderBy: [{ order: 'asc' }, { id: 'asc' }],
              include: {
                options: true
              }
            }
          }
        },
        participants: true
      }
    });
  }

  static addParticipant(
    sessionId: number, 
    name: string, 
    email: string,
    deviceToken?: string,
    devicePlatform?: string
  ) {
    return db.scenarioParticipant.create({
      data: {
        session_id: sessionId,
        name: name,
        email: email,
        device_token: deviceToken,
        device_platform: devicePlatform,
      },
    });
  }

  static submitAnswer(data: { participant_id: number; question_id: number; option_id: number }) {
    return db.scenarioResponse.create({
      data: {
        participant_id: data.participant_id,
        question_id: data.question_id,
        option_id: data.option_id,
      },
    });
  }

  static findExistingAnswer(participantId: number, questionId: number) {
    return db.scenarioResponse.findFirst({
      where: {
        participant_id: participantId,
        question_id: questionId
      }
    });
  }

  static getCorrectOption(questionId: number) {
    return db.scenarioOption.findFirst({
      where: {
        question_id: questionId,
        is_correct: true
      }
    });
  }

  static getResults(sessionId: number) {
    return db.scenarioSession.findUnique({
      where: { id: sessionId },
      include: {
        participants: {
          include: {
            responses: {
              include: {
                question: true,
                option: true
              }
            }
          }
        },
        scenario: {
          include: {
            questions: {
              include: {
                options: true
              }
            }
          }
        }
      }
    });
  }

  static updateStatus(sessionId: number, status: string) {
    return db.scenarioSession.update({
      where: { id: sessionId },
      data: { status }
    });
  }

  static startSession(sessionId: number) {
    const now = new Date();
    return db.scenarioSession.update({
      where: { id: sessionId },
      data: {
        status: 'ACTIVE',
        started_at: now,
        current_question_index: 0,
        current_question_started_at: now
      }
    });
  }

  static updateQuestionIndex(sessionId: number, questionIndex: number) {
    return db.scenarioSession.update({
      where: { id: sessionId },
      data: {
        current_question_index: questionIndex,
        current_question_started_at: new Date()
      }
    });
  }
}

export default ScenarioSession;

