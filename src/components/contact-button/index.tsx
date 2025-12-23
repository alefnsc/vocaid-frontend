/**
 * Vocaid HR Intelligence Chat
 * Context-aware AI assistant combining HR FAQ Concierge + Interview Performance Analyst
 * 
 * Features:
 * - Auto-mode detection (FAQ vs Interview Insights)
 * - Structured responses with evidence, actions, and upgrade suggestions
 * - Sidebar with pre-configured performance questions
 * - Integrated FAQ with search
 * - Multi-language support
 * - Context-aware personalization
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { 
  MessageCircle, 
  X, 
  Send, 
  Loader2, 
  Sparkles,
  Bot,
  User as UserIcon,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Search,
  HelpCircle,
  TrendingUp,
  Target,
  Award,
  CreditCard,
  Settings,
  BookOpen,
  BarChart3,
  Lightbulb,
  ArrowRight,
  PanelLeftClose,
  PanelLeft,
  FileText,
  AlertCircle,
  MessageSquare,
  Zap,
  Globe,
  Shield,
  BrainCircuit
} from 'lucide-react';
import { config } from '../../lib/config';

// ========================================
// TYPES
// ========================================

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  category?: 'performance' | 'support';
  hasActions?: boolean;
  actions?: ActionButton[];
}

interface ActionButton {
  id: string;
  label: string;
  action: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

interface ChatContext {
  roleFilter?: string;
  companyFilter?: string;
}

interface FilterOption {
  roles: string[];
  companies: string[];
}

interface RecentInterview {
  id: string;
  jobTitle: string;
  companyName: string;
  score: number | null;
  createdAt: string;
}

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  icon?: React.ReactNode;
}

interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon: React.ReactNode;
  category: 'performance' | 'support';
  requiresInterviews?: boolean;
  description?: string;
}

// Parsed structured response from AI
interface ParsedResponse {
  answer: string;
  evidence?: string;
  actions?: string[];
  nextStep?: string;
  upgradeIdea?: string;
}

// ========================================
// FAQ KNOWLEDGE BASE - HR Intelligence Categories
// ========================================

const FAQ_KNOWLEDGE_BASE: FAQItem[] = [
  // Billing & Credits
  {
    id: 'billing-1',
    category: 'Billing & Credits',
    question: 'How do credits work?',
    answer: 'Each mock interview costs 1 credit. Credits never expire and can be purchased in packages. You receive free trial credits when you sign up.',
    keywords: ['credits', 'cost', 'pricing', 'free', 'trial']
  },
  {
    id: 'billing-2',
    category: 'Billing & Credits',
    question: 'How do I purchase more credits?',
    answer: 'Navigate to the Credits page from your dashboard. We offer packages: Starter (5 credits), Professional (15 credits), and Enterprise (50 credits). Payment is processed securely via MercadoPago.',
    keywords: ['buy', 'purchase', 'credits', 'packages', 'mercadopago', 'payment']
  },
  {
    id: 'billing-3',
    category: 'Billing & Credits',
    question: 'Can I get a refund?',
    answer: "Credits are non-refundable once purchased. However, if you experience technical issues during an interview, please contact support and we will review your case.",
    keywords: ['refund', 'money back', 'return', 'cancel']
  },
  {
    id: 'billing-4',
    category: 'Billing & Credits',
    question: 'What payment methods are accepted?',
    answer: 'We accept credit cards, debit cards, and local payment methods via MercadoPago. Payment processing is secure and PCI-compliant.',
    keywords: ['payment', 'card', 'visa', 'mastercard', 'method']
  },
  // How It Works
  {
    id: 'howto-1',
    category: 'How It Works',
    question: 'How does Vocaid work?',
    answer: 'Vocaid uses AI to simulate realistic job interviews. You upload your resume, select a target role and company, then have a voice conversation with our AI interviewer. After the interview, you receive detailed feedback and a performance score.',
    keywords: ['how', 'work', 'process', 'interview', 'ai']
  },
  {
    id: 'howto-2',
    category: 'How It Works',
    question: 'What happens during an interview?',
    answer: "Once you start an interview, you will be connected to our AI interviewer via voice. The AI asks role-specific questions based on your resume and target position. Speak naturally - it is a conversational experience. Interviews typically last 10-15 minutes.",
    keywords: ['interview', 'during', 'voice', 'conversation', 'questions']
  },
  {
    id: 'howto-3',
    category: 'How It Works',
    question: 'How is my score calculated?',
    answer: 'Your score (0-100) is based on: Technical Knowledge (relevant skills and concepts), Communication (clarity, structure, conciseness), Confidence (tone, pacing, assertiveness), and Overall Performance (how well you would perform in a real interview).',
    keywords: ['score', 'rating', 'calculated', 'grading', 'feedback']
  },
  {
    id: 'howto-4',
    category: 'How It Works',
    question: 'What does the scorecard show?',
    answer: 'The scorecard provides a competency breakdown with scores for each evaluated area, specific quotes from your responses as evidence, areas of strength, and targeted improvement suggestions.',
    keywords: ['scorecard', 'breakdown', 'competency', 'feedback', 'results']
  },
  // Troubleshooting
  {
    id: 'tech-1',
    category: 'Troubleshooting',
    question: 'The AI cannot hear me / Audio issues',
    answer: 'Make sure your browser has microphone permissions enabled. Use Chrome or Edge for best compatibility. Check that your microphone is selected in system settings. Try using headphones to avoid echo. Ensure you are in a quiet environment.',
    keywords: ['audio', 'microphone', 'hear', 'voice', 'sound', 'permission', 'retell']
  },
  {
    id: 'tech-2',
    category: 'Troubleshooting',
    question: 'My interview disconnected or froze',
    answer: 'Network issues can cause disconnections. Ensure you have a stable internet connection (Wi-Fi or wired). If the interview fails, your credit will typically be restored automatically. Contact support if this does not happen within 24 hours.',
    keywords: ['disconnect', 'frozen', 'stuck', 'crash', 'error', 'network']
  },
  {
    id: 'tech-3',
    category: 'Troubleshooting',
    question: 'Supported browsers',
    answer: 'Vocaid works best on Google Chrome (recommended), Microsoft Edge, and Safari (latest version). Firefox may have limited audio support. Always use the latest browser version.',
    keywords: ['browser', 'chrome', 'firefox', 'safari', 'edge', 'supported']
  },
  // Features & Customization
  {
    id: 'feature-1',
    category: 'Features',
    question: 'Can I practice for specific companies?',
    answer: "Yes! When setting up an interview, enter the company name. Our AI tailors questions based on the company's known interview style, values, and technical requirements.",
    keywords: ['company', 'specific', 'customize', 'tailor']
  },
  {
    id: 'feature-2',
    category: 'Features',
    question: 'What roles can I practice for?',
    answer: 'Vocaid supports all professional roles: Software Engineering, Data Science, Product Management, Design, Marketing, Sales, Finance, HR, Operations, and more. Just enter your target job title.',
    keywords: ['roles', 'jobs', 'positions', 'software', 'engineer', 'data', 'product']
  },
  {
    id: 'feature-3',
    category: 'Features',
    question: 'Can I review past interviews?',
    answer: 'Yes, go to your Dashboard and click on any completed interview to see the full transcript, feedback, and performance breakdown. You can track your progress over time.',
    keywords: ['history', 'past', 'review', 'transcript', 'feedback']
  },
  {
    id: 'feature-4',
    category: 'Features',
    question: 'Can I practice in different languages?',
    answer: 'Yes, Vocaid supports multiple languages including English, Spanish, Portuguese, French, German, Italian, Japanese, and Chinese. Select your preferred language during interview setup.',
    keywords: ['language', 'spanish', 'portuguese', 'multilingual', 'international']
  },
  // Interview Insights (for Hiring Teams)
  {
    id: 'insights-1',
    category: 'Interview Insights',
    question: 'How do I analyze candidate performance?',
    answer: 'Ask about any interview by saying "Analyze my [role] interview at [company]" or "How did I do in my latest interview?" The AI will provide competency breakdowns, evidence-based insights, and improvement suggestions.',
    keywords: ['analyze', 'candidate', 'performance', 'insights', 'evaluate']
  },
  {
    id: 'insights-2',
    category: 'Interview Insights',
    question: 'What metrics are tracked?',
    answer: 'We track overall score, technical knowledge, communication skills, confidence level, response quality, and progression over time. All metrics are based on evidence from the interview transcript.',
    keywords: ['metrics', 'tracked', 'measured', 'data', 'analytics']
  },
  {
    id: 'insights-3',
    category: 'Interview Insights',
    question: 'How can I compare interviews?',
    answer: 'Ask "Compare my last two interviews" or "Show my progress over time" to see how your performance has changed across different practice sessions.',
    keywords: ['compare', 'comparison', 'progress', 'improvement', 'trend']
  },
  // Privacy & Security
  {
    id: 'privacy-1',
    category: 'Privacy & Security',
    question: 'How is my data protected?',
    answer: 'Your data is encrypted and stored securely. We never share your interview recordings or transcripts with third parties. You can request data deletion at any time.',
    keywords: ['data', 'privacy', 'security', 'protected', 'encryption']
  },
  {
    id: 'privacy-2',
    category: 'Privacy & Security',
    question: 'Can I delete my interview history?',
    answer: 'Yes, you can delete individual interviews from your Dashboard. For complete account deletion, please contact support.',
    keywords: ['delete', 'remove', 'history', 'account']
  }
];

// Group FAQs by category
const FAQ_BY_CATEGORY = FAQ_KNOWLEDGE_BASE.reduce((acc, faq) => {
  if (!acc[faq.category]) acc[faq.category] = [];
  acc[faq.category].push(faq);
  return acc;
}, {} as Record<string, FAQItem[]>);

// ========================================
// QUICK ACTIONS - Pre-configured prompts for HR Intelligence
// ========================================

const QUICK_ACTIONS: QuickAction[] = [
  // Performance Analysis Actions
  {
    id: 'latest-analysis',
    label: 'Analyze latest interview',
    prompt: 'Can you analyze my most recent interview and provide a detailed breakdown of how I performed? Include evidence from the transcript.',
    icon: <BarChart3 className="w-4 h-4" />,
    category: 'performance',
    requiresInterviews: true,
    description: 'Get AI-powered insights on your last interview'
  },
  {
    id: 'strengths',
    label: 'My interview strengths',
    prompt: 'What are my main strengths based on my interview history? Please cite specific examples from my responses.',
    icon: <Award className="w-4 h-4" />,
    category: 'performance',
    requiresInterviews: true,
    description: 'Discover what you do well'
  },
  {
    id: 'improve',
    label: 'Areas to improve',
    prompt: 'What specific areas should I focus on to improve my interview performance? Be specific with evidence from my transcripts.',
    icon: <Target className="w-4 h-4" />,
    category: 'performance',
    requiresInterviews: true,
    description: 'Get targeted improvement advice'
  },
  {
    id: 'trends',
    label: 'Progress over time',
    prompt: 'How has my interview performance changed over my recent interviews? Show me trends and patterns.',
    icon: <TrendingUp className="w-4 h-4" />,
    category: 'performance',
    requiresInterviews: true,
    description: 'Track your improvement journey'
  },
  {
    id: 'scorecard',
    label: 'Generate scorecard',
    prompt: 'Generate a detailed competency scorecard for my latest interview with rubric-aligned scores and evidence.',
    icon: <FileText className="w-4 h-4" />,
    category: 'performance',
    requiresInterviews: true,
    description: 'Get a structured performance report'
  },
  {
    id: 'tips',
    label: 'Quick interview tips',
    prompt: 'Give me 3-5 actionable tips to improve my next interview performance based on best practices.',
    icon: <Lightbulb className="w-4 h-4" />,
    category: 'performance',
    requiresInterviews: false,
    description: 'General interview improvement advice'
  },
  // Support Actions
  {
    id: 'credits',
    label: 'Credits & billing',
    prompt: 'How do credits work? Tell me about pricing, packages, and payment options.',
    icon: <CreditCard className="w-4 h-4" />,
    category: 'support',
    description: 'Learn about credits and payments'
  },
  {
    id: 'audio',
    label: 'Audio troubleshooting',
    prompt: 'I am having audio issues during interviews. How can I troubleshoot and fix this?',
    icon: <Settings className="w-4 h-4" />,
    category: 'support',
    description: 'Fix microphone and audio problems'
  },
  {
    id: 'how-it-works',
    label: 'How Vocaid works',
    prompt: 'How does Vocaid work? Walk me through the interview process and scoring system.',
    icon: <HelpCircle className="w-4 h-4" />,
    category: 'support',
    description: 'Understand the platform'
  },
  {
    id: 'languages',
    label: 'Multi-language support',
    prompt: 'What languages does Vocaid support? Can I practice in my native language?',
    icon: <Globe className="w-4 h-4" />,
    category: 'support',
    description: 'Learn about language options'
  }
];

// ========================================
// CATEGORY ICONS - Enhanced for HR Intelligence
// ========================================

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Billing & Credits': <CreditCard className="w-4 h-4" />,
  'How It Works': <BookOpen className="w-4 h-4" />,
  'Troubleshooting': <Settings className="w-4 h-4" />,
  'Features': <Sparkles className="w-4 h-4" />,
  'Interview Insights': <BrainCircuit className="w-4 h-4" />,
  'Privacy & Security': <Shield className="w-4 h-4" />
};

// ========================================
// HELPER: Parse structured AI response
// Note: Reserved for future enhanced response rendering
// ========================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseStructuredResponse(content: string): ParsedResponse {
  const result: ParsedResponse = { answer: content };
  
  // Try to extract structured sections from the response
  const answerMatch = content.match(/\*\*📋 Answer \/ Insight\*\*\s*([\s\S]*?)(?=\*\*📊 Evidence|$)/i);
  const evidenceMatch = content.match(/\*\*📊 Evidence\*\*\s*([\s\S]*?)(?=\*\*⚡ Actions|$)/i);
  const actionsMatch = content.match(/\*\*⚡ Actions\*\*\s*([\s\S]*?)(?=\*\*➡️ Next Step|$)/i);
  const nextStepMatch = content.match(/\*\*➡️ Next Step\*\*\s*([\s\S]*?)(?=\*\*💡 Upgrade|$)/i);
  const upgradeMatch = content.match(/\*\*💡 Upgrade Suggestion\*\*\s*([\s\S]*?)$/i);
  
  if (answerMatch) result.answer = answerMatch[1].trim();
  if (evidenceMatch) result.evidence = evidenceMatch[1].trim();
  if (actionsMatch) {
    const actionText = actionsMatch[1].trim();
    result.actions = actionText.split('\n').filter(a => a.trim().length > 0);
  }
  if (nextStepMatch) result.nextStep = nextStepMatch[1].trim();
  if (upgradeMatch) result.upgradeIdea = upgradeMatch[1].trim();
  
  return result;
}

// ========================================
// MAIN COMPONENT
// ========================================

const BACKEND_URL = config.backendUrl;

const ContactButton: React.FC = () => {
  const location = useLocation();
  const { user, isSignedIn } = useUser();
  const { t } = useTranslation();
  
  // UI State
  const [isOpen, setIsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<'performance' | 'faq'>('performance');
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['How It Works']));
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [filters, setFilters] = useState<ChatContext>({});
  const [filterOptions, setFilterOptions] = useState<FilterOption>({ roles: [], companies: [] });
  const [error, setError] = useState<string | null>(null);
  
  // Data State
  const [recentInterviews, setRecentInterviews] = useState<RecentInterview[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Pages where button should NOT show
  const hiddenPaths = ['/interview-setup', '/feedback', '/contact'];
  const isInterviewPage = location.pathname === '/interview' || location.pathname.startsWith('/interview/');
  const shouldHide = hiddenPaths.some(path => location.pathname.startsWith(path)) || isInterviewPage;
  const shouldShow = !shouldHide;

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Fetch filters and recent interviews
  const fetchUserData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const filtersRes = await fetch(`${BACKEND_URL}/api/analytics/filters`, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      // Check content type before parsing
      const filtersContentType = filtersRes.headers.get('content-type') || '';
      if (filtersRes.ok && filtersContentType.includes('application/json')) {
        const data = await filtersRes.json();
        setFilterOptions(data.data || { roles: [], companies: [] });
      }
      
      const interviewsRes = await fetch(`${BACKEND_URL}/api/users/${user.id}/interviews?limit=5`, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      // Check content type before parsing
      const interviewsContentType = interviewsRes.headers.get('content-type') || '';
      if (interviewsRes.ok && interviewsContentType.includes('application/json')) {
        const data = await interviewsRes.json();
        setRecentInterviews(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  }, [user?.id]);

  // Initialize on open
  useEffect(() => {
    if (isOpen && isSignedIn) {
      fetchUserData();
      
      if (messages.length === 0) {
        const welcomeMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Welcome to **Vocaid HR Intelligence Chat**!

I'm your context-aware AI assistant with two specialized modes:

**📊 Interview Insights** — Analyze your interview performance with evidence-based scorecards, competency breakdowns, and personalized improvement suggestions.

**❓ FAQ Concierge** — Get instant answers about credits, billing, technical issues, platform features, and more.

I'll automatically detect which mode to use based on your question. Just ask naturally!

${recentInterviews.length > 0 ? `\n*I see you have ${recentInterviews.length} recent interview${recentInterviews.length > 1 ? 's' : ''} — ask me to analyze them!*` : ''}`,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    }
  }, [isOpen, isSignedIn, fetchUserData, messages.length, recentInterviews.length]);

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    if (!faqSearch.trim()) return FAQ_BY_CATEGORY;
    
    const searchLower = faqSearch.toLowerCase();
    const filtered: Record<string, FAQItem[]> = {};
    
    for (const [category, faqs] of Object.entries(FAQ_BY_CATEGORY)) {
      const matching = faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchLower) ||
        faq.answer.toLowerCase().includes(searchLower) ||
        faq.keywords.some(k => k.toLowerCase().includes(searchLower))
      );
      if (matching.length > 0) {
        filtered[category] = matching;
      }
    }
    
    return filtered;
  }, [faqSearch]);

  // Available quick actions based on user state
  const availableActions = useMemo(() => {
    return QUICK_ACTIONS.filter(action => {
      if (action.requiresInterviews && recentInterviews.length === 0) return false;
      return true;
    });
  }, [recentInterviews.length]);

  // Send message
  const sendMessage = async (customMessage?: string) => {
    const messageText = customMessage || input.trim();
    if (!messageText || isLoading) return;
    
    if (!isSignedIn || !user?.id) {
      const faqMatch = findFAQMatch(messageText);
      if (faqMatch) {
        const userMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'user',
          content: messageText,
          timestamp: new Date()
        };
        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: faqMatch.answer,
          timestamp: new Date(),
          category: 'support'
        };
        setMessages(prev => [...prev, userMsg, assistantMsg]);
        setInput('');
        return;
      }
      
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: messageText,
        timestamp: new Date()
      };
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Please sign in to access personalized performance analysis and full support. For general questions, check out the FAQ section in the sidebar!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMsg, assistantMsg]);
      setInput('');
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          message: messageText,
          sessionId,
          filters,
          faqContext: FAQ_KNOWLEDGE_BASE.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')
        })
      });

      // Check content type before parsing
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response from chat:', { 
          status: response.status, 
          contentType, 
          preview: text.slice(0, 200) 
        });
        throw new Error(`Server returned invalid response (${response.status}). Please try again.`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to get response');
      }

      if (data.data?.sessionId && !sessionId) {
        setSessionId(data.data.sessionId);
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.data?.message || 'Sorry, I could not generate a response. Please try again.',
        timestamp: new Date(),
        category: data.data?.category || 'performance'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Find matching FAQ
  const findFAQMatch = (query: string): FAQItem | null => {
    const queryLower = query.toLowerCase();
    for (const faq of FAQ_KNOWLEDGE_BASE) {
      if (faq.keywords.some(k => queryLower.includes(k))) {
        return faq;
      }
    }
    return null;
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Clear chat
  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
    setError(null);
    setIsOpen(true);
  };

  // Toggle FAQ category
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Handle FAQ click
  const handleFAQClick = (faq: FAQItem) => {
    sendMessage(faq.question);
  };

  // Handle quick action click
  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.prompt);
  };

  // Close handler
  const handleClose = () => {
    setIsOpen(false);
  };

  // Don't show on hidden pages
  if (!shouldShow) return null;

  // For unauthenticated users, show a simple contact redirect button
  if (!isSignedIn) {
    return (
      <>
        <button
          onClick={() => window.location.href = '/contact'}
          className={`
            fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50
            w-16 h-16 sm:w-20 sm:h-20
            bg-gradient-to-r from-purple-600 to-violet-600
            hover:from-purple-700 hover:to-violet-700
            text-white rounded-full
            shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40
            flex items-center justify-center
            transition-all duration-300 ease-out
            transform hover:scale-110 active:scale-95
          `}
          aria-label="Contact Us"
        >
          <MessageCircle className="w-7 h-7 sm:w-9 sm:h-9" />
        </button>
      </>
    );
  }

  return (
    <>
      {/* Floating Button - Fixed Bottom Right */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50
          w-16 h-16 sm:w-20 sm:h-20
          bg-gradient-to-r from-purple-600 to-violet-600
          hover:from-purple-700 hover:to-violet-700
          text-white rounded-full
          shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40
          flex items-center justify-center
          transition-all duration-300 ease-out
          transform hover:scale-110 active:scale-95
          ${isOpen ? 'opacity-0 pointer-events-none scale-75' : 'opacity-100'}
        `}
        aria-label={t('hrChat.floating.ariaLabel')}
        title={t('hrChat.floating.tooltip')}
      >
        <BrainCircuit className="w-7 h-7 sm:w-9 sm:h-9" />
      </button>

      {/* Main Modal with Sidebar Layout */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={handleClose}
        >
          <div
            className="bg-white w-full h-[95vh] sm:h-[85vh] sm:max-h-[700px] sm:w-full sm:max-w-4xl rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-purple-600 via-purple-600 to-violet-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">{t('hrChat.title')}</h2>
                  <p className="text-xs text-purple-200">{t('hrChat.subtitle')}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white hidden sm:flex items-center gap-1"
                  title={sidebarCollapsed ? t('hrChat.showSidebar') : t('hrChat.hideSidebar')}
                >
                  {sidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                </button>
                <button
                  onClick={clearChat}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                  title={t('hrChat.newConversation')}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Content with Sidebar */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Sidebar - Desktop */}
              {!sidebarCollapsed && (
                <div className="hidden sm:flex flex-col w-72 border-r border-gray-200 bg-gray-50/50">
                  {/* Sidebar Tabs */}
                  <div className="flex border-b border-gray-200">
                    <button
                      onClick={() => setActiveSection('performance')}
                      className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                        activeSection === 'performance'
                          ? 'text-purple-600 border-b-2 border-purple-600 bg-white'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      {t('hrChat.sidebar.insights')}
                    </button>
                    <button
                      onClick={() => setActiveSection('faq')}
                      className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                        activeSection === 'faq'
                          ? 'text-purple-600 border-b-2 border-purple-600 bg-white'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {t('hrChat.sidebar.faq')}
                    </button>
                  </div>

                  {/* Sidebar Content */}
                  <div className="flex-1 overflow-y-auto">
                    {activeSection === 'performance' ? (
                      <div className="p-3 space-y-3">
                        {/* Context Filters */}
                        {isSignedIn && (filterOptions.roles.length > 0 || filterOptions.companies.length > 0) && (
                          <div className="bg-white rounded-xl p-3 border border-gray-200">
                            <button
                              onClick={() => setShowFilters(!showFilters)}
                              className="flex items-center justify-between w-full text-xs font-medium text-gray-700"
                            >
                              <span className="flex items-center gap-1.5">
                                <Settings className="w-3.5 h-3.5" />
                                {t('hrChat.sidebar.analysisScope')}
                              </span>
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {showFilters && (
                              <div className="mt-2 space-y-2">
                                <select
                                  value={filters.roleFilter || ''}
                                  onChange={(e) => setFilters(prev => ({ ...prev, roleFilter: e.target.value || undefined }))}
                                  className="w-full text-xs px-2 py-1.5 border rounded-lg focus:ring-1 focus:ring-purple-500"
                                >
                                  <option value="">{t('hrChat.sidebar.allRoles')}</option>
                                  {filterOptions.roles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                  ))}
                                </select>
                                <select
                                  value={filters.companyFilter || ''}
                                  onChange={(e) => setFilters(prev => ({ ...prev, companyFilter: e.target.value || undefined }))}
                                  className="w-full text-xs px-2 py-1.5 border rounded-lg focus:ring-1 focus:ring-purple-500"
                                >
                                  <option value="">{t('hrChat.sidebar.allCompanies')}</option>
                                  {filterOptions.companies.map(company => (
                                    <option key={company} value={company}>{company}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Interview Insights Actions */}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
                            {t('hrChat.sidebar.interviewInsights')}
                          </p>
                          <div className="space-y-1.5">
                            {availableActions
                              .filter(a => a.category === 'performance')
                              .map((action) => (
                                <button
                                  key={action.id}
                                  onClick={() => handleQuickAction(action)}
                                  disabled={isLoading}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm text-gray-700 bg-white hover:bg-purple-50 hover:text-purple-700 rounded-lg border border-gray-200 hover:border-purple-200 transition-all group disabled:opacity-50"
                                  title={action.description}
                                >
                                  <span className="text-purple-500 group-hover:text-purple-600">
                                    {action.icon}
                                  </span>
                                  <span className="flex-1">{action.label}</span>
                                  <Zap className="w-3.5 h-3.5 text-gray-300 group-hover:text-purple-400 transition-colors" />
                                </button>
                              ))}
                          </div>
                        </div>

                        {/* FAQ Concierge Actions */}
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
                            {t('hrChat.sidebar.faqConcierge')}
                          </p>
                          <div className="space-y-1.5">
                            {availableActions
                              .filter(a => a.category === 'support')
                              .map((action) => (
                                <button
                                  key={action.id}
                                  onClick={() => handleQuickAction(action)}
                                  disabled={isLoading}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm text-gray-700 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 transition-all group disabled:opacity-50"
                                  title={action.description}
                                >
                                  <span className="text-gray-400 group-hover:text-gray-500">
                                    {action.icon}
                                  </span>
                                  <span className="flex-1">{action.label}</span>
                                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 transition-colors" />
                                </button>
                              ))}
                          </div>
                        </div>

                        {/* Recent Interviews */}
                        {isSignedIn && recentInterviews.length > 0 && (
                          <div className="pt-2 border-t border-gray-200">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
                              {t('hrChat.sidebar.recentInterviews')}
                            </p>
                            <div className="space-y-1.5">
                              {recentInterviews.slice(0, 3).map((interview) => (
                                <button
                                  key={interview.id}
                                  onClick={() => sendMessage(`Analyze my ${interview.jobTitle} interview at ${interview.companyName}`)}
                                  disabled={isLoading}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left bg-white hover:bg-purple-50 rounded-lg border border-gray-200 hover:border-purple-200 transition-all group disabled:opacity-50"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-800 truncate group-hover:text-purple-700">
                                      {interview.jobTitle}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                      {interview.companyName}
                                    </p>
                                  </div>
                                  {interview.score !== null && (
                                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                                      interview.score >= 80 ? 'bg-green-100 text-green-700' :
                                      interview.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                      {interview.score}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 space-y-3">
                        {/* Search */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={faqSearch}
                            onChange={(e) => setFaqSearch(e.target.value)}
                            placeholder={t('hrChat.searchFaq')}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                          />
                        </div>

                        {/* FAQ Categories */}
                        <div className="space-y-2">
                          {Object.entries(filteredFaqs).map(([category, faqs]) => (
                            <div key={category} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              <button
                                onClick={() => toggleCategory(category)}
                                className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-purple-500">
                                    {CATEGORY_ICONS[category] || <HelpCircle className="w-4 h-4" />}
                                  </span>
                                  <span className="text-sm font-medium text-gray-800">{category}</span>
                                  <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                    {faqs.length}
                                  </span>
                                </div>
                                <ChevronRight 
                                  className={`w-4 h-4 text-gray-400 transition-transform ${
                                    expandedCategories.has(category) ? 'rotate-90' : ''
                                  }`} 
                                />
                              </button>
                              
                              {expandedCategories.has(category) && (
                                <div className="border-t border-gray-100">
                                  {faqs.map((faq) => (
                                    <button
                                      key={faq.id}
                                      onClick={() => handleFAQClick(faq)}
                                      disabled={isLoading}
                                      className="w-full px-3 py-2 text-left hover:bg-purple-50 transition-colors border-b border-gray-50 last:border-b-0 disabled:opacity-50"
                                    >
                                      <p className="text-xs font-medium text-gray-700 hover:text-purple-700">
                                        {faq.question}
                                      </p>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}

                          {Object.keys(filteredFaqs).length === 0 && faqSearch && (
                            <div className="text-center py-6 text-gray-500">
                              <HelpCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                              <p className="text-sm">{t('hrChat.noFaqFound')}</p>
                              <button
                                onClick={() => {
                                  setActiveSection('performance');
                                  setInput(faqSearch);
                                }}
                                className="mt-2 text-xs text-purple-600 hover:text-purple-800"
                              >
                                {t('hrChat.askAiInstead')} →
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Chat Area */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Tab Pills */}
                <div className="flex sm:hidden gap-2 p-3 bg-gray-50 border-b border-gray-200 overflow-x-auto">
                  {availableActions.slice(0, 4).map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action)}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white rounded-full border border-gray-200 hover:border-purple-300 hover:text-purple-700 whitespace-nowrap disabled:opacity-50"
                    >
                      {action.icon}
                      {action.label}
                    </button>
                  ))}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-purple-600 text-white rounded-tr-md'
                            : 'bg-gray-100 text-gray-800 rounded-tl-md'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <div className="text-sm leading-relaxed space-y-2">
                            {/* Render markdown-like content with proper formatting */}
                            {message.content.split('\n').map((line, idx) => {
                              // Handle bold text
                              if (line.startsWith('**') && line.endsWith('**')) {
                                return (
                                  <p key={idx} className="font-semibold text-gray-900 mt-2 first:mt-0">
                                    {line.replace(/\*\*/g, '')}
                                  </p>
                                );
                              }
                              // Handle section headers with emojis
                              if (line.match(/^\*\*[📋📊⚡➡️💡].+\*\*$/)) {
                                const headerText = line.replace(/\*\*/g, '');
                                return (
                                  <p key={idx} className="font-semibold text-purple-700 mt-3 first:mt-0 flex items-center gap-1">
                                    {headerText}
                                  </p>
                                );
                              }
                              // Handle bullet points
                              if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
                                return (
                                  <p key={idx} className="pl-4 relative before:absolute before:left-0 before:content-['•'] before:text-purple-500">
                                    {line.replace(/^[\s-•]+/, '')}
                                  </p>
                                );
                              }
                              // Handle numbered lists
                              if (line.trim().match(/^\d+\./)) {
                                return (
                                  <p key={idx} className="pl-4">
                                    {line}
                                  </p>
                                );
                              }
                              // Empty lines
                              if (line.trim() === '') {
                                return <div key={idx} className="h-1" />;
                              }
                              // Regular text
                              return (
                                <p key={idx} className="whitespace-pre-wrap">
                                  {line.replace(/\*\*(.+?)\*\*/g, '$1')}
                                </p>
                              );
                            })}
                            {/* Show category badge */}
                            {message.category && (
                              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  message.category === 'performance' 
                                    ? 'bg-purple-100 text-purple-700' 
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {message.category === 'performance' ? `📊 ${t('hrChat.categories.insights')}` : `❓ ${t('hrChat.categories.faq')}`}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        )}
                      </div>
                      {message.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <UserIcon className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                          <span className="text-sm text-gray-600">
                            {t('hrChat.loading')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="bg-red-50 rounded-2xl rounded-tl-md px-4 py-3 border border-red-200">
                        <p className="text-sm text-red-600">{error}</p>
                        <button 
                          onClick={() => setError(null)}
                          className="text-xs text-red-500 hover:text-red-700 mt-1 underline"
                        >
                          {t('hrChat.error.dismiss')}
                        </button>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-100 bg-white">
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t('hrChat.input.placeholder')}
                      className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 max-h-24 shadow-sm"
                      rows={1}
                      disabled={isLoading}
                    />
                    <button
                      onClick={() => sendMessage()}
                      disabled={!input.trim() || isLoading}
                      className="p-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    {t('hrChat.input.autoDetectHint')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default ContactButton;
