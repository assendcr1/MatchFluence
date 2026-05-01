import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
  const navigate = useNavigate()
  const company = 'The Ablant Co.'
  const product = 'MatchFluence'
  const email = 'legal@ablantco.com'
  const updated = '1 May 2026'

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 mb-8 text-sm" style={{ color: '#555' }}>
          <ArrowLeft size={14} /> Back
        </button>

        <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Privacy Policy</h1>
        <p className="text-sm mb-8" style={{ color: '#555' }}>Last updated: {updated}</p>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: '#888' }}>

          <section>
            <h2 className="font-semibold mb-2" style={{ color: '#ccc', fontFamily: 'Syne, sans-serif' }}>1. Who We Are</h2>
            <p>{product} is a product of {company}, an influencer marketing intelligence platform. We connect brands and agencies with influencers through data-driven matching. This policy explains how we collect, use, and protect personal information in compliance with the Protection of Personal Information Act, 2013 (POPIA) and applicable international data protection laws.</p>
          </section>

          <section>
            <h2 className="font-semibold mb-2" style={{ color: '#ccc', fontFamily: 'Syne, sans-serif' }}>2. Information We Collect</h2>
            <p className="mb-2">We collect the following categories of personal information:</p>
            <ul className="space-y-1 ml-4">
              <li>• <strong style={{ color: '#ccc' }}>Influencers:</strong> Public profile data including display name, follower count, engagement rate, post content, hashtags, account handles, and publicly visible biography</li>
              <li>• <strong style={{ color: '#ccc' }}>Brands & Agencies:</strong> Company name, email address, industry, and website</li>
              <li>• <strong style={{ color: '#ccc' }}>Platform usage:</strong> Campaign data, match results, and outreach history</li>
            </ul>
            <p className="mt-2">Influencer data is collected from publicly accessible social media profiles via official platform APIs (Instagram Graph API). We do not collect private messages, private posts, or any data not publicly available.</p>
          </section>

          <section>
            <h2 className="font-semibold mb-2" style={{ color: '#ccc', fontFamily: 'Syne, sans-serif' }}>3. Lawful Basis for Processing (POPIA)</h2>
            <p>We process personal information under the following lawful grounds as defined by POPIA:</p>
            <ul className="space-y-1 ml-4 mt-2">
              <li>• <strong style={{ color: '#ccc' }}>Legitimate interest:</strong> Processing publicly available social media data to facilitate influencer marketing connections</li>
              <li>• <strong style={{ color: '#ccc' }}>Contract performance:</strong> Processing data necessary to deliver our services to registered brands and agencies</li>
              <li>• <strong style={{ color: '#ccc' }}>Consent:</strong> When influencers register and connect their accounts directly</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold mb-2" style={{ color: '#ccc', fontFamily: 'Syne, sans-serif' }}>4. How We Use Your Information</h2>
            <ul className="space-y-1 ml-4">
              <li>• To provide influencer matching and analytics services</li>
              <li>• To calculate engagement rates, audience authenticity scores, and match scores</li>
              <li>• To facilitate outreach between brands/agencies and influencers</li>
              <li>• To refresh and maintain accurate profile data</li>
              <li>• To improve our matching algorithms</li>
            </ul>
            <p className="mt-2">We do not sell personal information to third parties. We do not use your data for advertising purposes.</p>
          </section>

          <section>
            <h2 className="font-semibold mb-2" style={{ color: '#ccc', fontFamily: 'Syne, sans-serif' }}>5. Data Retention</h2>
            <p>We retain influencer profile data for as long as the account remains active in our system. Metric snapshots are retained for 24 months. Brand and agency data is retained for the duration of the business relationship plus 5 years for legal compliance purposes. You may request deletion at any time.</p>
          </section>

          <section>
            <h2 className="font-semibold mb-2" style={{ color: '#ccc', fontFamily: 'Syne, sans-serif' }}>6. Your Rights Under POPIA</h2>
            <p>You have the right to:</p>
            <ul className="space-y-1 ml-4 mt-2">
              <li>• Access the personal information we hold about you</li>
              <li>• Request correction of inaccurate information</li>
              <li>• Request deletion of your personal information (right to erasure)</li>
              <li>• Object to the processing of your personal information</li>
              <li>• Lodge a complaint with the Information Regulator of South Africa</li>
            </ul>
            <p className="mt-2">To exercise any of these rights, contact us at <span style={{ color: '#2dd4bf' }}>{email}</span></p>
          </section>

          <section>
            <h2 className="font-semibold mb-2" style={{ color: '#ccc', fontFamily: 'Syne, sans-serif' }}>7. International Transfers</h2>
            <p>Your data is stored on Supabase servers located in the European Union (EU West). We ensure that any international transfer of personal information is subject to appropriate safeguards consistent with POPIA and GDPR requirements.</p>
          </section>

          <section>
            <h2 className="font-semibold mb-2" style={{ color: '#ccc', fontFamily: 'Syne, sans-serif' }}>8. Security</h2>
            <p>We implement appropriate technical and organisational measures to protect personal information against unauthorised access, disclosure, alteration, or destruction. These include encrypted database connections, hashed API keys, and access controls.</p>
          </section>

          <section>
            <h2 className="font-semibold mb-2" style={{ color: '#ccc', fontFamily: 'Syne, sans-serif' }}>9. Cookies</h2>
            <p>We use session storage to maintain your login state. We do not use tracking cookies or third-party advertising cookies.</p>
          </section>

          <section>
            <h2 className="font-semibold mb-2" style={{ color: '#ccc', fontFamily: 'Syne, sans-serif' }}>10. Contact & Information Officer</h2>
            <p>{company} has designated an Information Officer as required by POPIA. For any privacy-related queries, data access requests, or complaints:</p>
            <p className="mt-2">Email: <span style={{ color: '#2dd4bf' }}>{email}</span></p>
            <p>Information Regulator (South Africa): <span style={{ color: '#2dd4bf' }}>www.justice.gov.za/inforeg</span></p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t" style={{ borderColor: '#1a1a1a' }}>
          <p className="text-xs" style={{ color: '#333' }}>© {new Date().getFullYear()} {company} · MatchFluence</p>
        </div>
      </div>
    </div>
  )
}
