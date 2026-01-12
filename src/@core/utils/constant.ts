import { randomBytes } from "crypto";

const selection_category = {
  ALL: "ALL",
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
  DELETED: "DELETED",
};

const plan_type = {
  MONTH: "MONTH",
  YEAR: "YEAR",
  LIFE: "LIFE",
};

const rolesDBKeys = {
  SUPER_ADMIN: "SUPER_ADMIN",
  OFFICE_BEARERS: "OFFICE_BEARERS",
  USER: "USER",
  ADMIN: "ADMIN",
  LIFE_MEMBER: "LIFE_MEMBER",
  REGULAR_MEMBER: "REGULAR_MEMBER",
};

function certificateHtml(data: any, qrCodeBase64: any) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      body {
        width: 1000px;
        height: 700px;
        margin: 0;
        padding: 0;
        font-family: "Times New Roman", serif;
        text-align: center;
        background-image: url('file:///path/to/background.jpg'); /* optional */
        background-size: cover;
      }
      .title { font-size: 48px; font-weight: bold; margin-top: 50px; }
      .name { font-size: 36px; font-weight: bold; margin-top: 30px; text-decoration: underline; }
      .event { font-size: 26px; margin-top: 40px; }
      .footer { position: absolute; bottom: 60px; width: 100%; text-align: center; font-size: 16px; color: #555; }
    </style>
  </head>
  <body>
    <div class="title">Certificate of Participation</div>
    <div>This certifies that</div>
    <div class="name">${data?.name}</div>
    <div>has successfully attended the</div>
    <div class="event">${data?.title}</div>
    <img class="qr" src="${qrCodeBase64}" />
    <div class="footer">Certificate ID: CERT-${data?.genericSerialNum}</div>
  </body>
</html>
`;
}

function generateNumericSerial(length: number = 10) {
  let serial = "";
  while (serial.length < length) {
    // Convert random bytes to digits only
    const byte = randomBytes(1)[0];
    serial += (byte % 10).toString();
  }
  return serial;
}

export {
  selection_category,
  plan_type,
  rolesDBKeys,
  certificateHtml,
  generateNumericSerial,
};
