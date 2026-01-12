import { Router } from "express";
import * as ctl from "./handlers";

const usersRouter = Router();

usersRouter.post("/office_bearers", ctl.handleCreateOfficeBearers);
usersRouter.get("/office_bearers", ctl.handleGetOfficeBearers);
usersRouter.get("/", ctl.handleGetUsers);
usersRouter.get("/all_users_list", ctl.handleGetAllUsersList);
usersRouter.get("/getUser", ctl.handleGetUser);
usersRouter.get("/:acc_id", ctl.handleGetAccount);
usersRouter.put("/update", ctl.handleUpdateUser);
usersRouter.put("/update_account/:acc_id", ctl.handleUpdateAccount);
usersRouter.put("/reset_password", ctl.handleResetPassword);
usersRouter.put("/device-token", ctl.handleUpdateDeviceToken); // Mobile app device token

export default usersRouter;
