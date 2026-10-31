import { renderSiteHeader } from './site-header.js';
import { renderSiteFooter } from './site-footer.js';
const email = '<a href="mailto:info@trikonet.com">info@trikonet.com</a>';
const section = (title, ...paragraphs) => ({ title, paragraphs });

export const legalPages = {
  '/employer-terms': {
    title: 'Employer Terms',
    updated: '18 October 2026',
    description: 'Terms for employers and authorized recruiters submitting company profiles, logos and job vacancies to Trikonet.',
    sections: [
      section('Scope and acceptance', 'These Employer Terms apply to employers and recruiters who expressly accept them when submitting or managing content on Trikonet, operated by Second Tales Solutions LLP. They supplement our <a href="/terms">Terms of Service</a> and <a href="/privacy-policy">Privacy Policy</a>. Merely visiting this page does not constitute acceptance. These terms do not retroactively establish permission for earlier submissions.'),
      section('Authority to represent an employer', 'You must be authorized to act for the employer or organization you identify. Provide accurate company and contact information, maintain account security, and do not impersonate another organization. Trikonet may request evidence of your identity, business relationship or authority before publishing or retaining content.'),
      section('Ownership and content permissions', 'You retain ownership of the material you submit. You confirm that you own or have sufficient permission to submit job descriptions, company names, logos, photographs and other materials, and to grant the licence below. Do not upload material taken from another website or job platform unless its terms or the rights holder permit this use.'),
      section('Licence to display submitted content', 'For content you submit under these terms, you grant Trikonet a non-exclusive, worldwide, royalty-free licence to host, store, reproduce, display and distribute that content through the Trikonet website and mobile applications for job discovery, employer profiles and related services. Trikonet may resize, compress, crop or format logos and content for presentation without materially misrepresenting your organization. Necessary hosting and technical providers may process the content on our behalf. This licence does not transfer ownership or authorize unrelated merchandise or advertising endorsements.'),
      section('Job listing requirements', 'Publish genuine, current vacancies with accurate role requirements, location, compensation information where supplied, and application instructions. Do not publish fraudulent, discriminatory or unlawful offers, misrepresent employment terms, or request fees or sensitive financial credentials from applicants. Remove or update vacancies that are filled or withdrawn. You are responsible for applicable employment and recruitment requirements and any licences required for your own services.'),
      section('Applicant information', 'Use applicant information only for legitimate recruitment purposes consistent with the applicant’s expectations, applicable law and any required consent. Protect resumes and contact details, restrict access, and do not sell applicant data or send unrelated marketing. Employer application sites and communications may have their own privacy notices; provide them where required.'),
      section('Review, corrections and removal', 'Trikonet may review, decline, correct formatting, restrict or remove content that is inaccurate, unauthorized, expired or contrary to these terms. Publication does not imply endorsement, verification of every claim, or a guarantee of applicants or hiring results. Contact <a href="mailto:info@trikonet.com">info@trikonet.com</a> to correct content, withdraw display permission or report unauthorized use. Identify the content URL and your relationship to the rights holder. Withdrawal ends future display following processing; limited backups and records may be retained as required for security, disputes or legal obligations.'),
      section('Acceptance records and changes', 'Where acceptance is collected, Trikonet may keep the employer account identifier, acceptance time and applicable terms version as evidence. Updated terms will state their revision date. Material changes to permission scope require appropriate notice and renewed acceptance where required; a new page alone does not prove prior employer consent.'),
      section('Contact', 'For employer submissions, content rights and permission enquiries, contact <a href="mailto:info@trikonet.com">info@trikonet.com</a>. Include your company name, relevant listing or profile URL, and a description of the request.')
    ]
  },


  '/privacy-policy': {
    title: 'Privacy Policy',
    description: 'How Trikonet handles account, career profile, resume, advertising and job-search information.',
    sections: [
      section('About this policy', `This policy describes information used by the Trikonet website and Trikonet: Job Search App, operated by Second Tales Solutions LLP. Contact ${email} with privacy questions or requests. Features and data processing can differ between the website and mobile app.`),
      section('Information you provide', 'When you create an account, sign in, build a career profile or contact support, we process the information you submit. This can include your name, email address, authentication information, phone number, profile photograph, location and job preferences, education, qualifications, skills, employment history and salary expectations.', 'We also process resumes you upload or create, application messages, saved jobs, followed companies, searches, application activity and account points or referral records. Optional profile fields and resume content depend on what you choose to provide. Avoid including government identity numbers, bank details or unnecessary sensitive information.'),
      section('How we use information', 'We use information to operate and secure accounts, provide job search and recommendations, synchronize saved activity, create resumes, analyze submitted resume text, maintain points and referrals, respond to support requests and prevent misuse. Starting an application in Trikonet does not necessarily mean that an employer has received it.'),
      section('Resumes and AI-assisted features', 'Optional resume analysis sends extracted resume text to Google’s AI service for feedback. Personal information included in that text can also be sent. Job recommendations can use career profile details and job information. Review the information you provide before using these features.', 'AI-generated feedback and match scores are estimates and can be inaccurate. They are not hiring decisions, employer assessments or guarantees of employment. Google processes information under the terms and privacy practices applicable to the service. See the <a href="https://policies.google.com/privacy">Google Privacy Policy</a>.'),
      section('Sharing and external applications', 'Service providers process information needed for hosting, authentication, advertising and enabled features. Google sign-in and external services have their own privacy practices.', 'When you choose to apply through an employer portal, send an email or share a resume, the recipient receives the information you submit under its own policies. Browsing a job alone does not submit your resume. Deleting your Trikonet account does not remove copies already sent to employers or other recipients.', 'Information may also be disclosed when required by law or to address abuse, fraud or security incidents.'),
      section('Advertising, cookies and device information', 'The website uses advertising services, and the Android app integrates Google AdMob, including optional rewarded ads. Google’s advertising SDK can collect and share IP addresses, device and advertising identifiers, interaction information and diagnostics for advertising, analytics and fraud prevention. IP addresses can be used to estimate a general location.', 'Cookies and local storage support sign-in, preferences, saved content and advertising. The app can cache profile, resume and job information on your device. Use available consent choices, ad privacy controls and device or browser settings to manage these features. Blocking cookies or clearing storage can affect sign-in and remove local drafts.', 'For additional details, see <a href="https://policies.google.com/technologies/ads">How Google uses information for advertising</a>. Rewarded-ad credits depend on successful verification; watching an ad does not guarantee a reward if verification fails.'),
      section('Files and device permissions', 'Files or photographs you select can be used for resumes and profile images. Available browser or device permissions depend on the feature you use. You can manage permissions in your device settings. Downloaded or exported files remain where you save them until you remove them. Device permissions alone do not mean that every permitted type of information is collected.'),
      section('Retention and security', 'Account and career information is kept as needed to provide the features you use and handle support, security and legal obligations. Retention can differ for account data, resumes, activity, reward-verification records, logs and backups. Contact us for information about the retention applicable to your records.', 'We use authenticated access and HTTPS for connected account features. No online service can guarantee absolute security. Keep passwords and verification codes private and report suspected unauthorized account access.'),
      section('Your choices and deletion requests', `You can edit available profile fields and manage saved content through your account. For access, correction, a copy of your information or deletion of your account and associated data, email ${email} from your registered email address. Use the subject “Trikonet account deletion” for an account deletion request. Include your account email; do not send your password.`, 'We verify account ownership before processing a request. Active account data is deleted within 30 days after ownership verification, and backup copies are removed within 90 days. Deletion covers your account identity, career profile, uploaded and saved resumes, saved jobs, followed companies, application activity and associated reward records. If specific records must be retained for legal obligations or security and fraud prevention, we will explain the records, reason and applicable retention period in our response. Signing out, uninstalling the app or clearing browser storage does not delete your server account.', 'Employers and other recipients handle copies you previously shared under their own policies. Contact those recipients separately about their copies.'),
      section('International processing and children', 'Connected service providers may process information in the countries where they operate. Their terms and privacy notices describe their processing practices.', `Trikonet supports career and job-search activities. If you believe a child has supplied personal information without appropriate authorization, contact ${email} so we can review the account and request.`),
      section('Updates and contact', `We may update this policy when features or data practices change. The date above identifies this version. Privacy, support and account deletion enquiries can be sent to ${email}.`)
    ]
  },
  '/terms': {
    title: 'Terms & Conditions',
    description: 'Terms for using Trikonet job search, employer information, accounts, resumes and related services.',
    sections: [
      section('About Trikonet', `These terms describe use of the Trikonet website and Trikonet: Job Search App, operated by Second Tales Solutions LLP. For questions about the service or these terms, contact ${email}. Read our <a href="/privacy-policy">Privacy Policy</a> for information about personal data.`),
      section('Service scope', 'Trikonet provides job discovery, employer information, career profiles, resume creation and related application tools. Features can vary by platform and availability. Employers control vacancies, application requirements and hiring decisions. A listing, recommendation, contact reveal or resume score does not guarantee a vacancy, interview, response or employment.'),
      section('Accounts and accurate information', 'Provide accurate account and career information. Protect your sign-in credentials and access only accounts you are authorized to use. You are responsible for reviewing your profile, resumes and application messages before sharing them. Report suspected unauthorized account access to support.'),
      section('Job listings and applications', 'Job details and employer contact information can change. Check the employer, role, location, qualifications and application instructions before applying. External employer portals and email services operate under their own terms and privacy policies.', 'Use care with requests for payments, identity documents or financial information. Report suspicious listings to Trikonet. An application action recorded in your account does not necessarily confirm receipt by an employer.'),
      section('Your content and resume tools', 'Upload and share only content you are authorized to use. You remain responsible for the accuracy of qualifications, work history and other information you supply. Review generated resumes and exported files before sending them.', 'AI-assisted analysis and recommendations can contain errors. They provide guidance based on the information supplied and do not certify your qualifications, predict hiring outcomes or guarantee acceptance by an applicant tracking system.'),
      section('Advertising, points and referrals', 'Trikonet includes advertisements. Some features use account points, referrals or optional rewarded ads. Applicable requirements or point costs are displayed in the feature. Rewards depend on eligibility and successful verification; an interrupted or unverified ad does not guarantee credit.', `Do not manipulate referrals, reward verification or account activity to obtain benefits. Contact ${email} if a point balance, deduction or reward appears incorrect.`),
      section('Acceptable use', 'Do not use Trikonet for fraud, impersonation, spam, harassment, unlawful content, false qualifications or infringement of another person’s rights. Do not access accounts or systems without authorization, interfere with the service or attempt to manipulate listings or rewards.', 'Access may be restricted to address abuse or security issues. Contact support if you believe your access has been restricted incorrectly.'),
      section('Availability and third-party services', 'Features depend on internet access, platform capabilities and connected providers. Listings, links and features may change or become unavailable. Trikonet does not control external employer systems or their decisions. Nothing in these terms removes rights that cannot be excluded under applicable law.'),
      section('Account closure and privacy requests', `To request closure of your account and deletion of associated personal data, email ${email} from your registered email address with the subject “Trikonet account deletion”. Do not include your password. Ownership verification and applicable retention exceptions may apply. See the <a href="/privacy-policy">Privacy Policy</a> for further details.`, 'Uninstalling the app or signing out does not delete server account information. Employers and other recipients may retain copies you have already shared under their own policies.'),
      section('Changes and support', `We may update these terms as the service changes. The date above identifies this version. Contact ${email} with a service issue or a question about your account. Include relevant dates and a description of the issue, without passwords or verification codes.`)
    ]
  }
};

