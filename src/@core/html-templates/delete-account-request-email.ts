
const deleteAccountRequestEmailTemplate = (deletionLink:string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Delete Account</title>
</head>
<body>
  <center>
    <div style="padding: 16px; margin-bottom: 16px; background-color:rgb(255, 199, 199); border: 1px dashedrgb(238, 69, 69);">
      <div style="max-width: 480px; text-align: left; margin: 0 auto;">
        <h2 style="color: rgb(190, 27, 27);">Account Deletion Request</h2>
        <p style="margin-bottom: 16px;">A request to delete your account associated with this email address has been received.<br />Ignore this email if you did not made the request or proceed within 10 minutes to successfully delete your account from our system.</p>
        <p style="margin-bottom: 16px;">Click the button below to delete your account and any associated data.</p>
        <a target="_BLANK" href="${deletionLink}" style="display: inline-block; padding:8px 24px; background-color:rgb(190, 27, 27); text-decoration: none; color: white; font-weight: 500;">Delete Account</a>
      </div>
    </div>

    <p style="margin-bottom: 8px;"><small><i>(or) copy the following url to your browser's address bar.</i></small></p>
    <p><i>${deletionLink}</i></p>

    &copy; Society of Surgeons of Pakistan, Lahore <a href="https://ssplahore.com" target="_BLANK">ssplahore.com</a>
  </center>
</body>
</html>
`;

export default deleteAccountRequestEmailTemplate;
