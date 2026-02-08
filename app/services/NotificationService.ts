import axios from "axios";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const {
  TWILIO_GMV_CONTENT_SID,
  TWILIO_GMV_OPT_TEMPLATE_CONTENT_SID,
  TWILIO_GMV_DEFAULT_CONTENT_SID,
} = process.env!;

const client = twilio(accountSid, authToken);

type Channel = "whatsapp" | "sms";
type MESSAGE_TYPE = "OTP" | "REMINDER" | "RESPONSE" | "default";

class NotificationService {
  constructor() {}

  async sendNotification({
    channel,
    message_type,
    to,
    message,
  }: {
    channel: Channel;
    message_type: MESSAGE_TYPE;
    to: string;
    message: string;
  }) {
    if (channel === "whatsapp") {
      let choosenContentSid = "";

      switch (message_type) {
        case "OTP":
          choosenContentSid = TWILIO_GMV_OPT_TEMPLATE_CONTENT_SID!;
          break;
        case "RESPONSE":
          choosenContentSid = TWILIO_GMV_DEFAULT_CONTENT_SID!;
          break;
        case "default":
          choosenContentSid = TWILIO_GMV_CONTENT_SID!;
          break;
      }

      const requestBody = {
        from: `whatsapp:${twilioWhatsappNumber}`,
        contentSid: choosenContentSid,
        contentVariables: `{"1":"${message}"}`,
        to: `whatsapp:${to}`,
        body: message,
      };

      console.log(
        `Sending Whatsapp message to ${to}. Body -> ${JSON.stringify(
          requestBody
        )}`
      );

      return client.messages.create(requestBody);
    }

    const requestBody = {
      from: process.env.TWILIO_SMS_FROM!,
      to,
      body: message,
    };

    const res = await client.messages.create(requestBody);

    return res;
  }
}

export default new NotificationService();
