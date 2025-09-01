import React, { useState, useEffect } from 'react';
import '../styles/TermsConditions.css';

const sections = [
  { id: 'introduction', title: '1. Introduction' },
  { id: 'eligibility', title: '2. User Eligibility' },
  { id: 'accounts', title: '3. User Accounts' },
  { id: 'listing', title: '4. Listing & Swapping Items' },
  { id: 'payments', title: '5. Payments & Commission' },
  { id: 'delivery', title: '6. Deliveries & Commissions' },
  { id: 'content-policy', title: '7. Content Policy' },
  { id: 'suspension', title: '8. Account Suspension or Termination' },
  { id: 'privacy', title: '9. Privacy Policy' },
  { id: 'disclaimers', title: '10. Disclaimers' },
  { id: 'changes', title: '11. Changes to Terms' },
  { id: 'contact', title: '12. Contact' },
];

const contentData = {
  introduction: "Welcome to Fashion Swap. By accessing or using our platform, you agree to comply with and be bound by the following Terms & Conditions. Please read them carefully. If you do not agree, please do not use the service.",
  eligibility: "You must be at least 18 years old or have parental permission to use this platform. By using the platform, you confirm that you meet this requirement.",
  accounts: "You are responsible for maintaining the confidentiality of your login credentials. You must provide accurate information during registration and not impersonate any other person or entity.",
  listing: "All items listed must be legally owned by the user and accurately described. You agree not to list counterfeit, illegal, or offensive items. Swap agreements must be honored honestly and promptly.",
  payments: "Fashion Swap may charge a commission for certain transactions. You agree to pay any applicable fees shown at the time of listing, swapping, or purchasing.",
  delivery: "Fashion Swap does not handle or guarantee delivery. Users are responsible for coordinating shipping or drop-off arrangements. A small commission or delivery charge may be included during checkout to support platform services.",
  'content-policy': "You agree not to post abusive, offensive, or misleading content. You must not violate any copyright, trademark, or other proprietary rights. No illegal activity is permitted on the platform.",
  suspension: "We reserve the right to suspend or terminate accounts that violate our terms without prior notice. Reasons may include fraudulent behavior, offensive content, or repeated user complaints.",
  privacy: "We value your privacy. Please refer to our Privacy Policy for information on how your data is collected, used, and protected.",
  disclaimers: "Fashion Swap is a platform that connects users for item exchanges. We are not responsible for disputes between users, losses due to failed deliveries, or any financial issues. The platform is provided 'as is' without warranties of any kind.",
  changes: "We may update these Terms & Conditions at any time. Material changes will be communicated via the platform or email. Continued use after changes constitutes acceptance.",
  contact: "If you have any questions or concerns, please contact us at: support@fashionswap.com",
};

const TermsConditions = () => {
  const [active, setActive] = useState('introduction');

  useEffect(() => {
    const handleScroll = () => {
      const offsets = sections.map((section) => {
        const el = document.getElementById(section.id);
        return el
          ? { id: section.id, top: el.getBoundingClientRect().top }
          : null;
      }).filter(Boolean);

      const visible = offsets.find(sec => sec.top >= 0 && sec.top < window.innerHeight / 2);
      if (visible) setActive(visible.id);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="terms-container">
      {/* Sidebar */}
      <div className="terms-sidebar">
        <h2 className="sidebar-title">Contents</h2>
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={`sidebar-link ${active === section.id ? 'active' : ''}`}
            onClick={() => setActive(section.id)}
          >
            {section.title}
          </a>
        ))}
      </div>

      {/* Content */}
      <div className="terms-content">
        <h1 className="terms-title">Terms & Conditions</h1>

        {sections.map(({ id, title }) => (
          <section key={id} id={id} className="terms-section">
            <h2 className="section-title">{title}</h2>
            <p>{contentData[id]}</p>
            {id === 'privacy' && (
              <p>
                See our{' '}
                <a href="/privacy-policy" className="terms-link">
                  Privacy Policy
                </a>{' '}
                for full details.
              </p>
            )}
            {id === 'contact' && (
              <p>
                Email us at:{' '}
                <a href="mailto:support@fashionswap.com" className="terms-link">
                  support@fashionswap.com
                </a>
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

export default TermsConditions;