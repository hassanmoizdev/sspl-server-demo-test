import QRCode from "qrcode";
import { randomBytes } from "crypto";
import Scenario from "../models/Scenario";
import ScenarioSession from "../models/ScenarioSession";
import { createScenarioSchema, createSessionSchema, joinSessionSchema, submitAnswerSchema } from "../validators/scenario-validator";
import { SessionNotFoundError, SessionExpiredError, DuplicateAnswerError } from "../errors/ApiError";
import db from "../utils/db";
import { triggerPusherEvent } from "../utils/pusher";
import { sendSessionStartNotification, sendSessionInviteNotification } from "./notification.service";

export const generateJoinCode = () => {
  return randomBytes(3).toString('hex').toUpperCase(); // 6 character code
};

export const createScenario = async (data: any) => {
  const payload = data?.data || data;
  const validatedData = createScenarioSchema.parse(payload);
  return Scenario.create(validatedData);
};

export const createSession = async (data: any) => {
  const payload = data?.data || data;
  const validatedData = createSessionSchema.parse(payload);
  const joinCode = generateJoinCode();
  
  const sess = await ScenarioSession.create({
    scenario_id: validatedData.scenario_id,
    join_code: joinCode,
    expires_at: new Date(validatedData.expires_at)
  });

  const frontendUrl = process.env.FRONTEND_URL || process.env.REACT_APP_BASE_URL || "http://localhost:3000";
  const joinUrl = `${frontendUrl}/join/${joinCode}`;
  const qrCode = await QRCode.toDataURL(joinUrl);

  // Get scenario details for notification
  const scenario = await db.scenario.findUnique({
    where: { id: validatedData.scenario_id },
    select: { title: true }
  });

  // Trigger Pusher event for session creation
  await triggerPusherEvent(`session-${joinCode}`, 'session-created', {
    session_id: sess.id,
    join_code: joinCode,
    scenario_title: scenario?.title || 'Quiz Session',
    join_url: joinUrl,
    created_at: sess.created_at.toISOString(),
    expires_at: sess.expires_at.toISOString()
  });

  // Get all users with device tokens to send invite notification
  const allUsers = await db.person.findMany({
    where: {
      device_token: { not: null },
      device_platform: { not: null }
    },
    select: {
      device_token: true,
      device_platform: true
    }
  });

  // Send broadcast notification to all app users
  if (allUsers.length > 0 && scenario) {
    await sendSessionInviteNotification(allUsers, {
      join_code: joinCode,
      scenario_title: scenario.title,
      join_url: joinUrl
    });
  }

  return {
    ...sess,
    join_url: joinUrl,
    qr_code: qrCode
  };
};

export const getSessionByJoinCode = async (joinCode: string) => {
  const session = await ScenarioSession.getByJoinCode(joinCode);
  if (!session) {
    throw SessionNotFoundError();
  }
  
  if (new Date() > session.expires_at) {
    throw SessionExpiredError();
  }

  // Generate join_url and qr_code
  const frontendUrl = process.env.FRONTEND_URL || process.env.REACT_APP_BASE_URL || "http://localhost:3000";
  const joinUrl = `${frontendUrl}/join/${joinCode}`;
  const qrCode = await QRCode.toDataURL(joinUrl);

  // Format response to match frontend expectations
  return {
    id: session.id,
    scenario_id: session.scenario_id,
    join_code: session.join_code,
    join_url: joinUrl,
    qr_code: qrCode,
    status: session.status,
    started_at: session.started_at?.toISOString(),
    current_question_index: session.current_question_index,
    current_question_started_at: session.current_question_started_at?.toISOString(),
    expires_at: session.expires_at.toISOString(),
    created_at: session.created_at.toISOString(),
    time_per_question: 30,
    questions: session.scenario.questions.map(q => ({
      id: q.id,
      statement: q.statement,
      order: q.order,
      options: q.options.map(o => ({
        id: o.id,
        label: o.label,
        is_correct: o.is_correct
      }))
    }))
  };
};

export const joinSession = async (joinCode: string, data: any) => {
  const session = await getSessionByJoinCode(joinCode);
  const payload = data?.data || data;
  const validatedData = joinSessionSchema.parse(payload);
  
  return ScenarioSession.addParticipant(
    session.id, 
    validatedData.name, 
    validatedData.email,
    validatedData.device_token,
    validatedData.device_platform
  );
};

