const nodemailer = require("nodemailer");

async function main() {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "hamza.anees.432@gmail.com",
      pass: "vmxq zaly emzs aeds",
    },
  });

  try {
    let info = await transporter.sendMail({
      from: '"Voice Peri" <no-reply@voiceperi.com>',
      to: "amtul@vu.edu.pk",
      subject: "Test Email from Voiceperi",
      text: "This is a test email.",
    });
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

main();
