
import { RequestHandler } from 'express';
import { loginUser, signupUser, initOTPLogin, loginWithOTP, initResetPassword, resetAccountPassword, initDeleteAccount, deleteAccount } from '../../@core/services/auth';

/**
 * Signup handler
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
export const handleSignup:RequestHandler = async (req, res, next) => { 
  try {
    const data = req.body;

    // Create user and access_token.
    const authData = await signupUser(data);
    res.json(authData);
  }
  catch (err) {
    next(err);
  }
};

/**
 * Login handler
 * @param req 
 * @param res 
 * @param next 
 */
export const handleLogin:RequestHandler = async (req, res, next) => {
  try {
    // Validate request body.
    // TODO: Implement better validation with yup.
    const { email, password } = req.body;
    if (!email || !password)
      return next(new Error('Incomplete credentials.'));

    const authData = await loginUser(email, password);
    res.json(authData);
  }
  catch (err) {
    next(err);
  }
};

export const handleOTPLogin:RequestHandler = async (req, res, next) => {
  try {
    const data = req.body;
    const verificationData = await initOTPLogin(data.phone);
    res.json(verificationData);
  }
  catch (err) {
    next(err);
  }
};

export const handleOTPVerify:RequestHandler = async (req, res, next) => {
  try {
    const data = req.body;
    const authData = await loginWithOTP(data.code, data.token);
    res.json(authData);
  }
  catch (err) {
    next(err);
  }
};

export const handleForgotPassword:RequestHandler = async (req, res, next) => {
  try {
    const data = req.body;
    const token = await initResetPassword(data.email);
    res.json({
      token
    });
  }
  catch (err) {
    next(err);
  }
};

export const handleResetPassword:RequestHandler = async (req, res, next) => {
  try {
    const data = req.body;
    if (typeof data.password !== 'string'/* || data.password.trim() !== data.confirmPassword*/)
      throw new Error('Password is required.');

    const authData = await resetAccountPassword(data.password, data.code, data.token);
    res.json(authData);
  }
  catch (err) {
    next(err);
  }
};

export const handleAccountDeleteRequest:RequestHandler = async (req, res, next) => {
  try {
    const data = req.body;
    await initDeleteAccount(data.email);
    res.json({
      message: "An email has been sent with the link to delete account."
    });
  }
  catch (err) {
    next(err);
  }
};

export const handleDeleteAccount:RequestHandler = async (req, res, next) => {
  try {
    const query = req.query;

    const acc = await deleteAccount(query.token as string);
    res.send(`Account with email ${acc.email}, has been deleted succesfully!`);
  }
  catch (err) {
    next(err);
  }
};