// emails/templates/welcome.ts
export const welcomeEmail = (name: string, link: string) => ({
  subject: "Bienvenue sur Agent Connect",
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2e7d32; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 10px 20px; background: #2e7d32; color: white; text-decoration: none; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏛️ Agent Connect</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${name},</h2>
          <p>Bienvenue sur Agent Connect, la plateforme de digitalisation des services municipaux.</p>
          <p>Pour commencer à utiliser la plateforme, veuillez vous connecter :</p>
          <p style="text-align: center;">
            <a href="${link}" class="button">Se connecter</a>
          </p>
          <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
        </div>
        <div class="footer">
          <p>© 2024 Agent Connect - Tous droits réservés</p>
        </div>
      </div>
    </body>
    </html>
  `,
});