// Detailed website/mobile policies, aligned with current feature flows.
Object.assign(legalPages['/terms'], {updated:'30 October 2026',sections:[
  {
    "title": "1. Operator, scope and agreement",
    "paragraphs": [
      "Trikonet is operated by Second Tales Solutions LLP. These terms cover the website and mobile applications, including job discovery, candidate profiles, applications, resumes, AI tools, employer information, reviews, advertising, reward points and support. Contact info@trikonet.com.",
      "Where we request agreement, read the terms before accepting. General agreement does not substitute for a separate permission required for AI processing, device access or tracking. Features can differ by platform and release."
    ]
  },
  {
    "title": "2. Guest access and accounts",
    "paragraphs": [
      "In the mobile app, choose Browse jobs without signing in to search public openings and read job information. Personal features such as saved jobs, candidate activity and career tools require an account. Guest browsing does not create a candidate account.",
      "Use accurate account information and an email you control. Keep credentials private, do not impersonate others, and report unauthorized access. Use the available profile controls to correct your information."
    ]
  },
  {
    "title": "3. Google and Apple sign-in",
    "paragraphs": [
      "Trikonet supports email/password, Google sign-in and Sign in with Apple on iOS. Apple may supply a private relay email if you choose Hide My Email. Return with the same provider account to access the same profile.",
      "Accounts with the same verified email may be linked to an existing candidate profile. A private relay address is different from a personal email. Do not assume different provider emails identify the same account. Provider services have their own terms."
    ]
  },
  {
    "title": "4. Password changes and verification",
    "paragraphs": [
      "Account Center provides an email-verified password change. Codes expire in 10 minutes and are subject to attempt and request limits. Choose a password of 8–256 characters. A successful password reset invalidates existing sessions.",
      "Three incorrect password-login attempts within the attempt window lock password login for that email for 24 hours. A successful verified password reset clears the lock. Apple and Google sign-in are separate methods. Never give support a password, code or reset challenge."
    ]
  },
  {
    "title": "5. Career profiles and recommendations",
    "paragraphs": [
      "You are responsible for accurate experience, skills, qualifications and other profile information. Initial career setup can be skipped in the mobile app and completed later. Profile strength indicates completeness, not employer approval.",
      "Job match percentages, recommendations and visit-streak statistics are guidance based on available information and activity. They are not probabilities of hiring, recruiter views, certifications or promises of a vacancy or interview."
    ]
  },
  {
    "title": "6. Jobs and external applications",
    "paragraphs": [
      "Read the employer’s requirements and application instructions. Saving a listing does not submit an application. Opening an employer link or email does not confirm that the employer received an application.",
      "Employers manage selection and replies. Listings may change, expire or contain errors. Trikonet does not guarantee jobs, interviews, salaries, responses or employment outcomes. Use Report this job for inaccurate, suspicious or inappropriate listings. Do not pay unverified recruiters or share security credentials."
    ]
  },
  {
    "title": "7. Resumes, exports and practice tools",
    "paragraphs": [
      "Upload only documents and images you own or are authorized to use. Review every generated resume, template, application message and export before sharing. Check contact details and remove placeholders.",
      "Resume downloads and analysis may use points as displayed. The ATS upload tool accepts PDF or DOCX up to 5 MB. Export formats depend on the selected tool. Interview questions and sample answers are practice materials, not leaked or guaranteed employer questions."
    ]
  },
  {
    "title": "8. Optional third-party AI processing",
    "paragraphs": [
      "Trikonet uses Google Gemini for optional resume analysis and enhanced job matching. Analysis shares the selected resume content, including personal information it contains, for an estimated score and feedback. Enhanced matching shares career details such as role, skills, qualifications and experience, plus job information.",
      "Before first use of each feature, explicit permission is requested. Resume analysis uses an unchecked on-page consent box; enhanced matching requests permission before transmission. Permission is remembered for the account and feature on that device. Opening a feature or accepting general terms does not grant this permission.",
      "Withdraw remembered permission in Account → Account Center → AI preferences. This stops future requests but cannot recall data already processed. A different provider, purpose or material data-sharing change requires updated permission. Google’s practices are described in <a href=\"https://policies.google.com/privacy\">Google Privacy Policy</a>. AI output may be wrong or incomplete and is not professional advice, an employer ATS result or a hiring guarantee."
    ]
  },
  {
    "title": "9. Points, costs and referrals",
    "paragraphs": [
      "Review the amount shown before using a points-based feature. Points are service credits, not cash, wages, investments or a promise of redemption. This release does not provide a points-purchase checkout.",
      "Rewarded ads and referrals depend on eligibility and successful verification. Completing an unavailable, interrupted or unverified ad does not guarantee credit. Do not create fake accounts, manipulate referrals or automate ads. For a missing reward or disputed deduction, send the feature, amount and approximate time to support. Adjustments require investigation; they are not automatically guaranteed."
    ]
  },
  {
    "title": "10. Advertising and ad concerns",
    "paragraphs": [
      "Ads can be supplied by Google AdMob. Availability varies; an empty placement or an unavailable rewarded ad does not guarantee an app fault. Do not repeatedly tap ads or interact with advertisements to create artificial traffic.",
      "Use Ad privacy for available advertising choices. Tracking permission is optional and is distinct from choosing to watch a rewarded ad. Denying tracking must not require you to agree to tracking to use the app. Use Report an ad beside supported placements or in Account to describe inappropriate content. For full-screen ads, use the visible provider close or report control and return to Account to report a concern."
    ]
  },
  {
    "title": "11. Community guidelines and company reviews",
    "paragraphs": [
      "Only submit genuine, relevant experiences you are entitled to share. Do not publish harassment, threats, hateful or sexual content, spam, impersonation, unlawful allegations, confidential employer information, another person’s contact information or intellectual property violations. Avoid personal identifiers that are unnecessary to explain the experience.",
      "Reviews and edits are held for human moderation before publication. Pending or rejected reviews may remain visible to their author. A public first name and rating accompany approved reviews. Legacy reviews without an approval decision are not treated as approved.",
      "Use Report review to explain a concern. Block reviewer hides that member’s published reviews from your signed-in account; it does not remove them for everyone. Moderators can approve or reject reviews and suspend or restore review posting. Moderators should assess concerns promptly. Contact info@trikonet.com to request an explanation or appeal; publication is not guaranteed."
    ]
  },
  {
    "title": "12. Content ownership and employer permissions",
    "paragraphs": [
      "You retain rights in your submissions and permit Trikonet and necessary technical providers to host, format and display them for the requested services. This does not transfer ownership. Submit only content you have sufficient rights to provide.",
      "Employer logos, vacancy text, templates and other third-party materials remain subject to their owners’ rights. Employer submissions are additionally covered by <a href=\"/employer-terms\">Employer Terms</a>. These terms do not retroactively establish rights to previously imported material. Send rights concerns with identification of the material and your authority to act."
    ]
  },
  {
    "title": "13. Privacy, permissions and email alerts",
    "paragraphs": [
      "Read the <a href=\"/privacy-policy\">Privacy Policy</a> for data categories, providers and choices. Camera or file selection is used for the action you request. You can decline optional permissions, manage device settings and withdraw remembered AI permission.",
      "Manage email job alerts in Account Center or unsubscribe from alert emails. Essential security or account correspondence is separate from job alerts. Appearance offers System, Light or Dark and remembers the device preference."
    ]
  },
  {
    "title": "14. Deleting or restoring an account",
    "paragraphs": [
      "Open Account → Account Center → Delete account. Read the consequences, tick the confirmation and submit the deletion request. Your account is suspended and scheduled for permanent deletion after a 30-day recovery period.",
      "To cancel deletion, sign in with the same account before the displayed deadline and explicitly choose Restore my account. Signing in alone does not cancel deletion. After permanent deletion, recovery is unavailable. Uninstalling or signing out does not delete the account. Copies already submitted to employers or saved outside Trikonet are not recalled."
    ]
  },
  {
    "title": "15. Support and reports",
    "paragraphs": [
      "Help provides category-based answers and search. Choose Still need help after an answer to open the contact form with the category and question included. Use an email you can receive replies at.",
      "Describe the feature, device, approximate time and troubleshooting attempted. Do not send passwords, verification codes, financial credentials or identity documents. Successful submission provides a reference; an error does not confirm receipt. The form currently accepts text, not attachments. Support response times and outcomes are not guaranteed."
    ]
  },
  {
    "title": "16. Availability, changes and responsible use",
    "paragraphs": [
      "Online jobs, sign-in, rewards, analysis and submissions require connected services. Cached content may be outdated. Maintain your own copies of important exported documents. Updates can change features or costs, with applicable disclosures before use.",
      "Do not interfere with security, scrape or republish data without permission, manipulate reviews or rewards, or use Trikonet for unlawful discrimination, fraud or harassment. Access may be restricted to protect users and service integrity. Contact support to appeal an incorrect restriction."
    ]
  },
  {
    "title": "17. Consumer rights and disputes",
    "paragraphs": [
      "Nothing in these terms excludes rights or remedies that cannot lawfully be excluded. Service limitations and external-service responsibilities apply only to the extent permitted by applicable law.",
      "Contact info@trikonet.com with a clear description and relevant dates to seek resolution. These terms do not waive applicable privacy, consumer or employment protections."
    ]
  },
  {
    "title": "18. Updates and contact",
    "paragraphs": [
      "Updated 30 October 2026. Material changes to AI sharing require renewed permission where applicable. The published version describes current implementations; it is not an Apple approval, a guarantee against rejection or a certification of third-party content rights.",
      "Operator: Second Tales Solutions LLP. Support and privacy contact: <a href=\"mailto:info@trikonet.com\">info@trikonet.com</a>."
    ]
  }
]});
Object.assign(legalPages['/privacy-policy'], {updated:'30 October 2026',sections:[
  {
    "title": "Operator and scope",
    "paragraphs": [
      "Second Tales Solutions LLP operates Trikonet’s website and mobile applications. Contact <a href=\"mailto:info@trikonet.com\">info@trikonet.com</a> for privacy questions. Features differ across platforms and releases."
    ]
  },
  {
    "title": "Information you provide",
    "paragraphs": [
      "Account name, email and password credentials; optional career profile details; selected photos and resume documents; saved content, application activity and preferences; review text and ratings; support messages and submitted reports may be processed for the features you use. Passwords are stored using derived hashes rather than as readable account passwords.",
      "Guest job browsing does not require a candidate profile. Network requests and public-site browsing can still generate ordinary service or provider logs. Do not submit another person’s private data without appropriate authority."
    ]
  },
  {
    "title": "Sign-in providers",
    "paragraphs": [
      "Google and Apple supply sign-in information, including provider identity and verified email where available. Apple can provide a private relay email instead of your personal address. The native Apple flow requests name and email.",
      "Apple authorization information is verified by the backend; refresh credentials needed for revocation are encrypted server-side. Same verified email can link supported sign-in methods to an existing candidate account. Different email addresses are not automatically treated as the same identity."
    ]
  },
  {
    "title": "Purposes and technical providers",
    "paragraphs": [
      "Account information supports authentication, career tools, saved content and account recovery. Job and profile information supports discovery and recommendations. Reward events support points validation and fraud prevention. Reports support moderation and safety.",
      "Hosting and email delivery providers process the relevant request data. The in-app support form sends the account identifier, chosen reply email, topic, question context and message to Trikonet support through the configured email provider, Resend. We do not use the reply email to send arbitrary third-party messages."
    ]
  },
  {
    "title": "Optional AI: Google Gemini",
    "paragraphs": [
      "Resume analysis sends selected resume content, including personal information it contains, through Trikonet to Google Gemini for scoring and feedback. Enhanced matching can send career profile details and job information.",
      "Explicit feature-specific permission is required before the request. A tick and affirmative use of the analysis action grants permission; opening a feature or accepting general terms does not. Permission is remembered for the account and purpose on that device. Manage or withdraw it in Account Center → AI preferences. Clearing local storage or using a different device may require consent again.",
      "Withdrawal stops future requests but cannot recall previously submitted data. Provider processing follows <a href=\"https://policies.google.com/privacy\">Google Privacy Policy</a>. We do not promise provider retention, model-training exclusions or international-transfer arrangements beyond verified provider terms. Remove unnecessary personal details before submitting a resume."
    ]
  },
  {
    "title": "Advertising, tracking and rewards",
    "paragraphs": [
      "The website may use advertising services; iOS and Android mobile advertising integrations can use Google AdMob. Depending on platform, permission and configuration, ad providers can process IP address, device or advertising identifiers, ad interactions and diagnostics for delivery, measurement, reward verification and fraud prevention.",
      "App Tracking Transparency permission is requested where applicable. Denying tracking does not itself deny core app access. Watching a rewarded ad does not itself grant tracking permission. Available Ad privacy controls manage provider choices; device settings manage system permissions. <a href=\"https://policies.google.com/technologies/ads\">Google advertising information</a> explains provider practices.",
      "Use Report an ad to send a text description and placement to the moderation queue. Do not include unrelated private information. Ad availability and verified rewards are not guaranteed."
    ]
  },
  {
    "title": "Public reviews, blocking and moderation",
    "paragraphs": [
      "Approved company reviews display a first name, rating, text and dates. Reviews and edits are held for moderation; pending or rejected text can be visible to its author. Do not include sensitive or confidential information.",
      "Reporting stores the reporting account, review reference, reason and time. Blocking stores the account-to-reviewer preference so that reviewer’s content can be hidden from your account. Authorized moderators can inspect reports and pending reviews and restrict abusive review posting."
    ]
  },
  {
    "title": "Jobs, employers and external recipients",
    "paragraphs": [
      "Applications, emails or documents you intentionally send to employers are received under those recipients’ own policies. Trikonet cannot recall or delete their independent copies. Opening an external link can disclose ordinary network information to that destination.",
      "Public employer contact information and imported listings must be used lawfully with appropriate rights. Terms do not independently establish permission to collect or republish third-party personal information. Contact us about a listing or rights concern."
    ]
  },
  {
    "title": "Files, camera and device preferences",
    "paragraphs": [
      "Files and photos you select support resume or profile actions. Use the system picker where available. Permissions can be declined or changed in device settings; the specific action may then be unavailable.",
      "Local storage or app caches can hold sessions, profiles, resume drafts, public catalogue data, points snapshots, appearance and AI preferences. Clearing storage can remove local drafts and remembered choices. Downloaded files remain in your chosen device or external storage until you remove them."
    ]
  },
  {
    "title": "Email preferences and account security",
    "paragraphs": [
      "Job alerts are managed in Account Center and by the unsubscribe link in alert emails. Security codes, account changes and support responses are separate account correspondence.",
      "Password and email changes require verification. Reset codes expire and are rate-limited. Password-login failures are recorded under a hashed email key to enforce the three-attempt, 24-hour lock; a successful verified reset clears that lock. Security controls do not guarantee immunity from unauthorized access."
    ]
  },
  {
    "title": "Retention and deletion",
    "paragraphs": [
      "Account data is retained to provide the service and address support, abuse, security and applicable legal obligations. In-app deletion suspends the account and schedules permanent removal after 30 days, with explicit restoration available before the deadline.",
      "Removal covers account-owned profile and resume data, saved jobs, application history, reviews, review reports/block preferences and associated reward records handled by the account-deletion service. Copies held by employers or exported to your device are outside that deletion operation.",
      "Service logs, backups, support email and legally required records can have different retention periods. A universal 90-day backup-erasure guarantee has not been established. Contact us for the actual retention applicable to your records and any lawful reason for retaining them. Do not assume signing out or uninstalling deletes server records."
    ]
  },
  {
    "title": "Access, correction and withdrawal",
    "paragraphs": [
      "Edit available profile fields in Account. Withdraw AI permission through AI preferences, change optional device permissions in Settings and manage job alerts in Account Center. Request account deletion within the app.",
      "For a data-access copy, correction not available in the app, privacy complaint or other deletion request, email info@trikonet.com. We may verify account ownership without asking you to disclose passwords or sign-in codes."
    ]
  },
  {
    "title": "International processing and children",
    "paragraphs": [
      "Providers may process data where their infrastructure operates. Relevant provider notices describe their practices. We do not claim a particular residency guarantee without a documented arrangement.",
      "Trikonet is a career service, not a Kids Category product. Applicable age, consent and employment rules differ by location. If a child has submitted personal data without appropriate authorization, contact support so the situation can be investigated."
    ]
  },
  {
    "title": "Policy updates",
    "paragraphs": [
      "Updated 30 October 2026. We update notices when relevant features or processing changes. A materially different AI recipient or purpose requires updated disclosure and permission where applicable. Questions: <a href=\"mailto:info@trikonet.com\">info@trikonet.com</a>."
    ]
  }
]});

