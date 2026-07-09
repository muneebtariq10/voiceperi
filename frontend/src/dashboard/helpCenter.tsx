import React, { useState } from 'react';
import { 
  HelpCircle, 
  BookOpen, 
  MessageCircle, 
  Phone, 
  Bot, 
  Settings, 
  ChevronDown, 
  ExternalLink, 
  Search, 
  Sparkles, 
  Shield, 
  CreditCard,
  PhoneForwarded,
  Globe,
  Mic,
  BarChart3,
  Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type FAQItem = {
  question: string;
  answer: string;
  category: string;
};

const faqs: FAQItem[] = [
  {
    category: 'Getting Started',
    question: 'How do I set up my AI voice agent?',
    answer: 'After signing up, go to the Voice Agent tab in your dashboard. Choose a language, select a voice, name your agent, and write a welcome message. Click "Save" and your agent is ready to take calls!'
  },
  {
    category: 'Getting Started',
    question: 'How do customers call my AI agent?',
    answer: 'Click "Get AI Phone Number" in Voice Agent settings to get a dedicated number. Then set up call forwarding on your business phone (dial *72 + the AI number). Customers call your existing business number as usual — calls are transparently forwarded to the AI.'
  },
  {
    category: 'Getting Started',
    question: 'What languages does VoicePeri support?',
    answer: 'VoicePeri currently supports English and Spanish with multiple voice options for each language. Each voice has a unique personality — from friendly and expressive to professional and clear.'
  },
  {
    category: 'Voice Agent',
    question: 'How do I change my agent\'s voice?',
    answer: 'Go to the Voice Agent tab, select a new voice from the "Voice & Tone" dropdown, and preview it using the audio player. Click Save to apply. Your agent will use the new voice on all future calls.'
  },
  {
    category: 'Voice Agent',
    question: 'Can I customize what my agent says?',
    answer: 'Yes! You can set a custom welcome message that the agent uses to greet callers. The agent also automatically learns about your business from the Business Information you provide — services, hours, and location.'
  },
  {
    category: 'Voice Agent',
    question: 'Can my agent transfer calls to a human?',
    answer: 'Yes. If a caller specifically asks to speak to a person, the agent can transfer the call. Make sure your Business Information has an up-to-date phone number for transfers.'
  },
  {
    category: 'Phone & Calls',
    question: 'Do I need to buy a new phone number?',
    answer: 'VoicePeri provisions an AI phone number for you. Your customers never see this number — they call your existing business line, and calls are forwarded to the AI behind the scenes. Think of it as the "brain" behind your phone.'
  },
  {
    category: 'Phone & Calls',
    question: 'How do I set up call forwarding?',
    answer: 'On your business phone, dial *72 followed by the AI number shown in your dashboard, then press Call. You\'ll hear a confirmation tone. To disable forwarding later, just dial *73. The exact code may vary by carrier.'
  },
  {
    category: 'Phone & Calls',
    question: 'Can I block spam or sales calls?',
    answer: 'Yes! In Voice Agent settings, you can add specific numbers to a block list, enable "Block 1-800 numbers" to filter toll-free spam, and turn on "Hang up on sales calls" for automatic spam detection.'
  },
  {
    category: 'Phone & Calls',
    question: 'How do I test my agent before going live?',
    answer: 'Use the "Test Call" button in your Voice Agent settings. This starts a browser-based call directly to your agent so you can hear how it sounds and verify it has the right information.'
  },
  {
    category: 'Business Info',
    question: 'How does the agent know about my business?',
    answer: 'When you sign up, we pull your business details from Google Maps — name, address, hours, and services. You can edit all of this in the Business Information tab. The agent uses this data to answer customer questions accurately.'
  },
  {
    category: 'Business Info',
    question: 'What if my business isn\'t on Google Maps?',
    answer: 'No problem! If we can\'t find your business automatically, we create a basic profile that you can fill in manually. Go to Business Information and enter your details — the agent will use whatever you provide.'
  },
  {
    category: 'Account & Billing',
    question: 'How do I update my account information?',
    answer: 'Click on your profile icon in the top-right corner of the dashboard to access account settings. You can update your name, email, and password there.'
  },
  {
    category: 'Account & Billing',
    question: 'Is my data secure?',
    answer: 'Yes. All communications are encrypted, your credentials are stored securely, and we never share your business data with third parties. Call recordings are processed through Retell AI\'s secure infrastructure.'
  },
];

const quickLinks = [
  { 
    icon: <Bot className="w-6 h-6" />, 
    title: 'Voice Agent Setup', 
    description: 'Configure your AI agent\'s voice, language, and personality',
    link: '/dashboard/voiceAgent',
    color: 'from-violet-500 to-purple-600'
  },
  { 
    icon: <Settings className="w-6 h-6" />, 
    title: 'Business Information', 
    description: 'Update hours, services, and contact details',
    link: '/dashboard/businessInformation',
    color: 'from-blue-500 to-cyan-500'
  },
  { 
    icon: <BarChart3 className="w-6 h-6" />, 
    title: 'Call History', 
    description: 'Review past calls and agent performance',
    link: '/dashboard/callHistory',
    color: 'from-emerald-500 to-teal-500'
  },
  { 
    icon: <Mail className="w-6 h-6" />, 
    title: 'Send Feedback', 
    description: 'Report issues or suggest improvements',
    link: '/dashboard/feedback',
    color: 'from-amber-500 to-orange-500'
  },
];

const categoryIcons: Record<string, React.ReactNode> = {
  'Getting Started': <Sparkles className="w-4 h-4" />,
  'Voice Agent': <Mic className="w-4 h-4" />,
  'Phone & Calls': <PhoneForwarded className="w-4 h-4" />,
  'Business Info': <Globe className="w-4 h-4" />,
  'Account & Billing': <Shield className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  'Getting Started': 'bg-purple-100 text-purple-700',
  'Voice Agent': 'bg-blue-100 text-blue-700',
  'Phone & Calls': 'bg-green-100 text-green-700',
  'Business Info': 'bg-amber-100 text-amber-700',
  'Account & Billing': 'bg-gray-100 text-gray-700',
};

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(faqs.map(f => f.category))];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchQuery.trim() === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 md:p-8 w-full max-w-4xl mx-auto">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .help-animate { animation: fadeInUp 0.4s ease-out; }
        .help-animate-delay { animation: fadeInUp 0.5s ease-out 0.1s both; }
        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease, padding 0.3s ease, opacity 0.3s ease;
          opacity: 0;
        }
        .faq-answer.open {
          max-height: 300px;
          opacity: 1;
        }
        .quick-link { transition: all 0.2s ease; }
        .quick-link:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
      `}</style>

      {/* Header */}
      <div className="help-animate mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5222FF] to-[#7B5CF5] flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
            <p className="text-sm text-gray-500">Everything you need to get the most out of VoicePeri</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="help-animate mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search for help..."
            className="pl-12 h-12 rounded-xl border-2 border-gray-100 focus-visible:border-[#5222FF] focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Quick Links */}
      {!searchQuery && (
        <div className="help-animate-delay mb-10">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickLinks.map((item, idx) => (
              <Link key={idx} to={item.link} className="quick-link block">
                <div className="bg-white border border-gray-100 rounded-xl p-4 h-full">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-3`}>
                    {item.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="help-animate-delay">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            {searchQuery ? `Search Results (${filteredFAQs.length})` : 'Frequently Asked Questions'}
          </h2>
        </div>

        {/* Category Filters */}
        {!searchQuery && (
          <div className="flex flex-wrap gap-2 mb-5">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                !selectedCategory 
                  ? 'bg-[#5222FF] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-[#5222FF] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {categoryIcons[cat]}
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* FAQ List */}
        <div className="space-y-2">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No results found</p>
              <p className="text-gray-400 text-sm mt-1">Try a different search term or category</p>
            </div>
          ) : (
            filteredFAQs.map((faq, idx) => {
              const isOpen = openFAQ === idx;
              const globalIdx = faqs.indexOf(faq);
              return (
                <div
                  key={globalIdx}
                  className={`border rounded-xl overflow-hidden transition-colors ${
                    isOpen ? 'border-[#d4c5ff] bg-[#faf8ff]' : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => setOpenFAQ(isOpen ? null : idx)}
                    className="flex items-center justify-between w-full px-5 py-4 text-left"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold ${categoryColors[faq.category]}`}>
                        {faq.category}
                      </span>
                      <span className={`text-sm font-medium truncate ${isOpen ? 'text-[#5222FF]' : 'text-gray-800'}`}>
                        {faq.question}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 flex-shrink-0 ml-3 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#5222FF]' : ''}`} />
                  </button>
                  <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
                    <div className="px-5 pb-4 pt-0">
                      <p className="text-sm text-gray-600 leading-relaxed pl-0 md:pl-[calc(theme(spacing.2)+theme(spacing.3)+60px)]">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Contact Support */}
      <div className="help-animate-delay mt-10 bg-gradient-to-br from-[#f0ebff] to-[#e8f4f8] border border-[#d4c5ff] rounded-2xl p-6 md:p-8 text-center">
        <MessageCircle className="w-8 h-8 text-[#5222FF] mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900 mb-1">Still need help?</h3>
        <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
          Can't find what you're looking for? Send us a message and our team will get back to you.
        </p>
        <Link to="/dashboard/feedback">
          <Button className="bg-[#5222FF] hover:bg-[#4118DD] text-white rounded-xl px-6 gap-2">
            <Mail className="w-4 h-4" />
            Contact Support
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default HelpCenter;