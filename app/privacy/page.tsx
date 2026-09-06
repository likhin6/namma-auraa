import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Privacy Policy — NAMMA AURAA',
  description: 'Privacy Policy for NAMMA AURAA',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <div className="bg-[#f8f6f2] py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-[#c9a84c] uppercase tracking-[0.25em] mb-2 font-medium">Legal</p>
          <h1 className="text-3xl lg:text-5xl font-black uppercase tracking-tight text-[#0a0a0a]">PRIVACY POLICY</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-8">
        <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        {[
          { title: '1. Introduction', body: 'NAMMA AURAA ("we", "us", "our") respects your privacy and is committed to protecting your personal data. This policy explains how we collect, use, and store your information when you use our website.' },
          { title: '2. Information We Collect', body: 'We collect information you provide directly — such as your name, email, phone number, and shipping address when you create an account or contact us. We also automatically collect analytics data including page views, device type, and browsing behavior to improve our products.' },
          { title: '3. How We Use Your Data', body: 'Your data is used to process orders, manage your account, send order updates, personalize your shopping experience, improve our website through analytics, and send marketing communications (only if you opt in).' },
          { title: '4. Data Storage & Security', body: 'Your data is stored securely using Supabase (PostgreSQL) with Row Level Security enabled. Passwords are hashed and managed by Supabase Auth. We never store plain-text passwords or payment credentials.' },
          { title: '5. Cookies & Tracking', body: 'We use first-party analytics to understand how visitors interact with our site. We do not sell your data to third parties. Anonymous session IDs are used to track browsing patterns without identifying you personally.' },
          { title: '6. Your Rights', body: 'You have the right to access, correct, or delete your personal data. You can also opt out of marketing communications at any time. To exercise these rights, contact us at hello@nammaauraa.com.' },
          { title: '7. Children\'s Privacy', body: 'Our website is not intended for individuals under 16 years of age. We do not knowingly collect data from children.' },
          { title: '8. Changes to This Policy', body: 'We may update this policy from time to time. Any changes will be posted on this page with an updated revision date.' },
          { title: '9. Contact Us', body: 'If you have questions about this Privacy Policy, email us at hello@nammaauraa.com.' },
        ].map((section) => (
          <div key={section.title}>
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#0a0a0a] mb-2">{section.title}</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{section.body}</p>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}