export function legalPageForPath(path) {
  const normalized = path.replace(/\/+$/, '') || '/';
  const canonical = normalized === '/terms-and-conditions' ? '/terms' : normalized === '/privacy' ? '/privacy-policy' : normalized;
  return legalPages[canonical] ? { ...legalPages[canonical], path: canonical } : null;
}

export function renderLegalContent(page) {
  return `<main class="legal-main"><p class="legal-eyebrow">TRIKONET · WEBSITE & APP</p><h1>${page.title}</h1><p class="legal-date">Last updated: ${page.updated || '11 October 2026'}</p><p class="legal-intro">${page.description}</p><nav class="legal-toc" aria-label="On this page"><strong>On this page</strong>${page.sections.map((s, i) => `<a href="#legal-section-${i + 1}">${s.title}</a>`).join('')}</nav><article>${page.sections.map((s, i) => `<section id="legal-section-${i + 1}"><h2>${s.title}</h2>${s.paragraphs.map(p => `<p>${p}</p>`).join('')}</section>`).join('')}</article><aside class="legal-contact"><h2>Need help?</h2><p>Email ${email} with questions about your account or these policies.</p></aside></main>`;
}

export const legalStyles = `
.legal-main{max-width:900px;margin:0 auto;padding:64px 24px 80px;color:#202b3c;line-height:1.8}
.legal-main h1{font-size:clamp(32px,5vw,48px);line-height:1.15;letter-spacing:-1.2px;margin:12px 0 16px;color:#132a48}
.legal-main h2{font-size:23px;line-height:1.4;margin:0 0 14px;color:#132a48}
.legal-eyebrow{font-size:12px;font-weight:700;letter-spacing:1.5px;color:#526984}
.legal-date{font-size:14px;color:#617187}.legal-intro{font-size:19px;color:#526078}
.legal-main a{color:#165da9;text-decoration:underline;text-underline-offset:3px;overflow-wrap:anywhere}
.legal-main a:focus-visible{outline:3px solid #f59e0b;outline-offset:4px;border-radius:2px}
.legal-main section{padding-top:34px;scroll-margin-top:24px}.legal-main p{margin:0 0 16px}
.legal-toc{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 24px;padding:24px;margin:32px 0 12px;background:#f3f7fb;border:1px solid #dbe5f0;border-radius:12px;font-size:14px}
.legal-toc strong{grid-column:1/-1;color:#132a48;margin-bottom:6px}.legal-contact{background:#f3f7fb;border-radius:12px;padding:24px;margin-top:40px}
@media(max-width:600px){.legal-main{padding:36px 20px 48px}.legal-toc{grid-template-columns:1fr;padding:20px}.legal-main h2{font-size:21px}}
`;

