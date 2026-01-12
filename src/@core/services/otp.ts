
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const otpServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID as string;
const client = twilio(accountSid, authToken);

// async function createService() {
//   try {
//     console.log('Creating Twilio Verify Service');

//     const service = await client.verify.v2.services.create({
//       friendlyName: "SSPL passwordless login service",
//       codeLength: 4,
//       doNotShareWarningEnabled: true
//     });

//     console.log(service.sid);
//     console.log(service);
//   }
//   catch (err) {
//     console.log(err);
//   }
// }

// createService();

export const sendOTP = (to:string) => {
  return client.verify.v2.services(otpServiceSid)
    .verifications.create({
      channel: 'sms',
      to
    })
  ;
};

export const verifyOTP = async (code:string, to:string) => {
  const vCheck = await client.verify.v2.services(otpServiceSid)
    .verificationChecks.create({ code, to })
  ;

  console.log('vCheck:', vCheck);
  return vCheck.status === 'approved';
};
