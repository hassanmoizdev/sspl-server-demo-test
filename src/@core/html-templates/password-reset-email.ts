
const passwordResetEmailTemplate = (otp:string, age:number) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <center>
    <div style="padding: 16px; margin-bottom: 16px; background-color: #dadada; border: 1px dashed #aaaaaa;">
      <div style="max-width: 480px;">
        <h2>Password Reset Code</h2>
        <p style="margin-bottom: 16px; font-size: 1rem;">Following is you One Time Password to reset your account password. This code will be expired in ${Math.floor(age/60)} minutes.</p>
        <span style="display: inline-block; padding:8px 24px; background-color: green; color: white; font-weight: 700; font-size: 1.5rem; letter-spacing: 3px;">${otp}</span>
      </div>
    </div>

    &copy; Society of Surgeons of Pakistan, Lahore <a href="https://ssplahore.com" target="_BLANK">ssplahore.com</a>
  </center>
</body>
</html>
`;

export default passwordResetEmailTemplate;
