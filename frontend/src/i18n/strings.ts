import { CLINICAL_EN } from "./clinical";

export const LANGS = [
  { id: "en", native: "English", short: "EN" },
  { id: "zh", native: "中文", short: "中文" },
  { id: "ms", native: "Melayu", short: "BM" },
  { id: "ta", native: "தமிழ்", short: "த" },
] as const;

export type Lang = (typeof LANGS)[number]["id"];

export function isLang(value: string): value is Lang {
  return LANGS.some((item) => item.id === value);
}

export const EN = {
  ...CLINICAL_EN,
  "nav.home": "Home",
  "nav.timeline": "Timeline",
  "nav.food": "Food",
  "nav.stool": "Stool",
  "nav.contacts": "Contacts",
  "verdict.yes": "Yes",
  "verdict.no": "No",
  "verdict.ask": "Ask your care team",
  "verdict.possible": "Possible",
  "source.cited": "Cited source",
  "source.original":
    "Wording from the hospital sheet, translated for this screen.",
  "err.hospitals": "Could not load hospitals. Is the API running on port 8000?",
  "err.hospitalsEmpty":
    "No hospitals returned from the API. Check mvp.seed.sql was applied.",
  "err.session": "Could not start session. Is the API running on port 8000?",
  "err.timeline": "Failed to load timeline",
  "err.mealPrep": "Could not load meal suggestions. Try again shortly.",
  "err.save": "Could not save. Check the API is running.",
  "on.kicker": "Colonoscopy prep",
  "on.title": "Your prep, on your phone.",
  "on.step1": "Choose hospital",
  "on.pickerSearch": "Search hospital",
  "on.pickerEmpty": "No hospital matches.",
  "on.step2": "Appointment date",
  "on.step3": "Confirm",
  "on.session": "Session",
  "on.am": "Morning",
  "on.amHint": "Typically before 12pm",
  "on.pm": "Afternoon",
  "on.pmHint": "Typically 12pm onwards",
  "on.report": "Reporting time",
  "on.back": "Back",
  "on.continue": "Continue",
  "on.prep": "Prep",
  "on.scopeDate": "Scope date",
  "on.sessionLabel": "Session",
  "on.hospital": "Hospital",
  "on.morning": "Morning",
  "on.afternoon": "Afternoon",
  "on.reportBy": "Report by",
  "on.confirmNote":
    "Timeline follows {hospital} only. We will not mix in another hospital’s milk, juice, or last-meal rules.",
  "on.generate": "Generate my timeline",
  "on.generating": "Building your timeline…",
  "on.generatingHint": "Following {hospital} only.",
  "on.formTitle": "Your prep details",
  "on.name": "First name",
  "on.nameHint": "Optional — not required for the timeline.",
  "on.namePlaceholder": "Mei",
  "on.protocol": "Which prep?",
  "on.protocolHint": "Match the prep on the form you were given.",
  "home.hi": "Hi, {name}.",
  "home.morningScope": "{hospital} · Morning scope",
  "home.afternoonScope": "{hospital} · Afternoon scope",
  "home.report": "report {time}",
  "home.upNext": "Up next",
  "home.firstStep": "First step",
  "home.openTimeline": "Open full timeline",
  "home.foodTitle": "Can I eat this?",
  "home.foodBody":
    "Type a food. Every answer is Yes, No, or Possible — with the line we used.",
  "home.stoolTitle": "Stool scale",
  "home.stoolBody":
    "Match your stool to the guide, and the number for your hospital.",
  "home.contactsTitle": "Hospital contacts",
  "home.contactsBody": "Call the numbers for your hospital when you need help.",
  "home.waTitle": "Get prep reminders",
  "home.waOn": "Reminders on",
  "home.waBody":
    "App push notifications or Telegram. Timed to your timeline — meds, diet, prep doses, stool check, and fasting.",
  "home.waCta": "Set reminders",
  "home.waOnCta": "View reminders",
  "home.faithful": "Hospital-faithful, on purpose",
  "home.faithfulBody":
    "Times and food rules follow your {hospital} sheet, not a generic prep list.",
  "home.shortcut": "Keep this on your phone",
  "home.shortcutIos": "Share → Add to Home Screen",
  "home.shortcutAndroid": "Menu → Install & create shortcut",
  "home.shortcutOpen": "See step details",
  "home.shortcutIosTab": "iPhone",
  "home.shortcutAndroidTab": "Android",
  "home.shortcutIosLead": "Using Safari",
  "home.shortcutAndroidLead": "Using Chrome",
  "home.shortcutIos1":
    "Open this page in Safari (not Chrome or an in-app browser).",
  "home.shortcutIos2":
    "Tap Share. On newer iOS, tap the menu (three lines) in the address bar at the top, then tap Share. On older iOS, tap the square with an arrow at the bottom of the screen.",
  "home.shortcutIos3":
    "Tap Add to Home Screen. If you do not see it, tap View More first. On older iOS, scroll the list; if it is still missing, tap Edit Actions and add it.",
  "home.shortcutIos4": "Type a name, then tap Add in the top-right corner.",
  "home.shortcutAndroid1": "Open this page in Chrome.",
  "home.shortcutAndroid2": "Tap the three dots in the top-right corner.",
  "home.shortcutAndroid3": "Tap Install and create shortcut.",
  "home.shortcutAndroid4": "Tap Install — not Create shortcut.",
  "home.shortcutAndroid5": "Tap Install on the next popup.",
  "home.shortcutGotIt": "Got it",
  "home.shortcutImgIos":
    "Safari Share button at the bottom and Add to Home Screen",
  "home.shortcutImgIosNew":
    "Safari address-bar menu, Share, and Add to Home Screen",
  "home.shortcutIosNewCaption": "Newer iOS",
  "home.shortcutIosOldCaption": "Older iOS",
  "home.shortcutImgAndroid": "Chrome menu and Install option",
  "tour.next": "Next",
  "tour.back": "Back",
  "tour.done": "Done",
  "tour.replay": "Replay tour",
  "tour.replayShort": "Tour",
  "tour.1t": "This is your home",
  "tour.1d":
    "Your next step is here. Use the cards below, or the five tabs at the bottom.",
  "tour.2t": "Edit, tour, and language",
  "tour.2d":
    "Tap Edit to change the date, Tour to replay this walkthrough, or the language menu for English, 中文, BM, or த. Screens and reminders follow.",
  "tour.3t": "Reminders",
  "tour.3d":
    "App push or Telegram, timed to your timeline — meds, diet, prep, stool, and fasting. Messages use the language you picked.",
  "tour.4t": "Food, stool, and contacts",
  "tour.4d":
    "Check a food against your hospital sheet, open the stool guide, or call your hospital.",
  "tour.5t": "The five tabs",
  "tour.5d":
    "Home, timeline, food, stool, and contacts — same places as the cards above.",
  "tour.6t": "Keep this on your phone",
  "tour.6d":
    "In-app reminders only work from the Home Screen icon, not a browser tab. Add PrepPath, open it from the icon, then tap Allow notifications.",
  "tl.for": "Personalised for {hospital}",
  "tl.title": "Your countdown",
  "tl.next": "next",
  "tl.fromNowToday": "today",
  "tl.fromNowTomorrow": "tomorrow",
  "tl.fromNowDays": "in {n} days",
  "tl.notOnForm": "Not on printed form",
  "tl.list": "List",
  "tl.calendar": "Calendar",
  "tl.noEvents": "Nothing scheduled on this day.",
  "tl.today": "Today",
  "tl.allDay": "All day",
  "tl.jumpNext": "Up next",
  "tl.selected": "Selected",
  "tl.scopeDay": "Colonoscopy day",
  "tl.hasSteps": "Prep due",
  "tl.openStool": "Open stool scale",
  "tl.openFood": "Open food guide",
  "kind.diet": "Diet",
  "kind.prep": "Prep",
  "kind.med": "Medication",
  "kind.meal": "Meal",
  "kind.fast": "Fast",
  "kind.arrive": "Arrive",
  "kind.stool": "Stool",
  "food.kicker": "Grounded · retrieval only",
  "food.title": "Can I eat this?",
  "food.lead": "Answering as {hospital}.",
  "food.placeholder": "e.g. can I have prata?",
  "food.introTitle": "Food lookup for {hospital}",
  "food.introBody":
    "Ask about one food or drink at a time. I check your hospital’s sheet first, and fall back to a consolidated dietitian baseline where it is silent. I will not invent diet advice.",
  "food.send": "Send",
  "food.clear": "Clear chat",
  "food.jumpLatest": "Latest",
  "food.jumpTop": "Top",
  "stool.kicker": "Prep check",
  "stool.title": "Stool Scale",
  "stool.lead": "Match your stool to the guide before you leave.",
  "stool.ifNotReady": "If you are not ready",
  "stool.ifUnsure": "If you are unsure",
  "stool.ifUnsureBody":
    "Do not guess. Call your hospital contact and follow what your team advised.",
  "stool.viewCartoon": "Illustration",
  "stool.viewPhotos": "Photos",
  "stool.tapToEnlarge": "Tap to enlarge",
  "stool.moreExamples": "More examples of this stage",
  "stool.photoSoon": "Extra photo coming soon",
  "stool.lastStagesHint":
    "The last two stages matter most. Check both colour and leftover residue before you leave.",
  "contacts.kicker": "Your hospital",
  "contacts.title": "Contacts for {hospital}",
  "contacts.lead": "Call these numbers if you need help with your prep.",
  "contacts.call": "Call {phone}",
  "stool.reminders": "Set reminders",
  "stool.remindersBody":
    "Timed to your timeline, on Telegram or as an app push notification.",
  "stool.ready": "Ready",
  "stool.almost": "Almost",
  "stool.notReady": "Not ready",
  "wa.title": "Reminders",
  "wa.welcome": "How reminders work",
  "wa.welcomeBody":
    "Pick app push notifications, Telegram, or both. Reminders follow your timeline — medicines, diet, each prep dose 1 hour before and at dose time, a stool check, and when to stop fluids.",
  "wa.times": "Your reminder times",
  "wa.passed": "passed",
  "wa.sent": "sent",
  "wa.computed":
    "Times follow the {hospital} sheet from reporting time {time}, including each prep dose 1 hour before and at dose time.",
  "wa.sandbox": "Telegram",
  "wa.sandboxBody":
    "Opens the bot with this appointment. Tap 'start' once so we can send your timeline reminders.",
  "wa.sandboxBodyOn":
    "This chat is linked. Timeline reminders will arrive here.",
  "wa.joinWord": "Bot",
  "wa.open": "Open Telegram",
  "wa.waiting": "Waiting for Telegram…",
  "wa.waitingTimeout": "Didn't see Start yet. Open Telegram and tap Start.",
  "wa.optin": "Telegram reminders are on.",
  "wa.t72": "72 hours before",
  "wa.t24": "24 hours before",
  "wa.t6": "6 hours before",
  "wa.t72b": "Low-residue diet should already be underway.",
  "wa.t24b": "Eve of scope. Last meal and first Picoprep doses are close.",
  "wa.t6b":
    "Final doses and fasting cutoff. Check stool colour before you leave.",
  "wa.dose": "Prep dose",
  "wa.doseb": "Time to mix and drink this dose.",
  "wa.peg": "PEG dose",
  "wa.pegb": "Time to mix and drink PEG.",
  "wa.step": "Timeline step",
  "wa.stepb": "See your timeline for this step.",
  "wa.p1": "Picoprep packet 1",
  "wa.p1b": "Time to mix and drink packet 1.",
  "wa.p2": "Picoprep packet 2",
  "wa.p2b": "Time to mix and drink packet 2.",
  "wa.p3": "Picoprep packet 3",
  "wa.p3b": "Time to mix and drink packet 3.",
  "wa.p4": "Picoprep packet 4",
  "wa.p4b": "Time to mix and drink packet 4.",
  "wa.pushTitle": "App push notifications",
  "wa.pushBody":
    "Timeline reminders and each hospital prep dose, as an app push notification.",
  "wa.pushAllow": "Allow notifications",
  "wa.on": "On",
  "wa.pushOn": "App push notifications on.",
  "wa.pushOff": "Turn off",
  "wa.telegramOff": "Turn off",
  "wa.pushNeedInstall":
    "In-app reminders won't work in a web browser. Add PrepPath to your Home Screen, then tap Allow notifications.",
  "wa.pushHow": "Add to Home Screen",
  "wa.pushUnsupported":
    "This browser cannot receive app notifications. Use Telegram instead.",
  "wa.pushBusy": "Turning on…",
  "wa.pushError": "Could not enable notifications. Try again, or use Telegram.",
  "wa.pushDenied":
    "Notifications were blocked. Use Telegram, or allow them in browser settings.",
  "wa.pushReadyTitle": "You're set for reminders",
  "wa.pushReadyBody":
    "Reminders follow your timeline — meds, diet, prep doses, stool check, and fasting.",
  "app.homescreenHint":
    "This opened in the browser. Your session is on the PrepPath Home Screen icon — open that to stay in the app.",
  "lang.choose": "Language",
  "lang.updating": "Updating language",
  "lang.en": "English",
  "lang.zh": "中文",
  "lang.ms": "Bahasa Melayu",
  "lang.ta": "தமிழ்",
  "app.change": "Edit",
  "app.changeTitle": "This appointment",
  "app.changeBody":
    "Change date keeps {hospital}. Start over goes back to hospital pick.",
  "app.changeDate": "Change date",
  "app.changeDateHint": "Keep {hospital}",
  "app.startOver": "Start over",
  "app.startOverHint": "Choose hospital again",
  "app.startOverTitle": "Start over?",
  "app.startOverBody":
    "Back to the start. Timeline on this phone resets. Paper form is unchanged.",
  "app.startOverConfirm": "Confirm",
  "app.keep": "Keep this date",
  "app.saveDate": "Save date",
  "app.dateTitle": "Change appointment date",
  "app.stayingAt": "Still {hospital}",
  "app.regenerating": "Building your timeline",
  "app.regeneratingHint": "Following {hospital} only. New date, new countdown.",
  "pitch.kicker": "HackitRx 2026 · OAS × LSS",
  "pitch.title": "Don’t dread the prep.",
  "pitch.lead":
    "No download. Hospital and appointment in — then a timeline, meal plan, food check, stool guide, and reminders.",
  "pitch.1t": "Your prep timeline",
  "pitch.1d":
    "Hospital, date, and reporting time. Then a countdown to the scope.",
  "pitch.2t": "Your hospital only",
  "pitch.2d": "We never mix another site’s rules into yours.",
  "pitch.3t": "Can I eat this?",
  "pitch.3d":
    "A meal plan of cleared dishes, or type a food. Yes, No, or Possible.",
  "pitch.4t": "Reminders, on time",
  "pitch.4d":
    "App push or Telegram — meds, diet, each dose, stool check, and fasting.",
  "pitch.5t": "Singapore’s four official languages",
  "pitch.5d":
    "English, Mandarin, Malay, and Tamil. Switch whenever you need to.",
  "pitch.scan": "Scan to open PrepPath",
  "hosp.sgh.name": "Singapore General Hospital",
  "hosp.nccs.name": "National Cancer Centre Singapore",
  "hosp.ttsh.name": "Tan Tock Seng Hospital",
  "hosp.skh.name": "Sengkang General Hospital",
  "hosp.cgh.name": "Changi General Hospital",
  "hosp.ttsh.prep": "Picoprep (slot-specific PDF)",
  "hosp.skh.prep": "Picoprep · 2 packets",
  "hosp.cgh.prep": "PEG-ES + simeticone",
} as const;