export const autoJoinSession = async (joinCode: string, userId: number) => {
  // 1. Get session by join code (validates session exists and not expired)
  const session = await getSessionByJoinCode(joinCode);
  
  // 2. Get user details from Person table with Account
  const user = await db.person.findUnique({
    where: { id: userId },
    include: {
      account: true
    }
  });
  
  if (!user || !user.account) {
    throw new Error("User not found or account not linked");
  }
  
  // 3. Construct name and email
  const name = `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`.trim();
  const email = user.account.email;
  
  // 4. Check if user already joined this session (by email)
  const existingParticipant = await db.scenarioParticipant.findFirst({
    where: {
      session_id: session.id,
      email: email
    }
  });
  
  if (existingParticipant) {
    // Return existing participant with session join URL
    return {
      ...existingParticipant,
      join_url: session.join_url
    };
  }
  
  // 5. Create new participant
  const participant = await ScenarioSession.addParticipant(session.id, name, email);
  
  // 6. Return participant with session join URL for auto-navigation
  return {
    ...participant,
    join_url: session.join_url
  };
};

export const submitAnswer = async (joinCode: string, data: any) => {
  const session = await ScenarioSession.getByJoinCode(joinCode);
  if (!session) {
    throw SessionNotFoundError();
  }

  const payload = data?.data || data;
  const validatedData = submitAnswerSchema.parse(payload);
  
  // 1. Validate session is active
  if (session.status !== 'ACTIVE') {
    throw new Error('Session is not active');
  }

  // 2. Get question and verify it exists
  const question = await db.scenarioQuestion.findUnique({
    where: { id: validatedData.question_id },
    include: { scenario: true }
  });

  if (!question) {
    throw new Error('Question not found');
  }

  // 3. Get question index
  const questions = await db.scenarioQuestion.findMany({
    where: { scenario_id: question.scenario_id },
    orderBy: [{ order: 'asc' }, { id: 'asc' }]
  });

  const questionIndex = questions.findIndex(q => q.id === validatedData.question_id);

  // 4. Verify question matches current session index
  if (questionIndex !== session.current_question_index) {
    throw new Error(`Question does not match current session question. (Session: ${session.current_question_index}, Provided: ${questionIndex})`);
  }

  // 5. Check timer (30 seconds)
  if (session.current_question_started_at) {
    const now = new Date();
    const elapsed = (now.getTime() - new Date(session.current_question_started_at).getTime()) / 1000;

    if (elapsed > 30) {
      throw new Error('Question timer expired');
    }
  }
  
  // 6. Check for duplicate submission
  const existingAnswer = await ScenarioSession.findExistingAnswer(
    validatedData.participant_id,
    validatedData.question_id
  );
  
  if (existingAnswer) {
    throw DuplicateAnswerError();
  }
  
  // 7. Get the correct option to determine if answer is correct
  const correctOption = await ScenarioSession.getCorrectOption(validatedData.question_id);
  const isCorrect = correctOption?.id === validatedData.option_id;
  
  const response = await ScenarioSession.submitAnswer(validatedData);
  
  return {
    id: response.id,
    participant_id: response.participant_id,
    question_id: response.question_id,
    option_id: response.option_id,
    is_correct: isCorrect,
    submitted_at: response.created_at.toISOString()
  };
};

export const getScenario = (id: number) => {
  return Scenario.getById(id);
};

export const listScenarios = () => {
  return Scenario.list();
};

export const deleteScenario = (id: number) => {
  return Scenario.delete(id);
};

export const getSessionResults = async (joinCode: string) => {
  const session = await ScenarioSession.getByJoinCode(joinCode);
  if (!session) throw SessionNotFoundError();
  return ScenarioSession.getResults(session.id);
};