export function renderLegalDocument(page) {
  return `<!doctype html><html lang="en"><head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-0KY2S2NW0Y"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-0KY2S2NW0Y');
  </script>

<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${page.title} | Trikonet</title><meta name="description" content="${page.description}"><link rel="canonical" href="https://www.trikonet.com${page.path}"><link rel="icon" href="/favicon.ico"><link rel="stylesheet" href="/style.css?v=4.6"><link rel="stylesheet" href="/overrides.css?v=12.0"><link rel="stylesheet" href="/navigation.css?v=10.0"><link rel="stylesheet" href="/hero-modern.css?v=61.3"><style>body{margin:0;background:#fff;font-family:Arial,Helvetica,sans-serif}*{box-sizing:border-box}.legal-header{border-bottom:1px solid #e4eaf1}.legal-header-inner,.legal-footer-inner{max-width:1160px;margin:auto;padding:22px 24px;display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap}.legal-header img{width:150px;height:auto}.legal-header nav,.legal-footer nav{display:flex;gap:24px;flex-wrap:wrap}.legal-header a,.legal-footer a{color:#132a48;text-decoration:none;font-size:14px}.legal-header a:hover,.legal-footer a:hover{text-decoration:underline}.legal-footer{background:#f3f7fb;border-top:1px solid #dbe5f0;color:#526078;font-size:14px}.legal-footer a[aria-current=page]{font-weight:bold}.legal-skip{position:absolute;top:-60px;left:20px;padding:12px;background:#fff;color:#132a48}.legal-skip:focus{top:10px;z-index:2}${legalStyles}</style></head><body><a class="legal-skip" href="#legal-main">Skip to content</a>${renderSiteHeader({ path: page.path })}${renderLegalContent(page).replace('<main class="legal-main">', '<main id="legal-main" class="legal-main">')}${renderSiteFooter()}<script>document.addEventListener('click', event => { const header = event.target.closest('.footer-acc-header'); if (!header) return; const row = header.closest('.footer-acc-row'); const open = row.classList.toggle('open'); header.setAttribute('aria-expanded', String(open)); });</script><script src="/legal-navigation.js"></script></body></html>`;
}
