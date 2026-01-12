import { Router } from "express";
import * as ctl from "./handlers";
import { roleValidationHandler } from "../../middlewares/role-validation-handler";
import authValidationHandler from "../../middlewares/auth-validation-handler";

const scenariosAdminRouter = Router();
const scenariosPublicRouter = Router();

// Scenario Management (Admin)
scenariosAdminRouter.use(roleValidationHandler(['ADMIN', 'SUPER_ADMIN']));
scenariosAdminRouter.post("/", ctl.handleCreateScenario);
scenariosAdminRouter.get("/", ctl.handleListScenarios);
scenariosAdminRouter.get("/:id", ctl.handleGetScenario);
scenariosAdminRouter.delete("/:id", ctl.handleDeleteScenario);
scenariosAdminRouter.post("/:id/sessions", ctl.handleCreateSession);
scenariosAdminRouter.post("/sessions/:joinCode/start", ctl.handleStartSession);
scenariosAdminRouter.post("/sessions/:joinCode/next", ctl.handleNextQuestion);

// Session Interactions (Public/Participant)
scenariosPublicRouter.get("/sessions/:joinCode", ctl.handleGetSessionDetails);
scenariosPublicRouter.post("/sessions/:joinCode/join", ctl.handleJoinSession);
scenariosPublicRouter.post("/sessions/:joinCode/auto-join", authValidationHandler, ctl.handleAutoJoinSession);
scenariosPublicRouter.post("/sessions/:joinCode/answers", ctl.handleSubmitAnswer);
scenariosPublicRouter.get("/sessions/:joinCode/results", ctl.handleGetSessionResults);
scenariosPublicRouter.get("/sessions/:joinCode/leaderboard", ctl.handleGetLeaderboard);

export { scenariosAdminRouter, scenariosPublicRouter };
