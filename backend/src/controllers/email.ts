import sgMail from "@sendgrid/mail";
import { logger } from "../dependencies/logger";
import { classes as sgHelperClasses } from "@sendgrid/helpers";

require("dotenv").config();
import Mailgen from "mailgen";

export class Email {
  private FROM = "hello@example.io";
  private ENABLED = true;
  private mailGenerator: Mailgen;
  private PRIMARY_COLOR = "#140067";

  constructor() {
    // If this feature is disabled, just resolve the promise and carry on
    const runningInTests =
      process.env.NODE_ENV && process.env.NODE_ENV === "test";

    if (!runningInTests) {
      // Only instatiate mailgen if not test, because it outputs stuff to console.log
      // Configure mailgen by setting a theme and your product info
      this.mailGenerator = new Mailgen({
        theme: {
          path: "node_modules/mailgen/themes/salted/index.html",
          plaintextPath: "node_modules/mailgen/themes/salted/index.txt",
        },
        product: {
          // Appears in header & footer of e-mails
          name: "Example",
          link: "https://example.io/",
          // Custom product logo URL
          // logo: "https://app.example.io/assets/images/logo.png",
          // Custom logo height
          logoHeight: "30px",
        },
      });
    }
  }

  /**
   * Generic helper for sending emails. If this.ENABLED is false or
   * we are running in a test environment, no action is taken.
   *
   * @param body the email contents to send
   * @param to email to send the mail to
   * @param fromName the name of the sender (can be DIFFERENT from their email; emails come from this.FROM)
   * @param subject subject line of the email
   * @param bcc optionally add a bcc address
   */
  private async sendMail(config: {
    body: Mailgen.Content;
    to: string;
    fromEmail: string;
    fromName: string;
    subject: string;
    bcc?: string;
  }) {
    const runningInTests =
      process.env.NODE_ENV && process.env.NODE_ENV === "test";

    if (runningInTests) {
      return;
    }

    if (!this.ENABLED) {
      console.warn("Not actually sending email because email flag is off.");
      return;
    }

    // Generate an HTML email with the provided contents
    const emailBody = this.mailGenerator.generate(config.body);

    // Generate the plaintext version of the e-mail (for clients that do not support HTML)
    const emailText = this.mailGenerator.generatePlaintext(config.body);

    const msg: sgMail.MailDataRequired = {
      to: config.to,
      from: {
        name: config.fromName,
        email: config.fromEmail,
      },
      subject: config.subject,
      text: emailText,
      html: emailBody,
    };

    if (config.bcc !== undefined) {
      msg.bcc = config.bcc;
    }

    // Send the email
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
    const [response] = await sgMail.send(msg);

    if (response.statusCode !== 202) {
      throw new Error(response.toString());
    }

    logger.info(`Sent out email to ${config.to}`);
  }

  /**
   *
   * @param body The body of the emails to send in bulk
   * @param personalizations must include "to", "subject". recommended to include "from" to set name. don't forget substitutions
   *                         see https://github.com/sendgrid/sendgrid-nodejs/blob/main/docs/use-cases/multiple-emails-personalizations-with-substitutions.md
   * @see this.sendProjectReminderEmails for example usage
   */
  private async sendBulkEmails(
    body: Mailgen.Content,
    personalizations: sgHelperClasses.Personalization[]
  ) {
    const runningInTests =
      process.env.NODE_ENV && process.env.NODE_ENV === "test";

    if (runningInTests) {
      return;
    }

    if (!this.ENABLED) {
      console.warn("Not actually sending email because email flag is off.");
      return;
    }

    // Generate an HTML email with the provided contents
    const emailBody = this.mailGenerator.generate(body);

    // Generate the plaintext version of the e-mail (for clients that do not support HTML)
    const emailText = this.mailGenerator.generatePlaintext(body);

    const msg: sgMail.MailDataRequired = {
      from: this.FROM,
      text: emailText,
      html: emailBody,
      personalizations: personalizations as any, // error in typescript for this function and expects a non-exported interface type but the docs want the class type...
    };

    // Send the emails
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
    const [response] = await sgMail.sendMultiple(msg as any);

    if (response.statusCode !== 202) {
      throw new Error(response.toString());
    }

    logger.info(`Sent out batch of emails`);
  }