export const getLeaderboard = async (joinCode: string) => {
  const session = await ScenarioSession.getByJoinCode(joinCode);
  if (!session) {
    throw SessionNotFoundError();
  }
  
  const results = await ScenarioSession.getResults(session.id);
  if (!results) {
    throw SessionNotFoundError();
  }
  
  // Calculate scores for each participant
  const leaderboard = results.participants.map(p => {
    const correctAnswers = p.responses.filter(r => r.option.is_correct).length;
    const totalQuestions = results.scenario.questions.length;
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    // Calculate average time (simplified - using response timestamps)
    let avgTime = 0;
    if (p.responses.length > 0) {
      const times = p.responses.map((r, idx) => {
        if (idx === 0) {
          // Time from joining to first answer
          const joinTime = new Date(p.joined_at).getTime();
          const answerTime = new Date(r.created_at).getTime();
          return (answerTime - joinTime) / 1000; // seconds
        } else {
          // Time between consecutive answers
          const prevTime = new Date(p.responses[idx - 1].created_at).getTime();
          const currTime = new Date(r.created_at).getTime();
          return (currTime - prevTime) / 1000; // seconds
        }
      });
      avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    }
    
    return {
      participant_id: p.id,
      participant_name: p.name,
      score,
      correct_answers: correctAnswers,
      total_questions: totalQuestions,
      average_time: Number(avgTime.toFixed(1))
    };
  });
  
  // Sort by score (desc), then by average time (asc)
  leaderboard.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.average_time - b.average_time;
  });
  
  // Add ranks
  const rankedLeaderboard = leaderboard.map((entry, index) => ({
    rank: index + 1,
    ...entry
  }));
  
  return {
    session_id: session.id,
    join_code: session.join_code,
    leaderboard: rankedLeaderboard
  };
};

export const startSession = async (joinCode: string, userId: number) => {
  // 1. Get session
  const session = await ScenarioSession.getByJoinCode(joinCode);
  if (!session) {
    throw SessionNotFoundError();
  }

  // 3. Check if already started
  if (session.status === 'ACTIVE') {
    throw new Error('Session already started');
  }

  // 4. Start the session
  const updatedSession = await ScenarioSession.startSession(session.id);

  // 5. Trigger Pusher event
  await triggerPusherEvent(`session-${joinCode}`, 'session-started', {
    session_id: session.id,
    join_code: joinCode,
    started_at: updatedSession.started_at?.toISOString(),
    current_question_index: 0,
    time_per_question: 30
  });

  // 6. Send push notifications to all participants
  await sendSessionStartNotification(session.participants, {
    join_code: joinCode,
    session_id: session.id,
    started_at: updatedSession.started_at?.toISOString() || new Date().toISOString()
  });

  return {
    id: updatedSession.id,
    join_code: updatedSession.join_code,
    status: updatedSession.status,
    started_at: updatedSession.started_at?.toISOString(),
    current_question_index: updatedSession.current_question_index,
    current_question_started_at: updatedSession.current_question_started_at?.toISOString()
  };
};

export const nextQuestion = async (joinCode: string, userId: number) => {
  // 1. Get session
  const session = await ScenarioSession.getByJoinCode(joinCode);
  if (!session) {
    throw SessionNotFoundError();
  }

  // 3. Verify session is active
  if (session.status !== 'ACTIVE') {
    throw new Error('Session is not active');
  }

  // 4. Check timer (30 seconds mandatory wait)
  if (session.current_question_started_at) {
    const now = new Date();
    const elapsed = (now.getTime() - new Date(session.current_question_started_at).getTime()) / 1000;

    if (elapsed < 30) {
      const waitTime = Math.ceil(30 - elapsed);
      throw new Error(`Please wait at least 30 seconds before moving to the next question. (Wait ${waitTime}s more)`);
    }
  }

  // 5. Check if more questions exist
  const totalQuestions = session.scenario.questions.length;
  const nextIndex = session.current_question_index + 1;

  if (nextIndex >= totalQuestions) {
    // End session if no more questions
    await ScenarioSession.updateStatus(session.id, 'COMPLETED');
    
    // Trigger Pusher event for completion
    await triggerPusherEvent(`session-${joinCode}`, 'session-completed', {
      session_id: session.id,
      join_code: joinCode,
      status: 'COMPLETED'
    });

    return { message: "Scenario completed", status: 'COMPLETED' };
  }

  // 6. Update question index
  const updatedSession = await ScenarioSession.updateQuestionIndex(session.id, nextIndex);

  // 7. Silent synchronization (no notification as requested)
  await triggerPusherEvent(`session-${joinCode}`, 'session-sync', {
    session_id: session.id,
    join_code: joinCode,
    current_question_index: nextIndex,
    current_question_started_at: updatedSession.current_question_started_at?.toISOString()
  });

  return {
    id: updatedSession.id,
    join_code: updatedSession.join_code,
    current_question_index: updatedSession.current_question_index,
    current_question_started_at: updatedSession.current_question_started_at?.toISOString()
  };
};

