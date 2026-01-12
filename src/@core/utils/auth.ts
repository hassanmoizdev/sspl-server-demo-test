
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const hashPassword = async (pwd:string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(pwd, salt);
};

export const verifyPassword = (pwd:string, hash:string) => {
  return bcrypt.compare(pwd, hash);
};

export const createAccessToken = (payload:any, aud='auth', maxAge=4320/** minutes */) => {
  return jwt.sign(
    {
      ...payload,
      aud,
      iat: Date.now(),
      exp: (()=>{
        const now = new Date();
        now.setMinutes(now.getMinutes() + maxAge);
        return now.valueOf();
      })()
    },
    process.env.ACCESS_TOKEN_SECRET as string
  );
};

export const verifyAccessToken = (token:string) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
}