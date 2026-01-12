
import { Router } from 'express';
import * as ctl from './handlers';

const authRouter = Router();

authRouter.post('/signup', ctl.handleSignup);
authRouter.post('/login', ctl.handleLogin);
authRouter.post('/otp', ctl.handleOTPLogin);
authRouter.post('/otp/login', ctl.handleOTPVerify);
authRouter.post('/reset-password/init', ctl.handleForgotPassword);
authRouter.post('/reset-password', ctl.handleResetPassword);
authRouter.post('/delete-account/init', ctl.handleAccountDeleteRequest);
authRouter.get('/delete-account', ctl.handleDeleteAccount);


export default authRouter;