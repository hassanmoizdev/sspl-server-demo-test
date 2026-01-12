import { Router } from "express";
import * as ctl from "./handlers";

const pollsRouter = Router();

pollsRouter.post("/create", ctl.handleCreatePoll);
pollsRouter.get("/", ctl.handleGetPoll);
pollsRouter.get("/:poll_id", ctl.handleGetSinglePoll);
pollsRouter.get("/results/:poll_id", ctl.handleResult);
pollsRouter.put("/update/:poll_id", ctl.handleUpdate);
pollsRouter.post(
  "/vote/create/:poll_id/:option_id",
  ctl.handleSubmitVote
);
pollsRouter.delete("/:poll_id", ctl.handleDelete);


export default pollsRouter;