  public async sendWelcomeToProject(
    to: string,
    userName: string,
    projectName: string,
    endTime: string,
    daysLeft: number,
    recruiterName: string,
    landingUrl: string,
    isEndlessProject: boolean,
    isIndividualTimeLimitEnabled: boolean,
    individualTimeLimitDays?: number
  ) {
    const introText = [
      `${recruiterName} has invited you to participate in this technical skills assessment: <b>${projectName}</b>.`,
    ];

    if (!isEndlessProject && !isIndividualTimeLimitEnabled) {
      introText.push(
        `Please open this assessment by <b>${endTime}</b> (${daysLeft} days until deadline).`
      );
    }

    if (isIndividualTimeLimitEnabled) {
      introText.push(
        `You have ${individualTimeLimitDays} days to open this assessment.`
      );
    }

    // customizations reference: https://www.npmjs.com/package/mailgen
    const email = {
      body: {
        greeting: "Hello",
        signature: "Best of luck",
        name: userName,
        intro: introText,
        action: {
          instructions: "To get started, please click here:",
          button: {
            color: this.PRIMARY_COLOR, // Optional action button color
            text: "Preview Assessment",
            link: landingUrl,
          },
        },
        outro:
          "Need help, or have <a href='https://discord.gg/xjvt5cygzB'>any general questions</a>? Just reply to this email, we'd love to help.",
      },
    };

    await this.sendMail({
      body: email,
      to: to,
      fromEmail: this.FROM,
      fromName: recruiterName,
      subject: `You've been invited to take an assessment: ${projectName}`,
    });
  }

  /**
   * Send email to new users
   * @param to The email recepient
   */
  public async sendWelcomeEmailToUser(to: string) {
    const email = {
      body: {
        greeting: false,
        intro: [`<div style='text-align: left'>Hi there!</div>`],
      },
    };

    await this.sendMail({
      body: email,
      to: to,
      fromEmail: "",
      fromName: "",
      subject: "",
      bcc: "",
    });
  }

  /**
   * Email notification once a user has submitted a solution to a project
   *
   * @param Recepient, email
   */
  public async sendSubmissionNotificationEmail(
    recruiterEmail: string,
    recruiterName: string,
    candidateName: string,
    projectName: string,
    targetUrl: string,
    isCodeReviewSubmission = false
  ) {
    const intro = [
      `${candidateName} has made submission to ${projectName}. Candidates can submit multiple times, so this might not be their final submission.`,
    ];

    if (isCodeReviewSubmission === true) {
      intro.push(
        `This submission was part of a Code Review challenge, so it is awaiting manual scoring.`
      );
    }

    // customizations reference: https://www.npmjs.com/package/mailgen
    const email = {
      body: {
        greeting: "Hello",
        signature: "Best of luck",
        name: recruiterName,
        intro: intro,
        action: {
          instructions: "Review submission here.",
          button: {
            color: this.PRIMARY_COLOR, // Optional action button color
            text: "Review submission",
            link: targetUrl,
          },
        },
        outro:
          "Need help, or have any general questions? Just reply to this email or join our <a href='https://discord.gg/xjvt5cygzB'>Discord</a>; we'd love to help.",
      },
    };

    await this.sendMail({
      body: email,
      to: recruiterEmail,
      fromEmail: this.FROM,
      fromName: "",
      subject: `New candidate activity for ${projectName}`,
    });
  }

