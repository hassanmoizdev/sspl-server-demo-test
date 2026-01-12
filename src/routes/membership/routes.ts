import { Router } from "express";
import * as ctl from "./handlers";

const membershipRouter = Router();

membershipRouter.post("/plan/create", ctl.handleCreate);
membershipRouter.put("/update", ctl.handleUpdateMembership);
membershipRouter.get("/", ctl.handleMembershipList);
membershipRouter.get("/plan", ctl.handleGetMembershipPlan);
membershipRouter.get("/plan/:plan_id", ctl.handleGetPlan);
membershipRouter.put("/plan/update/:plan_id", ctl.handleUpdate);
membershipRouter.get("/:membership_id", ctl.handleGetMembership);

export default membershipRouter;
