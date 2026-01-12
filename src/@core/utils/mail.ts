
import SGMail from '@sendgrid/mail';

SGMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export const SENDER_EMAILS = {
  ACCOUNT: 'accounts@ssplahore.com'
};

const sendMail = (to:string, from:string, subject:string, body:string) => {
  return SGMail.send({to, from, subject, html: body});
};

export default sendMail;
