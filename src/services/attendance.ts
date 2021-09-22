/* eslint-disable object-curly-newline */

import puppeteer, { Page, LoadEvent, Timeoutable, Response } from "puppeteer";
import { DARWINBOX, GOOGLE_SIGNIN } from "../constants";
import parentLogger from "../utils/logger";
import { ICredentials, IAttendanceDetails } from "../interfaces";

const logger = parentLogger(__filename);

interface AttendanceAPIResponse {
  status: string;
  error?: string;
}
class CrawlDarwinbox {
  private readonly waitAndSilentTimeout: {
    timeout: Timeoutable["timeout"];
    waitUntil: LoadEvent;
  };

  private readonly emailId: string;

  private readonly password: string;

  private readonly startDate: string;

  private readonly endDate: string;

  private readonly message: string;

  constructor(
    credentials: ICredentials,
    attendanceDetails: IAttendanceDetails
  ) {
    this.waitAndSilentTimeout = {
      timeout: 0,
      waitUntil: "networkidle0"
    };

    this.emailId = credentials.emailId;
    this.password = credentials.password;
    this.startDate = attendanceDetails.startDate;
    this.endDate = attendanceDetails.endDate;
    this.message = attendanceDetails.message;
  }

  private async googleSignin(page: Page, navigationPromise: Promise<Response>) {
    try {
      await page.waitForTimeout(5000);
      await navigationPromise;
      await page.waitForSelector(
        GOOGLE_SIGNIN.EMAIL_SELECTOR,
        this.waitAndSilentTimeout
      );

      await page.click(GOOGLE_SIGNIN.EMAIL_SELECTOR);
      await navigationPromise;
      await page.type(GOOGLE_SIGNIN.EMAIL_SELECTOR, this.emailId);
      await page.waitForSelector(GOOGLE_SIGNIN.NEXT_SELECTOR);
      await page.click(GOOGLE_SIGNIN.NEXT_SELECTOR);
      await page.waitForSelector(
        GOOGLE_SIGNIN.PASSWORD_SELECTOR,
        this.waitAndSilentTimeout
      );

      await page.click(GOOGLE_SIGNIN.EMAIL_SELECTOR);
      await page.waitForTimeout(2000);
      await page.type(GOOGLE_SIGNIN.PASSWORD_SELECTOR, this.password);
      await page.waitForSelector(GOOGLE_SIGNIN.SUBMIT_BTN_SELECTOR);
      await page.click(GOOGLE_SIGNIN.SUBMIT_BTN_SELECTOR);
      await navigationPromise;
      logger.info("Successfully signed into Darwinbox");
    } catch (ex) {
      throw new Error(ex);
    }
  }

  private async getBrowserPage(): Promise<Page> {
    const browser = await puppeteer.launch({
      headless: false,
      product: "firefox",
      ignoreDefaultArgs: ["--disable-extensions"],
      userDataDir: "./tmp",
      ignoreHTTPSErrors: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-infobars",
        "--window-position=0,0",
        "--ignore-certifcate-errors",
        "--ignore-certifcate-errors-spki-list",
        "--single-process",
        "--window-size=1900,1000"
      ]
    });

    const page = await browser.newPage();
    return page;
  }

  private async monitorAttendanceAPIRequest(page: Page) {
    try {
      const attendanceAPIResponse = await page.waitForResponse((response) =>
        response
          .url()
          .startsWith("https://highradius.darwinbox.in/request/attendance")
      );

      if (!attendanceAPIResponse.ok) throw new Error("API failed");

      const { status, error } =
        await (attendanceAPIResponse.json() as Promise<AttendanceAPIResponse>);

      if (status !== "success") {
        logger.error(error);
        return;
      }
      logger.info("Successfully completed API");
    } catch (ex) {
      throw new Error(ex);
    }
  }

  private async fillAttendanceForm(
    page: Page,
    navigationPromise: Promise<Response>
  ) {
    try {
      await page.waitForSelector(
        DARWINBOX.MENU_ITEM_SELECTOR,
        this.waitAndSilentTimeout
      );

      await page.evaluate((MENU_ITEM_SELECTOR_LINK) => {
        const skipBtn = document.querySelector(
          "button.btn.btn-secondary.ripple.db-btn.plr-32.mr-12.skip_pulse"
        ) as HTMLElement;

        if (skipBtn) {
          skipBtn.click();
        }

        const attendanceElt: HTMLElement = document.querySelectorAll(
          MENU_ITEM_SELECTOR_LINK
        )[4] as HTMLElement;

        attendanceElt.click();
      }, DARWINBOX.MENU_ITEM_SELECTOR_LINK);

      await page.waitForSelector(
        DARWINBOX.ATTENDANCE_REQUEST_SELECTOR,
        this.waitAndSilentTimeout
      );

      await page.evaluate((ATTENDANCE_REQUEST_SELECTOR) => {
        const applyButton = document.querySelector(
          ATTENDANCE_REQUEST_SELECTOR
        ) as HTMLButtonElement;

        setTimeout(() => {
          applyButton.click();
        }, 5000);
      }, DARWINBOX.ATTENDANCE_REQUEST_SELECTOR);

      logger.info("Clicked on apply btn");

      await navigationPromise;
      await page.waitForSelector(
        DARWINBOX.ATTENDANCE_TYPE_SELECTOR,
        this.waitAndSilentTimeout
      );

      logger.info("Started to filling form");

      await page.select(DARWINBOX.ATTENDANCE_TYPE_DROPDOWN, "2");

      await page.select(DARWINBOX.ATTENDANCE_REASON_DROPDOWN, "5d8c4397f3da7");

      await page.select(DARWINBOX.ATTENDANCE_LOCATION_SELECTOR, "2");

      await page.evaluate(
        (
          ATTENDANCE_DATE_SELECTOR_FROM,
          ATTENDANCE_DATE_SELECTOR_TO,
          ATTENDANCE_MESSAGE_SELECTOR,
          ATTENDANCE_APPLY_SELECTOR,
          startDate,
          endDate,
          message
        ) => {
          (
            document.querySelector(
              ATTENDANCE_DATE_SELECTOR_FROM
            ) as HTMLInputElement
          ).value = startDate;

          (
            document.querySelector(
              ATTENDANCE_DATE_SELECTOR_TO
            ) as HTMLInputElement
          ).value = endDate;

          (
            document.querySelector(
              ATTENDANCE_MESSAGE_SELECTOR
            ) as HTMLInputElement
          ).value = message;

          (
            document.querySelector(ATTENDANCE_APPLY_SELECTOR) as HTMLElement
          ).click();
        },
        DARWINBOX.ATTENDANCE_DATE_SELECTOR_FROM,
        DARWINBOX.ATTENDANCE_DATE_SELECTOR_TO,
        DARWINBOX.ATTENDANCE_MESSAGE_SELECTOR,
        DARWINBOX.ATTENDANCE_APPLY_SELECTOR,
        this.startDate,
        this.endDate,
        this.message
      );

      logger.info("Submitted attendance form");
    } catch (ex) {
      throw new Error(ex);
    }
  }

  async applyAttendance() {
    const page = await this.getBrowserPage();
    const navigationPromise = page.waitForNavigation();
    await page.goto(DARWINBOX.WEBSITE_URL);
    const url = await page.url();
    if (url !== "https://highradius.darwinbox.in/") {
      logger.info("Starting to sign in");
      await this.googleSignin(page, navigationPromise);
    }

    await this.fillAttendanceForm(page, navigationPromise);
    logger.info("Attendance applied...");
    await this.monitorAttendanceAPIRequest(page);
  }
}

export default CrawlDarwinbox;
