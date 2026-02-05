import axios from "axios";

export async function sendWhatsAppMessage(to: string, message: string) {
  const body = {
    username: "GuessMyValentine",
    waNumber: "+254799999999",
    phoneNumber: "+254795565344",
    body: {
      message: "This is a whatsapp message",
    },
  };

  const res = await axios.post(
    "https://chat.africastalking.com/whatsapp/message/send",
    body,
    {
      headers: {
        apiKey: "",
      },
    }
  );

  console.log(res);
  // Plug WhatsApp Cloud / Twilio here
  console.log(`📲 WhatsApp to ${to}: ${message}`);
}
