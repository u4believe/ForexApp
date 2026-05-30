import { useParams, useNavigate, Link } from 'react-router-dom';

const DOCS = {
  'privacy-policy': {
    title: 'Privacy Policy',
    updated: 'May 1, 2026',
    sections: [
      {
        heading: '1. Introduction',
        body: `CapitalPip Markets ("we", "us", or "our") is committed to protecting the privacy and security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our platform at capitalpipmarkets.com and any related services.\n\nBy creating an account or using our services, you consent to the data practices described in this policy. If you do not agree, please do not use our platform.`,
      },
      {
        heading: '2. Information We Collect',
        body: `We collect the following categories of personal information:\n\n• **Identity Data:** Full name, date of birth, government-issued ID documents (for KYC verification).\n• **Contact Data:** Email address, phone number, residential address.\n• **Financial Data:** Wallet addresses, transaction history, account balances, deposit and withdrawal records.\n• **Technical Data:** IP address, browser type and version, device identifiers, time-zone setting, operating system, and platform.\n• **Usage Data:** Information about how you use our website and services, including pages visited and features accessed.\n• **Communications:** Records of any correspondence you send us, including support requests.`,
      },
      {
        heading: '3. How We Use Your Information',
        body: `We use your personal information for the following purposes:\n\n• To create and manage your account.\n• To verify your identity and comply with Know Your Customer (KYC) and Anti-Money Laundering (AML) regulatory requirements.\n• To process deposits, investments, and withdrawals.\n• To send transactional emails, account notifications, and service updates.\n• To respond to your inquiries and provide customer support.\n• To detect, prevent, and investigate fraud, security breaches, and other illegal activities.\n• To comply with applicable laws, regulations, and legal processes.\n• To improve our platform and develop new features based on usage patterns.`,
      },
      {
        heading: '4. How We Share Your Information',
        body: `We do not sell, rent, or trade your personal information to third parties. We may share your information only in the following limited circumstances:\n\n• **Service Providers:** Trusted third-party companies that perform functions on our behalf (e.g., email delivery, cloud storage, KYC verification providers) under strict confidentiality obligations.\n• **Legal Compliance:** When required by law, court order, or regulatory authority, or to protect the rights, property, or safety of CapitalPip Markets, our users, or the public.\n• **Business Transfers:** In connection with a merger, acquisition, or sale of assets, subject to standard confidentiality protections.\n\nWe do not share your data with advertisers or marketing third parties.`,
      },
      {
        heading: '5. Data Retention',
        body: `We retain your personal information for as long as your account is active or as required by applicable law. KYC documents and transaction records may be retained for a minimum of five (5) years after account closure to comply with financial regulations.\n\nIf you delete your account, we will remove your personal data from active systems within 30 days, except where retention is required by law.`,
      },
      {
        heading: '6. Security',
        body: `We implement industry-standard security measures to protect your information, including:\n\n• 256-bit SSL/TLS encryption for all data transmission.\n• Encrypted storage for sensitive credentials and documents.\n• Private, access-controlled storage buckets for KYC documents.\n• Regular security audits and vulnerability assessments.\n• Restricted administrative access to user data.\n\nWhile we take reasonable precautions, no method of transmission over the internet is 100% secure. You are responsible for maintaining the confidentiality of your account credentials.`,
      },
      {
        heading: '7. Your Rights',
        body: `Depending on your jurisdiction, you may have the following rights regarding your personal data:\n\n• **Access:** Request a copy of the personal data we hold about you.\n• **Correction:** Request correction of inaccurate or incomplete data.\n• **Deletion:** Request deletion of your data, subject to legal retention requirements.\n• **Portability:** Request your data in a structured, machine-readable format.\n• **Objection:** Object to certain uses of your data.\n\nTo exercise any of these rights, please contact us at support.capitalpip@gmail.com. We will respond within 30 days.`,
      },
      {
        heading: '8. Cookies',
        body: `We use essential cookies and local storage to maintain your session and preferences (such as your chosen display theme). We do not use advertising or tracking cookies. You may disable cookies in your browser settings, though this may affect platform functionality.`,
      },
      {
        heading: '9. Changes to This Policy',
        body: `We may update this Privacy Policy from time to time. When we make material changes, we will notify you by email or a prominent notice on our platform. Your continued use of the platform after changes take effect constitutes acceptance of the updated policy.`,
      },
      {
        heading: '10. Contact Us',
        body: `If you have questions or concerns about this Privacy Policy or our data practices, please contact us:\n\n• Email: support.capitalpip@gmail.com\n• WhatsApp: +1 (757) 832-4485`,
      },
    ],
  },

  'terms-of-service': {
    title: 'Terms of Service',
    updated: 'May 1, 2026',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        body: `These Terms of Service ("Terms") govern your use of the CapitalPip Markets platform and all related services ("Services"). By registering an account or accessing our platform, you confirm that you have read, understood, and agree to be bound by these Terms.\n\nIf you do not agree with any part of these Terms, you must not use our Services.`,
      },
      {
        heading: '2. Eligibility',
        body: `To use CapitalPip Markets, you must:\n\n• Be at least 18 years of age.\n• Have the legal capacity to enter into binding contracts in your jurisdiction.\n• Not be a resident of a jurisdiction where our services are prohibited or restricted by law.\n• Not be listed on any government sanctions list or designated as a prohibited person.\n\nBy registering, you represent and warrant that you meet all eligibility requirements.`,
      },
      {
        heading: '3. Account Registration and Security',
        body: `You agree to provide accurate, current, and complete information during registration and to keep your account information up to date. You are responsible for:\n\n• Maintaining the confidentiality of your login credentials.\n• All activities that occur under your account.\n• Notifying us immediately at support.capitalpip@gmail.com if you suspect unauthorized access.\n\nWe reserve the right to suspend or terminate accounts where we suspect fraud, misrepresentation, or violation of these Terms.`,
      },
      {
        heading: '4. Identity Verification (KYC)',
        body: `We are required by applicable financial regulations to verify the identity of all users. You must complete our Know Your Customer (KYC) process by submitting a valid government-issued ID and other required documentation.\n\n• Account features are limited until KYC is approved.\n• Withdrawals are only available to fully verified accounts.\n• We reserve the right to request additional documentation at any time.\n• Providing false or fraudulent documentation is grounds for immediate account termination and may be reported to relevant authorities.`,
      },
      {
        heading: '5. Investment Plans and Returns',
        body: `CapitalPip Markets offers structured investment plans with stated return ranges of 7–15% bi-weekly across Forex, Cryptocurrency, and Equity markets. By selecting a plan:\n\n• You acknowledge that stated return ranges are targets based on historical performance and are not guaranteed.\n• Your investment request is subject to admin approval before becoming active.\n• Actual returns may vary based on market conditions during each cycle.\n• Past performance does not guarantee future results.\n• You may switch between eligible plans at any time, subject to balance requirements and approval.`,
      },
      {
        heading: '6. Deposits',
        body: `All deposits must be notified through the platform after sending funds to the provided wallet addresses. We credit funds to your account balance upon confirmation of receipt. We are not responsible for funds sent to incorrect addresses or funds lost due to network errors outside our control.`,
      },
      {
        heading: '7. Withdrawals',
        body: `Withdrawal requests are subject to the following conditions:\n\n• Your account must be fully verified (KYC approved).\n• Withdrawal requests are reviewed and processed within 24–48 business hours.\n• We reserve the right to conduct additional verification for large withdrawals.\n• We are not liable for delays caused by blockchain network congestion or third-party payment processors.`,
      },
      {
        heading: '8. Prohibited Activities',
        body: `You agree not to use CapitalPip Markets for any of the following:\n\n• Money laundering, terrorist financing, or any other illegal financial activity.\n• Creating multiple accounts or impersonating another person.\n• Attempting to gain unauthorized access to our systems or other users' accounts.\n• Distributing malware, viruses, or other harmful code.\n• Any activity that disrupts, damages, or interferes with our platform.\n• Providing false information or documentation.\n\nViolation of these prohibitions may result in immediate account termination and referral to law enforcement.`,
      },
      {
        heading: '9. Limitation of Liability',
        body: `To the maximum extent permitted by applicable law, CapitalPip Markets and its officers, directors, employees, and agents shall not be liable for:\n\n• Any indirect, incidental, special, or consequential damages.\n• Loss of profits, revenue, data, or investment returns.\n• Damages arising from market volatility, platform downtime, or force majeure events.\n\nOur total liability for any claim arising from these Terms shall not exceed the amount you deposited in the 30 days preceding the claim.`,
      },
      {
        heading: '10. Termination',
        body: `We may suspend or terminate your account at our sole discretion, with or without notice, for reasons including but not limited to: breach of these Terms, suspected fraud, regulatory requirements, or inactivity.\n\nYou may close your account at any time by using the "Delete Account" option in your profile settings or by contacting support. Termination does not affect any obligations that arose prior to termination.`,
      },
      {
        heading: '11. Governing Law',
        body: `These Terms shall be governed by and construed in accordance with applicable international financial regulations. Any disputes shall first be attempted to be resolved through good-faith negotiation. If unresolved, disputes shall be submitted to binding arbitration.`,
      },
      {
        heading: '12. Changes to Terms',
        body: `We reserve the right to modify these Terms at any time. Material changes will be communicated via email or a platform notice at least 7 days before they take effect. Your continued use of the platform constitutes acceptance of the updated Terms.`,
      },
      {
        heading: '13. Contact',
        body: `For questions about these Terms, contact us at:\n\n• Email: support.capitalpip@gmail.com\n• WhatsApp: +1 (757) 832-4485`,
      },
    ],
  },

  'risk-disclosure': {
    title: 'Risk Disclosure',
    updated: 'May 1, 2026',
    sections: [
      {
        heading: 'Important Notice',
        body: `This Risk Disclosure Statement is provided by CapitalPip Markets to ensure that all clients understand the material risks associated with investing in Forex, Cryptocurrency, and Equity markets. Please read this document carefully before investing. If you have any questions, contact us at support.capitalpip@gmail.com.`,
      },
      {
        heading: '1. General Investment Risk',
        body: `All investments carry risk. The value of investments can go down as well as up. You may receive back less than the amount you originally invested. There is no guarantee that any stated return target will be achieved in any given cycle or over any time period.\n\nYou should only invest funds that you can afford to lose entirely without affecting your financial well-being or lifestyle.`,
      },
      {
        heading: '2. Forex (Foreign Exchange) Risk',
        body: `Foreign exchange trading involves significant risk due to:\n\n• **Market Volatility:** Currency values can fluctuate rapidly and unpredictably due to economic data, geopolitical events, and central bank policy decisions.\n• **Leverage Risk:** While our managed accounts do not expose you to direct leverage, underlying trading strategies may involve leveraged instruments.\n• **Liquidity Risk:** During periods of extreme market stress, it may be difficult to execute trades at expected prices.\n• **Counterparty Risk:** The risk that a trading counterparty may default on their obligations.`,
      },
      {
        heading: '3. Cryptocurrency Risk',
        body: `Investing in or through cryptocurrency markets carries additional unique risks:\n\n• **Extreme Volatility:** Cryptocurrency prices can change dramatically within minutes or hours.\n• **Regulatory Risk:** Governments worldwide may restrict, regulate, or ban cryptocurrency activities, which could affect asset values.\n• **Technology Risk:** Smart contract vulnerabilities, blockchain forks, or exchange failures can result in loss of funds.\n• **No Deposit Insurance:** Cryptocurrency holdings are not insured by any government or financial authority.\n• **Irreversibility:** Cryptocurrency transactions are generally irreversible once confirmed on the blockchain.`,
      },
      {
        heading: '4. Equity Market Risk',
        body: `Equity investments are subject to:\n\n• **Market Risk:** Stock prices fluctuate based on company performance, economic conditions, and investor sentiment.\n• **Sector Risk:** Concentrated exposure to specific sectors (e.g., technology) can amplify losses during sector downturns.\n• **Geopolitical Risk:** Political instability, trade disputes, and international conflicts can impact equity markets globally.\n• **Company-Specific Risk:** Individual companies may experience adverse events such as earnings shortfalls, management failures, or litigation.`,
      },
      {
        heading: '5. Platform and Operational Risk',
        body: `• **System Downtime:** Our platform may experience technical issues that temporarily prevent access to your account.\n• **Cybersecurity Risk:** Despite our security measures, no system is completely immune to cyberattacks or data breaches.\n• **Third-Party Dependency:** We rely on third-party infrastructure and blockchain networks that are outside our direct control.`,
      },
      {
        heading: '6. Returns Are Not Guaranteed',
        body: `The return ranges of 7–15% bi-weekly stated on our platform represent historical performance targets and are not a guarantee of future results. Actual returns in any given period may be lower, and in periods of adverse market conditions, your account balance may not grow as expected.\n\nCapitalPip Markets does not guarantee any specific level of return, and you should not make financial plans based on anticipated returns.`,
      },
      {
        heading: '7. Liquidity Risk',
        body: `Your funds are committed for investment cycles. While withdrawals are generally processed within 24–48 hours for verified accounts, there may be circumstances — such as extreme market conditions or regulatory requirements — where processing is delayed. You should not invest funds that you may urgently need access to.`,
      },
      {
        heading: '8. Regulatory Risk',
        body: `The regulatory landscape for digital assets and online investment platforms continues to evolve. Changes in applicable laws or regulations may affect our ability to operate in certain jurisdictions, the availability of certain services, or the tax treatment of your returns.`,
      },
      {
        heading: '9. Suitability',
        body: `Investment in financial markets through CapitalPip Markets may not be suitable for all investors. You should carefully consider your:\n\n• Financial situation and overall portfolio\n• Investment experience and knowledge\n• Risk tolerance and investment objectives\n• Ability to sustain a total or partial loss of invested capital\n\nIf you are uncertain whether our services are appropriate for you, we recommend consulting an independent financial advisor before investing.`,
      },
      {
        heading: '10. Acknowledgement',
        body: `By using CapitalPip Markets, you acknowledge that:\n\n• You have read and understood this Risk Disclosure Statement.\n• You accept all risks associated with investing through our platform.\n• You are investing only funds you can afford to lose.\n• Past performance is not indicative of future results.`,
      },
    ],
  },

  'aml-policy': {
    title: 'Anti-Money Laundering (AML) Policy',
    updated: 'May 1, 2026',
    sections: [
      {
        heading: '1. Policy Statement',
        body: `CapitalPip Markets is firmly committed to preventing money laundering, terrorist financing, and all other forms of financial crime. We maintain a robust Anti-Money Laundering (AML) and Counter-Terrorism Financing (CTF) program in accordance with applicable international financial regulations and standards, including the recommendations of the Financial Action Task Force (FATF).\n\nThis policy applies to all employees, contractors, and users of the CapitalPip Markets platform.`,
      },
      {
        heading: '2. Know Your Customer (KYC)',
        body: `All users are required to complete our KYC verification process before accessing full platform features. This includes:\n\n• **Identity Verification:** Submission of a valid, government-issued photo ID (passport, national ID, or driver's license).\n• **Address Verification:** Confirmation of residential address.\n• **Liveness Check:** Where required, a selfie or live verification to confirm the document matches the account holder.\n\nWe reserve the right to request additional documentation at any time, including proof of source of funds for large transactions.`,
      },
      {
        heading: '3. Customer Due Diligence (CDD)',
        body: `We apply a risk-based approach to customer due diligence:\n\n• **Standard CDD:** Applied to all customers at registration and periodically thereafter.\n• **Enhanced Due Diligence (EDD):** Applied to customers identified as higher risk, including Politically Exposed Persons (PEPs), customers from high-risk jurisdictions, or those conducting unusually large transactions.\n• **Simplified CDD:** May apply in limited, low-risk circumstances as permitted by applicable regulations.`,
      },
      {
        heading: '4. Politically Exposed Persons (PEPs)',
        body: `We apply enhanced scrutiny to accounts held by, or associated with, Politically Exposed Persons — individuals who hold or have held prominent public positions — as well as their immediate family members and close associates.\n\nPEPs are not automatically prohibited from using our services but are subject to mandatory Enhanced Due Diligence and ongoing monitoring.`,
      },
      {
        heading: '5. Sanctions Screening',
        body: `All customers are screened against internationally recognized sanctions lists, including those maintained by:\n\n• The Office of Foreign Assets Control (OFAC)\n• The United Nations Security Council (UNSC)\n• The European Union (EU) sanctions lists\n• Her Majesty's Treasury (UK)\n\nWe will not open accounts for, or provide services to, individuals or entities on any applicable sanctions list.`,
      },
      {
        heading: '6. Transaction Monitoring',
        body: `We continuously monitor transactions for indicators of suspicious activity, including:\n\n• Unusually large deposits or withdrawals that are inconsistent with the customer's profile.\n• Rapid movement of funds without apparent investment purpose.\n• Transactions from or to high-risk jurisdictions.\n• Multiple accounts or transactions designed to evade reporting thresholds.\n• Deposits followed immediately by full withdrawal requests.\n\nUsers may be required to provide documentation explaining the source of funds at any time.`,
      },
      {
        heading: '7. Suspicious Activity Reporting',
        body: `Where we have reasonable grounds to suspect that a transaction may relate to money laundering, terrorist financing, or other financial crime, we are obligated to file a Suspicious Activity Report (SAR) or Suspicious Transaction Report (STR) with the relevant financial intelligence unit, without notifying the customer (the "tipping off" prohibition).\n\nWe cooperate fully with law enforcement and regulatory authorities in all financial crime investigations.`,
      },
      {
        heading: '8. Prohibited Activities',
        body: `The following activities are strictly prohibited on CapitalPip Markets:\n\n• Depositing funds derived from illegal activities.\n• Using the platform to layer, integrate, or place illicit funds.\n• Providing false information during KYC or verification.\n• Using the platform on behalf of a third party without disclosure.\n• Structuring transactions to avoid reporting requirements.\n\nAny account found to be engaged in these activities will be immediately suspended, funds may be frozen, and the matter referred to relevant authorities.`,
      },
      {
        heading: '9. Record Keeping',
        body: `We retain all KYC documents, transaction records, and related correspondence for a minimum of five (5) years after account closure, or longer where required by applicable law. These records may be made available to regulatory authorities upon lawful request.`,
      },
      {
        heading: '10. Training and Compliance',
        body: `All personnel with customer-facing or financial oversight responsibilities receive regular training on AML/CTF obligations, red-flag indicators, and reporting procedures. Our AML program is reviewed and updated periodically to reflect changes in regulatory requirements and emerging threats.`,
      },
      {
        heading: '11. Contact',
        body: `To report concerns about potential money laundering or financial crime, or for questions about this policy, contact our compliance team:\n\n• Email: support.capitalpip@gmail.com\n• WhatsApp: +1 (757) 832-4485`,
      },
    ],
  },
};

