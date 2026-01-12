import { RequestHandler } from "express";
import {
  createScenario,
  getScenario,
  listScenarios,
  createSession,
  getSessionByJoinCode,
  joinSession,
  autoJoinSession,
  submitAnswer,
  getSessionResults,
  deleteScenario,
  getLeaderboard,
  startSession,
  nextQuestion
} from "../../@core/services/scenarios.service";

export const handleCreateScenario: RequestHandler = async (req, res, next) => {
  try {
    const data = req.body;
    const scenario = await createScenario(data);
    res.status(201).json(scenario);
  } catch (err) {
    next(err);
  }
};

export const handleGetScenario: RequestHandler = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const scenario = await getScenario(id);
    if (!scenario) throw new Error("Scenario not found");
    res.json(scenario);
  } catch (err) {
    next(err);
  }
};

export const handleListScenarios: RequestHandler = async (req, res, next) => {
  try {
    const scenarios = await listScenarios();
    res.json(scenarios);
  } catch (err) {
    next(err);
  }
};

export const handleDeleteScenario: RequestHandler = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await deleteScenario(id);
    res.json({ message: "Scenario deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const handleCreateSession: RequestHandler = async (req, res, next) => {
  try {
    const scenarioId = parseInt(req.params.id);
    const data = req.body;
    const session = await createSession({ ...data, scenario_id: scenarioId });
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
};

export const handleGetSessionDetails: RequestHandler = async (req, res, next) => {
  try {
    const { joinCode } = req.params;
    const session = await getSessionByJoinCode(joinCode);
    
    // Optional: Check if user is authenticated and already joined
    let currentParticipant = null;
    if (req.user?.id) {
      const db = (await import("../../@core/utils/db")).default;
      const user = await db.person.findUnique({
        where: { id: req.user.id },
        include: { account: true }
      });
      
      if (user?.account) {
        currentParticipant = await db.scenarioParticipant.findFirst({
          where: {
            session_id: session.id,
            email: user.account.email
          }
        });
      }
    }
    
    res.json({
      ...session,
      currentParticipant
    });
  } catch (err) {
    next(err);
  }
};

export const handleJoinSession: RequestHandler = async (req, res, next) => {
  try {
    const { joinCode } = req.params;
    const data = req.body;
    const participant = await joinSession(joinCode, data);
    res.status(201).json(participant);
  } catch (err) {
    next(err);
  }
};

export const handleAutoJoinSession: RequestHandler = async (req, res, next) => {
  try {
    const { joinCode } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    const participant = await autoJoinSession(joinCode, userId);
    res.status(201).json(participant);
  } catch (err) {
    next(err);
  }
};

export const handleSubmitAnswer: RequestHandler = async (req, res, next) => {
  try {
    const { joinCode } = req.params;
    const data = req.body;
    const response = await submitAnswer(joinCode, data);
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
};

// handlers.ts

export const handleGetSessionResults: RequestHandler = async (req, res, next) => {
  try {
    const { joinCode } = req.params;
    const session: any = await getSessionResults(joinCode);

    // FIX: Map over participants, not responses. 
    // This ensures users with 0 responses still appear in the list.
    const leaderboardData = session.participants.map((p: any) => {
      // Calculate score server-side
      const score = p.responses ? p.responses.reduce((acc: number, r: any) => {
        return acc + (r.option?.is_correct ? 1 : 0);
      }, 0) : 0;

      return {
        id: p.id,
        name: p.name,
        score: score
      };
    });

    // Optional: Sort by score descending (highest first)
    leaderboardData.sort((a: any, b: any) => b.score - a.score);

    res.json(leaderboardData);
  } catch (err) {
    next(err);
  }
};
export const handleGetLeaderboard: RequestHandler = async (req, res, next) => {
  try {
    const { joinCode } = req.params;
    const leaderboard = await getLeaderboard(joinCode);
    res.json(leaderboard);
  } catch (err) {
    next(err);
  }
};

export const handleStartSession: RequestHandler = async (req, res, next) => {
  try {
    const { joinCode } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new Error('Authentication required');
    }

    const session = await startSession(joinCode, userId);
    res.json(session);
  } catch (err) {
    next(err);
  }
};

export const handleNextQuestion: RequestHandler = async (req, res, next) => {
  try {
    const { joinCode } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new Error('Authentication required');
    }

    const session = await nextQuestion(joinCode, userId);
    res.json(session);
  } catch (err) {
    next(err);
  }
};

