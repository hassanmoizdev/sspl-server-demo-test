import { Router } from "express";
import * as ctl from "./handlers";

const meetingRouter = Router();

meetingRouter.post("/create", ctl.handleCreate);
meetingRouter.get("/", ctl.handleGetMeetings);
meetingRouter.get("/active", ctl.handleGetUserMeetings);
meetingRouter.get("/:meeting_id", ctl.handleGetMeeting);
meetingRouter.put("/update/:meeting_id", ctl.handleUpdate);


export default meetingRouter;
