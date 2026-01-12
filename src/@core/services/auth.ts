
import Account from '../models/Account';
// import { sendOTP, verifyOTP } from './otp';
import { JwtPayload } from 'jsonwebtoken';
import { hashPassword, verifyPassword, createAccessToken, verifyAccessToken } from '../utils/auth';
import accountSchema, { passwordSchema } from '../validators/account-data-validator';
import personSchema from '../validators/person-data-validator';
import profileSchema from '../validators/profile-data-validator';
import sendMail, { SENDER_EMAILS } from '../utils/mail';
import { generateOTP, validateOTP } from '../utils/otp';
import passwordResetEmailTemplate from '../html-templates/password-reset-email';
import deleteAccountRequestEmailTemplate from '../html-templates/delete-account-request-email';

const DEFAULT_PROFILE = {
  contact: {}
};

/**
 * Function signupUser()
 * @param data 
 * @returns 
 */
export const signupUser = async (data:any) => {
  const schema = personSchema.extend({
    account: accountSchema.merge(passwordSchema),
    profile: profileSchema.optional()
  });

  const parsedData = schema.parse(data);

  // Verify email address.
  if (await Account.exists(parsedData.account.email))
    throw new Error('Account already exists against this email address.');

  // Encrypt password.
  const pwdHash = await hashPassword(parsedData.account.password);

  const {account, profile, ...userData} = parsedData;

  // Refactor data.
  const accountData = {
    ...account,
    password: pwdHash,
    status: 'ACTIVE', // TODO: Implement account verification.
    memberships: [{
      // TODO: Implement after integrating payment gateways and subscription plans.
    }],
    user: {
      ...userData,
      profile: profile || DEFAULT_PROFILE
    }
  };

  // Create account.
  const {user, memberships, ...newAcc} = await Account.create(accountData);
  const membership = memberships[0];
  const userProfile = user?.profiles[0];

  // Generate access token.
  const tokenPayload = {
    sub: user?.id,
    aud: membership.org_id,
    rol: membership.role
  };

  const access_token = createAccessToken(tokenPayload);

  return {
    access_token,
    
    user: {
      ...user,
      id: undefined,
      profiles: undefined,
      role: membership.role,
      profile: userProfile,
      account: {
        email: newAcc.email,
        phone: newAcc.phone
      }      
    }
  };
};

/**
 * Function loginUser()
 * @param email 
 * @param password 
 * @returns 
 */
export const loginUser = async (email:string, password:string) => {
  const account = await Account.getByEmail(email, true);

  if (!account)
    throw new Error('Account does not exist against this email address.');

  // Verify password.
  if (!await verifyPassword(password, account.password))
    throw new Error('Invalid credentials.');

  // Verify account status.
  if (account.status === 'PENDING')
    throw new Error('Your account is pending verification. Please check your email for verification link.');

  // if (account.status !== 'ACTIVE')
  //   throw new Error(`Your account has been ${account.status}`);

  const {user, memberships, ...accountInfo} = account;
  let membership = account.memberships[0];
  const userProfile = user?.profiles[0];
  
  if (!membership) {
    // Fallback: Check if user has ANY memberships (e.g., if org_id changed after DB reset)
    const fullAccount = await Account.getByEmailWithAllMemberships(email);
    const anyMembership = fullAccount?.memberships?.[0];
    
    if (anyMembership) {
      membership = anyMembership;
      console.log(`[AUTH] Fallback membership used for user ${email} in loginUser.`);
    } else {
      throw new Error('You are not yet a member of this organization.');
    }
  }

  if (membership.expires_at && membership.expires_at <= new Date())
    throw new Error('Your membership has expired. Please renew.');

  // Generate access token.
  const tokenPayload = {
    sub: account.user?.id,
    aud: membership.org_id,
    rol: membership.role
  };

  const access_token = createAccessToken(tokenPayload, String(membership.org_id));

  return {
    access_token,
    
    user: {
      ...user,
      id: undefined,
      profiles: undefined,
      role: membership.role,
      profile: userProfile,
      account: {
        id:accountInfo?.id,
        email: accountInfo.email,
        phone: accountInfo.phone
      }      
    }
  };
};

export const initOTPLogin = async (phone:string) => {
  const account = await Account.getByPhone(phone);

  if (!account)
    throw new Error('Account does not exists against this mobile number.');

  const tokenPayload = {
    sub: account.phone
  };

  // TODO: Send OTP.
  // const otp = await sendOTP('');
  // console.log('OTP:', otp);

  const verification_token = createAccessToken(tokenPayload, 'otp_login', 10);
  return { verification_token };
};

