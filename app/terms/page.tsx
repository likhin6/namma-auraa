import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Terms & Conditions — NAMMA AURAA',
  description: 'Terms & Conditions for NAMMA AURAA',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <div className="bg-[#f8f6f2] py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-[#c9a84c] uppercase tracking-[0.25em] mb-2 font-medium">Legal</p>
          <h1 className="text-3xl lg:text-5xl font-black uppercase tracking-tight text-[#0a0a0a]">TERMS & CONDITIONS</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-8">
        <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        {[
          { title: '1. Acceptance of Terms', body: 'By accessing and using the NAMMA AURAA website, you accept and agree to be bound by these Terms & Conditions. If you do not agree, please do not use our website.' },
          { title: '2. Products & Pricing', body: 'All products are subject to availability. We reserve the right to modify or discontinue any product without notice. Prices are listed in Indian Rupees (INR) and are inclusive of all applicable taxes. We strive for accuracy but reserve the right to correct errors.' },
          { title: '3. Orders', body: 'Placing an order constitutes an offer to purchase. We reserve the right to accept or decline any order. In the event of cancellation, any payments made will be refunded. Checkout functionality may be limited during our MVP phase.' },
          { title: '4. Shipping & Delivery', body: 'Delivery timelines are estimates and may vary based on location and availability. We are not liable for delays caused by courier partners or unforeseen circumstances.' },
          { title: '5. Returns & Refunds', body: 'We offer 7-day returns for unused products in original packaging. Refunds are processed to the original payment method within 7-10 business days. Custom or personalized items are non-returnable.' },
          { title: '6. Intellectual Property', body: 'All content on this website — including designs, logos, text, and images — is the property of NAMMA AURAA and may not be reproduced without written permission.' },
          { title: '7. User Accounts', body: 'You are responsible for maintaining the confidentiality of your account credentials. We reserve the right to suspend accounts that violate these terms.' },
          { title: '8. Limitation of Liability', body: 'NAMMA AURAA shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products.' },
          { title: '9. Governing Law', body: 'These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Bengaluru, Karnataka.' },
          { title: '10. Contact', body: 'For questions regarding these Terms & Conditions, contact us at hello@nammaauraa.com.' },
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
