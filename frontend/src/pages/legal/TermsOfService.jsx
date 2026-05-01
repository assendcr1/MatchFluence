import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfService() {
  const navigate = useNavigate()
  const company = 'The Ablant Co.'
  const product = 'MatchFluence'
  const email = 'legal@theablantco.com'
  const updated = '1 May 2026'

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 mb-8 text-sm" style={{ color: '#555' }}>
          <ArrowLeft size={14} /> Back
        </button>

        <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Terms of Service</h1>
        <p className="text-sm mb-8" style={{ color: '#555' }}>Last updated: {updated}</p>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: '#888' }}>

          <section>
            <h2 className="font-semibold mb-2" style={{ color: '#ccc', fontFamily: 'Syne, sans-serif' }}>1. Acceptance of Terms</h2>
            <p>By accessing or using {product}, a product of {company}, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the platform. These terms constitute a binding agreement between you and {company}.</p>
          </section>

          <section>
            <h2 className="font-semibold mb-2" style={{ color: '#ccc', fontFamily: 'Syne, sans-serif' }}>2. Description of Service</h2>
            <p>{product} is an influencer marketing intelligence platform that connects brands and agencies with social media influencers through data-driven matching. The platform provides match scores, audience analytics, campaign management tools, and outreach facilitation.</p>
          </section>

          <section>
            <h2 className="font-semibold mb-2" style={{ color: '#ccc', fontFamily: 'Syne, sans-serif' }}>3. User Accounts & API Keys</h2>
            <p>Brands and agencies are issued API keys upon registration. You are responsible for maintaining the confidentiality of your API key. Any activity conducted using your API key is your responsibility. If you believe your key has been compromised, contact us immediately for a replacement.</p>
          </section>

          <section>
            <h2 className="font-semibold mb-2" style={{ color: '#ccc', fontFamily: 'Syne, sans-serif' }}>4. Influencer Data & POPIA Compliance</h2>
            <p>Influencer profile data displayed on {product} is sourced from publicly available social media profiles via official platform APIs. Users of {product} must:</p>
            <ul className="space-y-1 ml-4 mt-2">
              <li>• Use influencer data only for legitimate marketing and campaign purposes</li>
              <li>• Not use the data to harass, stalk, or discriminate against any individual</li>
              <li>• Comply with POPIA when processing any personal information obtained through the platform</li>
              <li>• Obtain appropriate consent before sending unsolicited commercial communications to influencers</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold mb-2" style={{ color: '#ccc', fontFamily: 'Syne, sans-serif' }}>5. Advertising Disclosure (ASA Compliance)</h2>
            <p>All influencer marketing campaigns facilitated through {product} must comply with the Advertising Regulatory Board (ARB) guidelines. Brands and agencies are responsible for ensuring that influencer content resulting from campaigns arranged through the platform is clearly disclosed as paid partnerships using appropriate labels (#ad, #sponsored, #paidpartnership).</p>
          </section>

          <section>
            <h2 className="font-semibold mb-2" style={{ color: '#ccc', fontFamily: 'Syne, sans-serif' }}>6. Outreach & Email Communications</h2>
            <p>The outreach feature allows you to send messages to influencers. You agree to:</p>
            <ul className="space-y-1 ml-4 mt-2">
              <li>• Send only relevant, professional communications</li>
              <li>• Include your company identity in all outreach</li>
              <li>• Honour opt-out requests promptly</li>
              <li>• Comply with the ECT Act and CAN-SPAM requirements</li>
              <li>• Not use the outreach feature for spam, phishing, or any unlawful purpose</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold mb-2" style={{ color: '#ccc', fontFamily: 'Syne, sans-serif' }}>7. Prohibited Uses</h2>
            <p>You may not use {product} to:</p>
            <ul className="space-y-1 ml-4 mt-2">
              <li>• Scrape, copy, or redistribute platform data in bulk</li>
              <li>• Reverse engineer the matching algorithm or platform systems</li>
              <li>• Impersonate another brand, agency, or influencer</li>
              <li>• Engage in any activity that violates applicable law</li>
              <li>• Attempt to gain unauthorised access to any part of the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold mb-2" style={{ color: '#ccc', fontFamily: 'Syne, sans-serif' }}>8. Data Accuracy Disclaimer</h2>
            <p>Match scores, engagement rates, and bot scores are calculated using algorithmic models and publicly available data. While we strive for accuracy, {company} makes no warranty that these metrics are error-free or suitable for any particular business decision. You should independently verify material information before committing budget to any campaign.</p>
          </section>

          <section>
            <h2 className="font-semibold mb-2" style={{ color: '#ccc', fontFamily: 'Syne, sans-serif' }}>9. Intellectual Property</h2>
            <p>The {product} platform, matching algorithms, scoring models, and all associated software are the intellectual property of {company}. You may not reproduce, modify, distribute, or create derivative works without express written permission.</p>
          </section>

          <section>
            <h2 className="font-semibold mb-2" style={{ color: '#ccc', fontFamily: 'Syne, sans-serif' }}>10. Limitation of Liability</h2>
            <p>{company} shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform or any campaigns facilitated through it. Our total liability shall not exceed the amount paid by you for the service in the 3 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="font-semibold mb-2" style={{ color: '#ccc', fontFamily: 'Syne, sans-serif' }}>11. Governing Law</h2>
            <p>These terms are governed by the laws of the Republic of South Africa. Any disputes shall be subject to the exclusive jurisdiction of the South African courts.</p>
          </section>

          <section>
            <h2 className="font-semibold mb-2" style={{ color: '#ccc', fontFamily: 'Syne, sans-serif' }}>12. Contact</h2>
            <p>For any questions regarding these terms: <span style={{ color: '#2dd4bf' }}>{email}</span></p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t" style={{ borderColor: '#1a1a1a' }}>
          <p className="text-xs" style={{ color: '#333' }}>© {new Date().getFullYear()} {company} · MatchFluence</p>
        </div>
      </div>
    </div>
  )
}