export type StringKey = keyof typeof EN;

export function isStringKey(key: string): key is StringKey {
  return Object.hasOwn(EN, key);
}

/** Native language names stay as-is so the switcher remains readable. */
export function shouldTranslateKey(key: string): boolean {
  return (
    key !== "lang.en" &&
    key !== "lang.zh" &&
    key !== "lang.ms" &&
    key !== "lang.ta"
  );
}

export function catalogItems(): { key: StringKey; text: string }[] {
  return (Object.entries(EN) as [StringKey, string][])
    .filter(([key]) => shouldTranslateKey(key))
    .map(([key, text]) => ({ key, text }));
}

function applyVars(template: string, vars?: Record<string, string>) {
  let s = template;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, v);
    }
  }
  return s;
}

export function translate(
  key: StringKey,
  vars?: Record<string, string>,
  overlay?: Partial<Record<StringKey, string>>,
) {
  const english = EN[key];
  const raw = overlay?.[key] ?? english;
  let s = applyVars(raw, vars);
  if (vars && /\{[A-Za-z0-9_]+\}/.test(s)) {
    s = applyVars(english, vars);
  }
  if (import.meta.env.DEV) {
    const leftover = s.match(/\{[A-Za-z0-9_]+\}/g);
    if (leftover) {
      console.warn(`[i18n] ${key} still has ${leftover.join(" ")}`);
    }
  }
  return s;
}
