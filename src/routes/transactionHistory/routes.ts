import { Router } from "express";
import * as ctl from "./handlers";

const transactionHistoryRouter = Router();

transactionHistoryRouter.get("/:transaction_id", ctl.handleGet);
transactionHistoryRouter.get("/membership/:membership_id", ctl.handleGetByMembership);
transactionHistoryRouter.get("/", ctl.handleGetList);

export default transactionHistoryRouter;