  /**
   * This is not used apparently.
   *
   * @param to
   * @param isDempsey
   * @returns
   */
  private sendWelcomeEmail(to: string, isDempsey: boolean) {
    return new Promise((resolve, reject) => {
      // If this feature is disabled, just resolve the promise and carry on
      if (!this.ENABLED) {
        logger.info("Not actually sending email because email flag is off.");
        resolve(null);
        return;
      }

      let emailContents;
      let emailSubject;

      if (!isDempsey) {
        emailSubject = "Thank you for subscribing.";
        emailContents = {
          body: {
            intro: "Hello",

            outro:
              "I will keep you updated on our progress and if you have anything you would like to share, please reply to this email. I am always happy to listen and help.",
            signature: "Alan<br>Founder",
            greeting: false,
          },
        };
      }

      // Generate an HTML email with the provided contents
      const emailBody = this.mailGenerator.generate(emailContents);

      // Generate the plaintext version of the e-mail (for clients that do not support HTML)
      const emailText = this.mailGenerator.generatePlaintext(emailContents);

      const msg = {
        to: to,
        from: this.FROM,
        subject: emailSubject,
        text: emailText,
        html: emailBody,
      };

      // Send the email and resolve/reject depending on the response
      sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
      sgMail.send(msg).then(
        () => {
          logger.info(`Sent out email to ${to}`);
          resolve(null);
        },
        (error) => {
          console.error(error);
          if (error.response) {
            console.error(error.response.body);
          }
          reject();
        }
      );
    });
  }

  /**
   * Emails the sales team with data about a newly-created customer subscription
   * @param customerEmail the email of the new customer
   * @param stripeEventURL a link to the Stripe dashboard with data about the Stripe event associated with the subscription purchase
   * @param subscriptionStart the date the subscription became active
   * @param subscriptionEnd the date the subscription ends
   * @param hubspotURL a link to access the customer in HubSpot
   */
  public async sendSubscriptionCreatedEmail(
    customerEmail: string,
    stripeEventURL: string,
    subscriptionStart: Date,
    subscriptionEnd: Date,
    hubspotURL: string,
    isLiveMode: boolean
  ) {
    const contents = {
      body: {
        greeting: false,
        intro: `A customer just purchased a subscription !
                <p>
                  <strong>Email:</strong> ${customerEmail}<br>
                  <strong>Subscription Start Date:</strong> ${subscriptionStart.toDateString()}<br>
                  <strong>Subscription End Date:</strong> ${subscriptionEnd.toDateString()}
                </p>`,
        action: {
          instructions: `View ${customerEmail} in HubSpot:`,
          button: {
            text: "Open HubSpot",
            link: hubspotURL,
            color: this.PRIMARY_COLOR,
          },
        },
        outro: `See the Stripe event logs <a href="${stripeEventURL}" target="_blank">here</a>.`,
      },
    };

    const envFlag = isLiveMode ? "" : "[TEST MODE] ";
    await this.sendMail({
      body: contents,
      to: "sales@example.com",
      fromEmail: this.FROM,
      fromName: this.FROM,
      subject: `${envFlag}A Customer Just Created A Subscription!`,
    });
  }

  public async sendSubscriptionDeletedEmail(
    customerEmail: string,
    stripeEventURL: string,
    hubspotURL: string,
    isLiveMode: boolean
  ) {
    const envFlag = isLiveMode ? "" : "[TEST MODE] ";

    const contents = {
      body: {
        greeting: false,
        intro: `A customer's subscription just ended.
        <p>
          <strong>Email:</strong> ${customerEmail}
        </p>`,
        action: {
          instructions: `View ${customerEmail} in HubSpot:`,
          button: {
            text: "Open HubSpot",
            link: hubspotURL,
            color: this.PRIMARY_COLOR,
          },
        },
        outro: `See the Stripe event logs <a href="${stripeEventURL}" target="_blank">here</a>.`,
      },
    };

    await this.sendMail({
      body: contents,
      to: "sales@example.com",
      fromEmail: this.FROM,
      fromName: this.FROM,
      subject: `${envFlag}A Customer's Subscription Just Ended`,
    });
  }
}
