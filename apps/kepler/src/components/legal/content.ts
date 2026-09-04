export type LegalTabId = "about" | "contact" | "terms" | "return-policy" | "privacy";

export interface LegalSection {
  heading?: string;
  paragraphs: string[];
}

export interface LegalTab {
  id: LegalTabId;
  label: string;
  heading: string;
  lastUpdated?: string;
  sections: LegalSection[];
}

// Terms, Return Policy, and Privacy are the real drafted text (pending the fill-ins
// noted inline below — see PLACEHOLDER markers) — not engineering placeholders.
export const LEGAL_TABS: LegalTab[] = [
  {
    id: "about",
    label: "About Us",
    heading: "About Soraia",
    sections: [
      {
        paragraphs: [
          "Created by Dhaval Udeshi, Afsana Verma, and Amit Verma, with design by Gauri Khan, Soraia is Mumbai's first glasshouse restaurant, with cuisine by Chef Hitesh Shanbhag that reimagines Indian flavors through European technique.",
          "Its “Mélange India” bar offers region-inspired cocktails, making Soraia a harmonious experience where culture, craft, and curiosity meet under the stars.",
          "Soraia is operated by Innercircle Hospitality LLP, Bandra West, Mumbai.",
        ],
      },
    ],
  },
  {
    id: "contact",
    label: "Contact Us",
    heading: "Contact Us",
    sections: [
      {
        paragraphs: [
          "Royal Western India Turf Club, Mahalaxmi Race Course, Mahalaxmi, Mumbai, Maharashtra 400011.",
          "For reservations and party enquiries, call +91 90049 58000.",
          "Follow us on Instagram @soraiabombay for updates and events.",
        ],
      },
    ],
  },
  {
    id: "terms",
    label: "Terms & Conditions",
    heading: "Terms and Conditions",
    sections: [
      {
        paragraphs: [
          'These Terms and Conditions ("Terms") govern your access to and use of the website located at soraia.in and any associated payment-link pages (collectively, the "Platform"), operated for Innercircle Hospitality LLP, Mumbai, trading as "Soraia" ("Soraia", "we", "us", "our"). By accessing the Platform, creating a payment link, or making a payment through it, you ("User", "Customer", "you") agree to be bound by these Terms.',
        ],
      },
      {
        heading: "1. The Platform and the Role of Eigensu / InnerCircle",
        paragraphs: [
          'The software, source code, infrastructure and payment-link functionality that make up the Platform are designed, developed, licensed and made available by Eigensu, the operating brand of InnerCircle Private Limited, a company incorporated under the Companies Act, 2013 ("InnerCircle"). Eigensu and InnerCircle act solely as a technology and software provider to Soraia. They are not a restaurant, food or hospitality service provider, payment aggregator, payment gateway, or bank, and are not a party to any transaction between you and Soraia.',
        ],
      },
      {
        heading: "2. Nature of the Service",
        paragraphs: [
          'The Platform allows authorised Soraia staff to generate a unique, time-bound "Payment Link" for a specified amount, which is shared with a Customer (typically over WhatsApp or phone) to collect payment in connection with a reservation, order, or other arrangement made directly with Soraia. The Platform does not itself offer any goods, services, menu, or booking facility to the public; all commercial arrangements (what is being paid for, at what price, and on what terms) are agreed exclusively between you and Soraia outside the Platform.',
        ],
      },
      {
        heading: "3. Payment Processing",
        paragraphs: [
          '3.1 Payments are processed through ICICI Bank Limited\'s payment gateway ("Payment Gateway"). When you pay via a Payment Link, you are redirected to a page hosted and secured by the Payment Gateway; card, UPI and net-banking credentials are entered directly there and are never received, stored, or processed by Soraia, Eigensu, or InnerCircle.',
          "3.2 Funds paid through a Payment Link are credited directly to Soraia's own bank account with the Payment Gateway. At no point do Eigensu or InnerCircle receive, hold, control, or have custody of any funds paid by a Customer. Eigensu and InnerCircle are accordingly not affiliated with, and bear no responsibility or liability for, any payment, non-payment, delayed payment, failed transaction, duplicate charge, or Payment Gateway error — such matters are between you, Soraia, and the Payment Gateway, and are subject to the Payment Gateway's own terms.",
          "3.3 Any dispute concerning the amount charged, the goods or services paid for, refunds, or the conduct of Soraia's staff must be raised directly with Soraia using the contact details in Clause 10.",
        ],
      },
      {
        heading: "4. Prohibited and Illegal Use",
        paragraphs: [
          "4.1 The Platform, and any Payment Link generated through it, may be used solely for legitimate payments owed to Soraia in the ordinary course of its restaurant business. You must not use, and must not assist or permit any third party to use, the Platform or a Payment Link for any unlawful, fraudulent, or unauthorised purpose, including without limitation money laundering, terrorist financing, evasion of tax or exchange control laws, sale or collection of funds for unlawful goods or services, phishing, or impersonation of Soraia.",
          "4.2 Eigensu and InnerCircle expressly disclaim any association with, responsibility for, and liability arising out of any illegal, fraudulent, unauthorised, or otherwise unlawful payment made, attempted, or solicited through the Platform, whether by Soraia, a Customer, staff member, or any third party. Soraia is solely responsible for the legality and authorisation of every Payment Link it issues and every payment it collects.",
          "4.3 Eigensu and InnerCircle reserve the right, without prior notice, to suspend or disable access to the Platform, and to disclose relevant information to law enforcement, regulators, or the Payment Gateway, where they reasonably suspect unlawful, fraudulent, or unauthorised activity.",
        ],
      },
      {
        heading: "5. Intellectual Property",
        paragraphs: [
          'All right, title and interest in and to the Platform — including its source code, object code, software architecture, design, databases, workflows, and the "Eigensu" name and marks — is and shall remain the exclusive property of InnerCircle Private Limited. Nothing in these Terms transfers or licenses any intellectual property right in the Platform to Soraia, any Customer, or any other person, save for Soraia’s limited, non-exclusive, non-transferable right to use the Platform to conduct its business, and a Customer’s limited right to access a Payment Link to make a payment. No right is granted to copy, reverse-engineer, resell, sublicense, or create derivative works from the Platform.',
        ],
      },
      {
        heading: "6. No Warranty; Limitation of Liability",
        paragraphs: [
          'The Platform is provided "as is" and "as available", without warranty of any kind, express or implied, including as to availability, accuracy, or fitness for a particular purpose.',
          "To the maximum extent permitted by law, Eigensu and InnerCircle shall not be liable for any indirect, incidental, special, or consequential loss, or for any loss of profit, revenue, or data, arising out of or in connection with the Platform, a Payment Link, or any payment made through it. Where any liability cannot lawfully be excluded, it is limited, in aggregate, to the platform licence fee paid by Soraia in the preceding 12 months.",
          "Nothing in this Clause 6 limits Soraia's own responsibility to its Customers for the goods, services, refunds, or reservations it sells, which remains Soraia's alone.",
        ],
      },
      {
        heading: "7. Indemnity",
        paragraphs: [
          "Soraia and each Customer agree to indemnify and hold harmless Eigensu and InnerCircle, their officers, employees, and affiliates, from and against any claim, loss, liability, or expense (including reasonable legal fees) arising from (a) their use of the Platform in breach of these Terms, (b) any payment they make, collect, or facilitate, whether lawful or unlawful, and (c) any dispute between a Customer and Soraia concerning the underlying goods or services.",
        ],
      },
      {
        heading: "8. Third-Party Services",
        paragraphs: [
          "The Payment Gateway, email delivery, and other third-party services integrated into the Platform are governed by their own terms and privacy policies, which you are responsible for reviewing. Eigensu and InnerCircle are not responsible for the acts or omissions of such third parties.",
        ],
      },
      {
        heading: "9. Changes; Termination",
        paragraphs: [
          "We may update these Terms or suspend or discontinue the Platform at any time. Continued use after an update constitutes acceptance of the revised Terms.",
        ],
      },
      {
        heading: "10. Grievance / Contact",
        paragraphs: [
          "For questions about a payment, reservation, or these Terms, contact Soraia at: +91 90049 58000.",
          "For questions about the Platform's technology, contact Eigensu.",
        ],
      },
      {
        heading: "11. Governing Law and Jurisdiction",
        paragraphs: [
          "These Terms are governed by the laws of India. Subject to Clause 4 and 7, the courts at Mumbai, Maharashtra shall have exclusive jurisdiction over any dispute arising out of or in connection with these Terms or the Platform.",
        ],
      },
    ],
  },
  {
    id: "privacy",
    label: "Privacy Policy",
    heading: "Privacy Policy",
    sections: [
      {
        paragraphs: [
          "This Privacy Policy explains how information is collected and used when you interact with the Platform operated for Soraia and licensed from Eigensu, a product of InnerCircle Private Limited. It is issued in compliance with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and, where applicable, the Digital Personal Data Protection Act, 2023.",
        ],
      },
      {
        heading: "1. Who Controls Your Data",
        paragraphs: [
          "For information collected about you as a Customer (your name, phone number, and email address entered by Soraia staff to generate a Payment Link, or your payment outcome), Soraia is the data controller/fiduciary — it determines why that information is collected. Eigensu and InnerCircle act only as a data processor, hosting and operating the underlying software and database on Soraia's instructions; they do not sell, rent, or independently use Customer data for their own marketing or other unrelated purposes.",
        ],
      },
      {
        heading: "2. Information We Collect",
        paragraphs: [
          "Customer information: name, phone number, and/or email address, entered by Soraia staff when creating a Payment Link, and used solely to identify the payment and, where applicable, to receive a payment receipt from the Payment Gateway.",
          "Payment and transaction data: amount, payment status, timestamps, and the transaction reference issued by the Payment Gateway. We do not collect, see, or store your card number, CVV, UPI PIN, or net-banking credentials — these are entered directly on ICICI Bank's own hosted payment page.",
          "Gateway callback data: the Payment Gateway sends us confirmation messages about each transaction (amount, status, reference number), which we store as a record of what happened, primarily to resolve disputes and reconcile payments.",
          "Staff account data: for Soraia staff and admin users, we collect name, email, and a securely hashed password (never the password itself) to operate their login.",
          "Technical data: standard web server logs (IP address, browser type, timestamps) generated by normal operation of the website.",
        ],
      },
      {
        heading: "3. How We Use Information",
        paragraphs: [
          "Information is used only to: generate and process a requested Payment Link; confirm and reconcile whether a payment succeeded; send an email alert to Soraia staff/admin where a payment link requires approval; investigate and resolve payment disputes or suspected fraud; and maintain the security and proper functioning of the Platform. We do not use Customer information for advertising, and we do not sell personal information to any third party.",
        ],
      },
      {
        heading: "4. Sharing of Information",
        paragraphs: [
          "We share information only with: (a) ICICI Bank Limited, as the Payment Gateway, to the extent necessary to process your payment; (b) our email delivery provider, to deliver transactional email alerts; (c) Soraia's own authorised staff and admin, who can see payment links and their status; and (d) law enforcement or regulators, where required by law or a valid legal process. We do not otherwise share, sell, or disclose personal information to third parties.",
        ],
      },
      {
        heading: "5. Data Retention",
        paragraphs: [
          "Payment and transaction records are retained for as long as reasonably necessary for accounting, tax, dispute-resolution, and regulatory purposes, in line with applicable law, after which they are deleted or anonymised. Staff account data is retained for the duration of employment/engagement with Soraia and a reasonable period thereafter.",
        ],
      },
      {
        heading: "6. Security",
        paragraphs: [
          "We apply reasonable technical and organisational measures to protect information, including encrypted transmission (HTTPS), hashed password storage, and access controls limiting staff visibility to their own records (with full visibility reserved to Soraia's admin). No method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
        ],
      },
      {
        heading: "7. Your Rights",
        paragraphs: [
          "Subject to applicable law, you may request access to, correction of, or deletion of your personal information by contacting Soraia at +91 90049 58000. We may retain certain information where required for legal, accounting, or fraud-prevention purposes even after a deletion request.",
        ],
      },
      {
        heading: "8. Children's Privacy",
        paragraphs: [
          "The Platform is not directed at, and we do not knowingly collect personal information from, individuals under the age of 18.",
        ],
      },
      {
        heading: "9. Grievance Officer",
        paragraphs: [
          "In accordance with the Information Technology Act, 2000 and rules made thereunder, the Grievance Officer is:",
          "Address: Ground Floor, G-1, Yellow House 4, Pali Village, Bandra West, Mumbai, Maharashtra 400050",
        ],
      },
      {
        heading: "10. Changes to This Policy",
        paragraphs: [
          'We may update this Privacy Policy from time to time. Material changes will be reflected by updating the "Last updated" date above.',
        ],
      },
    ],
  },
  {
    id: "return-policy",
    label: "Return Policy",
    heading: "Return, Refund and Cancellation Policy",
    sections: [
      {
        paragraphs: [
          "This policy applies to payments made to Soraia through a Payment Link on this Platform.",
        ],
      },
      {
        heading: "1. Nature of Payment",
        paragraphs: [
          "A Payment Link collects an advance or full payment for a reservation, order, or other arrangement agreed directly between you and Soraia. It is not a general e-commerce purchase of goods, and no goods are shipped or delivered through the Platform.",
        ],
      },
      {
        heading: "2. Who Decides Refunds",
        paragraphs: [
          "All decisions regarding cancellation, refund eligibility, and refund amount rest solely with Soraia, as the party that received your payment and the party with whom you made your reservation or order. Eigensu and InnerCircle provide only the software used to generate and process the Payment Link; they do not decide, approve, hold funds for, or issue any refund, and bear no liability for Soraia's refund decisions or delays.",
        ],
      },
      {
        heading: "3. Requesting a Cancellation or Refund",
        paragraphs: [
          "To request a cancellation or refund, contact Soraia directly at +91 90049 58000, quoting the payment reference and the phone number or email used at the time of payment. Eligibility for a full refund, partial refund, or rescheduling is at Soraia's discretion based on how much notice is given before the reserved time; requests made with little or no notice may not be eligible for a refund.",
        ],
      },
      {
        heading: "4. Refund Method and Timeline",
        paragraphs: [
          "Approved refunds are issued to the original payment method used, via the Payment Gateway. Once Soraia initiates a refund, the time it takes for the amount to reflect in your account depends on your bank or card issuer and on ICICI Bank's standard timelines — this timeline is determined by the Payment Gateway and your bank, not by Soraia, Eigensu, or InnerCircle. No cash refunds are issued for payments made online.",
        ],
      },
      {
        heading: "5. Failed, Duplicate, or Unconfirmed Payments",
        paragraphs: [
          "If an amount is debited from your account but the Payment Link does not confirm success, do not attempt payment again until you have confirmed the status with Soraia. Our systems automatically reconcile payments with the Payment Gateway to detect and resolve such cases; a genuinely failed or duplicate charge that never reached Soraia will be reversed by the Payment Gateway/your bank in the ordinary course. If it is not resolved promptly, contact Soraia with your payment reference.",
        ],
      },
      {
        heading: "6. Disputes and Chargebacks",
        paragraphs: [
          "Any dispute about the underlying reservation, order, or service quality must be raised with Soraia directly and is governed by the Terms and Conditions above, including the jurisdiction clause. Eigensu and InnerCircle are not a party to, and will not participate in, any chargeback or dispute process concerning funds paid to Soraia, except to the extent necessary to provide transaction records as the software provider.",
        ],
      },
      {
        heading: "7. Contact",
        paragraphs: ["For all cancellation and refund requests: +91 90049 58000."],
      },
    ],
  },
];

export const DEFAULT_LEGAL_TAB: LegalTabId = "about";