function renderBody(text) {
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <br key={i} />;
    // Bold **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
    const isBullet = line.trimStart().startsWith('•');
    return isBullet
      ? <li key={i} style={{ marginBottom: '6px' }}>{parts}</li>
      : <p key={i} style={{ margin: '0 0 10px', lineHeight: 1.75 }}>{parts}</p>;
  });
}

export default function LegalPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const doc = DOCS[slug];

  if (!doc) return navigate('/');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', color: 'var(--text-primary)' }}>
      {/* Top bar */}
      <div style={{
        background: 'var(--section-bg)', borderBottom: '1px solid var(--border)',
        padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--gold-500)', fontSize: '0.85rem', fontWeight: 600 }}>
          ← Back to Home
        </Link>
        <span style={{ color: 'var(--border)', fontSize: '1rem' }}>|</span>
        <span style={{ fontSize: '0.72rem', color: 'var(--gold-500)', letterSpacing: '0.15em', fontWeight: 700 }}>◆ CAPITALPIP MARKETS</span>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '48px 32px 80px' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: '8px' }}>
          {doc.title}
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-faint)', marginBottom: '40px' }}>
          Last updated: {doc.updated}
        </p>

        {doc.sections.map((section) => (
          <div key={section.heading} style={{ marginBottom: '36px' }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.1rem', fontWeight: 600,
              color: 'var(--gold-600)',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: '1px solid var(--border-light)',
            }}>
              {section.heading}
            </h2>
            <ul style={{ paddingLeft: '18px', margin: 0, listStyle: 'none' }}>
              <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                {renderBody(section.body)}
              </div>
            </ul>
          </div>
        ))}

        <div style={{
          marginTop: '48px', padding: '20px 24px',
          background: 'var(--section-bg)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', fontSize: '0.84rem',
          color: 'var(--text-muted)', lineHeight: 1.65,
        }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Questions about this document?</strong>
          <br />Contact us at{' '}
          <a href="mailto:support.capitalpip@gmail.com" style={{ color: 'var(--gold-600)' }}>
            support.capitalpip@gmail.com
          </a>{' '}
          or WhatsApp{' '}
          <a href="https://wa.me/17578324485" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold-600)' }}>
            +1 (501) 229-3767
          </a>
        </div>

        {/* Navigation between docs */}
        <div style={{ marginTop: '32px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {Object.entries(DOCS).map(([s, d]) => (
            <Link
              key={s}
              to={`/legal/${s}`}
              style={{
                padding: '6px 14px', borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem', textDecoration: 'none',
                background: s === slug ? 'rgba(201,168,76,0.15)' : 'var(--section-bg)',
                border: `1px solid ${s === slug ? 'rgba(201,168,76,0.4)' : 'var(--border)'}`,
                color: s === slug ? 'var(--gold-600)' : 'var(--text-faint)',
                fontWeight: s === slug ? 600 : 400,
              }}
            >
              {d.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