export const loginWithOTP = async (code:string, token:string) => {
  // TODO: Verify OTP.

  const payload = verifyAccessToken(token) as JwtPayload;

  if (payload.aud !== 'otp_login')
    throw new Error('Invalid token. Token might have expired.');

  // if (!await verifyOTP(code, ''))
  //   throw new Error('OTP verification failed.');

  const account = await Account.getByPhone(payload.sub as string);

  if (!account)
    throw new Error('Account does not exist.');
  
  // Verify membership.
  let membership = account.memberships[0];
  
  if (!membership) {
    // Fallback: Check if user has ANY memberships
    const fullAccount = await Account.getByEmailWithAllMemberships(account.email);
    const anyMembership = fullAccount?.memberships?.[0];
    
    if (anyMembership) {
      membership = anyMembership;
      console.log(`[AUTH] Fallback membership used for user ${account.email} in loginWithOTP.`);
    } else {
      throw new Error('You are not yet a member of this organization.');
    }
  }

  if (membership.expires_at && membership.expires_at <= new Date())
    throw new Error('Your membership has expired. Please renew.');

  // Generate access token.
  const tokenPayload = {
    sub: account.user?.id,
    aud: membership.org_id,
    rol: membership.role
  };

  const access_token = createAccessToken(tokenPayload);

  return {
    access_token,
    user: {
      email: account.email,
      phone: account.phone,
      first_name: account.user?.first_name,
      last_name: account.user?.last_name,
      role: membership.role
    }
  };
}

export const initResetPassword = async (email:string) => {
  const account = await Account.getByEmail(email, true);

  if (!account)
    throw new Error('Account does not exist against this email address.');

  // Generate token. Use half of current password hash as a token key to make sure the token is usable only once.
  const currPwdHash = account.password;
  const otp = generateOTP();
  const key = await hashPassword(currPwdHash.slice(Math.ceil(currPwdHash.length/2))+otp);

  const tokenPayload = {
    sub: account.id,
    key: key
  };

  const access_token = createAccessToken(tokenPayload, 'acc_recovery', 10);

  await sendMail(account.email, SENDER_EMAILS.ACCOUNT, 'Password Reset Code | SSPL', passwordResetEmailTemplate(otp, 300));
  return access_token;
};

export const verifyPasswordResetToken = async (token:string, code:string) => {
  const payload = verifyAccessToken(token) as JwtPayload;

  if (payload.aud !== 'acc_recovery')
    throw new Error('Invalid token. Token might have expired.');

  const account = await Account.getById(parseInt(payload.sub as string), true);

  if (!account)
    throw new Error('Account does not exist.');

  // Verify account status.
  if (account.status === 'PENDING')
    throw new Error('Your account is pending verification. Please check your email for verification link.');

  if (account.status !== 'ACTIVE')
    throw new Error(`Your account has been ${account.status}`);

  // Verify token key.
  const currPwdHash = account.password;
  if (!await verifyPassword(currPwdHash.slice(Math.ceil(currPwdHash.length/2))+code, payload.key))
    throw new Error('Invalid request token or token has been already used to reset password.');

  return payload;
};

export const resetAccountPassword = async (password:string, code:string, token:string) => {
  const parsedData = passwordSchema.parse({ password });

  if (!validateOTP(code))
    throw new Error('Code is invalid or has been expired.');

  const payload = await verifyPasswordResetToken(token, code);
  
  // Encrypt password.
  const pwdHash = await hashPassword(parsedData.password);

  const account = await Account.updatePassword(parseInt(payload.sub as string), pwdHash);
  
  const {user, memberships, ...accountInfo} = account;
  let membership = account.memberships[0];
  const userProfile = user?.profiles[0];
  
  if (!membership) {
    // Fallback: Check if user has ANY memberships
    const fullAccount = await Account.getByEmailWithAllMemberships(account.email);
    const anyMembership = fullAccount?.memberships?.[0];
    
    if (anyMembership) {
      membership = anyMembership;
      console.log(`[AUTH] Fallback membership used for user ${account.email} in resetAccountPassword.`);
    } else {
      throw new Error('You are not yet a member of this organization.');
    }
  }

  if (membership.expires_at && membership.expires_at <= new Date())
    throw new Error('Your membership has expired. Please renew.');

  // Generate access token.
  const tokenPayload = {
    sub: account.user?.id,
    aud: membership.org_id,
    rol: membership.role
  };

  const access_token = createAccessToken(tokenPayload);

  return {
    access_token,
    
    user: {
      ...user,
      id: undefined,
      profiles: undefined,
      role: membership.role,
      profile: userProfile,
      account: {
        email: accountInfo.email,
        phone: accountInfo.phone
      }      
    }
  };
};

export const initDeleteAccount = async (email:string) => {
  const parsedData = accountSchema.pick({ email: true }).parse({ email });
  const account = await Account.getByEmail(parsedData.email);

  if (!account)
    throw new Error('Account doesnot exists.');

  const tokenPayload = {
    sub: account.id
  };

  const token = createAccessToken(tokenPayload, 'acc_deletion', 20);
  const deletionLink = `${process.env.API_HOST}/auth/delete-account?token=${token}`;
  return sendMail(account.email, SENDER_EMAILS.ACCOUNT, 'Account Deletion Request', deleteAccountRequestEmailTemplate(deletionLink));
};

export const deleteAccount = async (token:string) => {
  const payload = verifyAccessToken(token) as JwtPayload;
  if (payload.aud !== 'acc_deletion')
    throw new Error('Token is invalid or has expired.');

  const accountId = parseInt(payload.sub as string);

  const account = await Account.getById(accountId, true);

  if (!account)
    throw new Error('Account does not exist.');

  // Handle delete account
  return Account.delete(account.id);
};
