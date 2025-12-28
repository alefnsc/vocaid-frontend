/**
 * ContactAssistant.tsx
 * 
 * AI-powered contact assistant chat interface with FAQ answering.
 * Collects contact information through conversational flow and can answer
 * frequently asked questions before form submission.
 * 
 * Design System: Vocaid (white, black, zinc, purple-600 only - NO ICONS)
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { 
  ContactFormData, 
  SUBJECT_OPTIONS, 
  getSubjectDisplayLabel,
  SubjectType,
  MESSAGE_MIN_LENGTH, 
  MESSAGE_MAX_LENGTH,
  validateField,
  validateContactForm 
} from './contactSchema';
import { submitToFormspree, createSubmissionReceipt, storeReceipt } from './formspreeClient';

// ============================================================================
// FAQ KNOWLEDGE BASE
// ============================================================================

interface FAQEntry {
  keywords: string[];
  questionPatterns: RegExp[];
  answer: {
    en: string;
    pt: string;
  };
  topic: string;
}

const FAQ_KNOWLEDGE_BASE: FAQEntry[] = [
  {
    keywords: ['credit', 'credits', 'crédito', 'créditos', 'how many', 'quantos', 'cost', 'custo', 'price', 'preço'],
    questionPatterns: [
      /how many credits?/i,
      /credit.*cost/i,
      /what.*credit/i,
      /quantos créditos/i,
      /custo.*crédito/i
    ],
    topic: 'credits',
    answer: {
      en: "Each mock interview costs 1 credit. You can purchase credit packs starting from 5 credits. The more credits you buy, the better the value per interview. Check our pricing page for current packages!",
      pt: "Cada entrevista simulada custa 1 crédito. Você pode comprar pacotes de créditos a partir de 5 créditos. Quanto mais créditos você compra, melhor o custo-benefício por entrevista. Confira nossa página de preços para ver os pacotes atuais!"
    }
  },
  {
    keywords: ['interview', 'mock', 'entrevista', 'simulada', 'how long', 'duration', 'quanto tempo', 'duração'],
    questionPatterns: [
      /how long.*interview/i,
      /interview.*duration/i,
      /quanto tempo.*entrevista/i,
      /duração.*entrevista/i
    ],
    topic: 'interview_duration',
    answer: {
      en: "Mock interviews typically last 15-30 minutes, depending on the role and depth of questions. You'll receive detailed feedback immediately after completion, including performance scores and improvement suggestions.",
      pt: "As entrevistas simuladas geralmente duram de 15 a 30 minutos, dependendo da vaga e profundidade das perguntas. Você receberá feedback detalhado imediatamente após a conclusão, incluindo pontuações de desempenho e sugestões de melhoria."
    }
  },
  {
    keywords: ['language', 'languages', 'idioma', 'idiomas', 'português', 'portuguese', 'english', 'inglês', 'spanish', 'espanhol', 'chinese', 'chinês', 'hindi', 'french', 'francês', 'russian', 'russo'],
    questionPatterns: [
      /what language/i,
      /which language/i,
      /support.*language/i,
      /quais idiomas/i,
      /suporte.*idioma/i
    ],
    topic: 'languages',
    answer: {
      en: "Vocaid supports interviews in 7 languages: English, Chinese, Hindi, French, Spanish, Portuguese, and Russian. You can switch your interface language in settings and select your preferred interview language when starting a session.",
      pt: "Vocaid suporta entrevistas em 7 idiomas: Inglês, Chinês, Hindi, Francês, Espanhol, Português e Russo. Você pode trocar o idioma da interface nas configurações e selecionar o idioma de entrevista preferido ao iniciar uma sessão."
    }
  },
  {
    keywords: ['refund', 'money back', 'reembolso', 'dinheiro de volta', 'cancel', 'cancelar'],
    questionPatterns: [
      /refund/i,
      /money back/i,
      /can.*cancel/i,
      /reembolso/i,
      /dinheiro de volta/i,
      /posso cancelar/i
    ],
    topic: 'refund',
    answer: {
      en: "We offer refunds for unused credits within 7 days of purchase. If you're not satisfied with your experience, please contact our support team and we'll work with you to resolve any issues.",
      pt: "Oferecemos reembolso para créditos não utilizados dentro de 7 dias após a compra. Se você não estiver satisfeito com sua experiência, entre em contato com nossa equipe de suporte e trabalharemos para resolver qualquer problema."
    }
  },
  {
    keywords: ['resume', 'cv', 'currículo', 'upload', 'enviar', 'format', 'formato'],
    questionPatterns: [
      /upload.*resume/i,
      /resume.*format/i,
      /what.*resume/i,
      /enviar.*currículo/i,
      /formato.*currículo/i
    ],
    topic: 'resume',
    answer: {
      en: "You can upload your resume in PDF, DOC, or DOCX format (max 5MB). Our AI analyzes your resume to personalize interview questions based on your experience and the target role.",
      pt: "Você pode enviar seu currículo nos formatos PDF, DOC ou DOCX (máximo 5MB). Nossa IA analisa seu currículo para personalizar as perguntas da entrevista com base na sua experiência e na vaga desejada."
    }
  },
  {
    keywords: ['feedback', 'results', 'score', 'resultado', 'pontuação', 'avaliação'],
    questionPatterns: [
      /get.*feedback/i,
      /see.*results/i,
      /how.*score/i,
      /como.*feedback/i,
      /ver.*resultado/i
    ],
    topic: 'feedback',
    answer: {
      en: "After each interview, you receive comprehensive feedback including: communication score, technical accuracy, response quality, and specific improvement suggestions. You can review past interviews anytime in your dashboard.",
      pt: "Após cada entrevista, você recebe feedback abrangente incluindo: pontuação de comunicação, precisão técnica, qualidade das respostas e sugestões específicas de melhoria. Você pode revisar entrevistas anteriores a qualquer momento no seu painel."
    }
  },
  {
    keywords: ['account', 'delete', 'data', 'privacy', 'conta', 'excluir', 'dados', 'privacidade'],
    questionPatterns: [
      /delete.*account/i,
      /my data/i,
      /privacy/i,
      /excluir.*conta/i,
      /meus dados/i,
      /privacidade/i
    ],
    topic: 'privacy',
    answer: {
      en: "Your privacy is important to us. You can delete your account and all associated data from your settings page. We comply with LGPD and GDPR regulations. For data requests, email privacy@vocaid.io.",
      pt: "Sua privacidade é importante para nós. Você pode excluir sua conta e todos os dados associados na página de configurações. Cumprimos os regulamentos LGPD e GDPR. Para solicitações de dados, envie email para privacy@vocaid.io."
    }
  },
  {
    keywords: ['free', 'trial', 'grátis', 'teste', 'try', 'experimentar'],
    questionPatterns: [
      /free trial/i,
      /try.*free/i,
      /teste grátis/i,
      /experimentar/i
    ],
    topic: 'trial',
    answer: {
      en: "New users get 5 free credits to try mock interviews! Sign up and experience our AI-powered interview practice. No credit card required.",
      pt: "Novos usuários ganham 5 créditos grátis para experimentar entrevistas simuladas! Cadastre-se e experimente nossa prática de entrevistas com IA. Não é necessário cartão de crédito."
    }
  },
  {
    keywords: ['job', 'role', 'position', 'cargo', 'vaga', 'type', 'tipo'],
    questionPatterns: [
      /what.*job/i,
      /which.*role/i,
      /type.*interview/i,
      /quais.*vagas/i,
      /tipo.*entrevista/i
    ],
    topic: 'job_types',
    answer: {
      en: "Vocaid offers mock interviews for various roles including: Software Engineering, Product Management, Data Science, Marketing, Sales, Finance, and more. We customize questions based on seniority level from Junior to Executive.",
      pt: "Vocaid oferece entrevistas simuladas para várias funções incluindo: Engenharia de Software, Gerenciamento de Produtos, Ciência de Dados, Marketing, Vendas, Finanças e mais. Personalizamos as perguntas com base no nível de senioridade, de Júnior a Executivo."
    }
  },
  {
    keywords: ['technical', 'coding', 'técnica', 'código', 'programming', 'programação'],
    questionPatterns: [
      /technical interview/i,
      /coding.*interview/i,
      /entrevista técnica/i,
      /código/i
    ],
    topic: 'technical',
    answer: {
      en: "Our technical interviews simulate real coding challenges. You'll face algorithm, data structure, and system design questions tailored to your experience level. Practice verbal problem-solving just like in real tech interviews!",
      pt: "Nossas entrevistas técnicas simulam desafios de programação reais. Você enfrentará questões de algoritmos, estruturas de dados e design de sistemas adaptadas ao seu nível de experiência. Pratique resolução verbal de problemas como em entrevistas reais de tech!"
    }
  }
];

// ============================================================================
// TYPES
// ============================================================================

type Step = 'welcome' | 'name' | 'email' | 'subject' | 'message' | 'review' | 'submitting' | 'success' | 'error';

interface Message {
  id: string;
  type: 'assistant' | 'user' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface ContactAssistantProps {
  onClose?: () => void;
  onSubmitSuccess?: () => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const generateId = (): string => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const detectFAQIntent = (message: string, language: string): FAQEntry | null => {
  const normalizedMessage = message.toLowerCase().trim();
  
  // Check for question indicators
  const isQuestion = normalizedMessage.includes('?') || 
    /^(how|what|when|where|why|can|do|does|is|are|will|would|como|qual|quais|quando|onde|por que|posso|é|são)/i.test(normalizedMessage);
  
  if (!isQuestion && normalizedMessage.length < 10) {
    return null;
  }
  
  // Score each FAQ entry
  let bestMatch: FAQEntry | null = null;
  let bestScore = 0;
  
  for (const faq of FAQ_KNOWLEDGE_BASE) {
    let score = 0;
    
    // Check keyword matches
    for (const keyword of faq.keywords) {
      if (normalizedMessage.includes(keyword.toLowerCase())) {
        score += 2;
      }
    }
    
    // Check pattern matches (higher weight)
    for (const pattern of faq.questionPatterns) {
      if (pattern.test(normalizedMessage)) {
        score += 5;
      }
    }
    
    if (score > bestScore && score >= 2) {
      bestScore = score;
      bestMatch = faq;
    }
  }
  
  return bestMatch;
};

// ============================================================================
// COMPONENT
// ============================================================================

export const ContactAssistant: React.FC<ContactAssistantProps> = ({ 
  onClose, 
  onSubmitSuccess 
}) => {
  const { t, i18n } = useTranslation();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // State
  const [step, setStep] = useState<Step>('welcome');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [formData, setFormData] = useState<Partial<ContactFormData>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAnsweredFAQ, setHasAnsweredFAQ] = useState(false);
  
  const currentLanguage = i18n.language?.startsWith('pt') ? 'pt' : 'en';
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input when step changes
  useEffect(() => {
    if (step === 'message') {
      textareaRef.current?.focus();
    } else if (['name', 'email'].includes(step)) {
      inputRef.current?.focus();
    }
  }, [step]);
  
  // Add initial welcome message
  useEffect(() => {
    const welcomeText = currentLanguage === 'pt'
      ? "Olá! 👋 Sou o assistente de contato da Vocaid. Posso ajudá-lo a enviar uma mensagem para nossa equipe ou responder suas dúvidas frequentes.\n\nComo posso ajudar você hoje?"
      : "Hello! 👋 I'm Vocaid's contact assistant. I can help you send a message to our team or answer your frequently asked questions.\n\nHow can I help you today?";
    
    addMessage('assistant', welcomeText);
  }, []);
  
  // Add message helper
  const addMessage = useCallback((type: Message['type'], content: string, isTyping = false) => {
    const newMessage: Message = {
      id: generateId(),
      type,
      content,
      timestamp: new Date(),
      isTyping
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  }, []);
  
  // Build review message with actual user data (NOT using translation placeholders)
  const buildReviewMessage = useCallback((): string => {
    const subjectLabel = formData.subject ? getSubjectDisplayLabel(formData.subject as SubjectType) : '';
    
    if (currentLanguage === 'pt') {
      return `Aqui está um resumo da sua mensagem:\n\n` +
        `**Nome:** ${formData.name}\n` +
        `**Email:** ${formData.email}\n` +
        `**Assunto:** ${subjectLabel}\n` +
        `**Mensagem:** ${formData.message}\n\n` +
        `Está tudo correto? Digite "sim" para enviar ou "não" para fazer alterações.`;
    }
    
    return `Here's a summary of your message:\n\n` +
      `**Name:** ${formData.name}\n` +
      `**Email:** ${formData.email}\n` +
      `**Subject:** ${subjectLabel}\n` +
      `**Message:** ${formData.message}\n\n` +
      `Does everything look correct? Type "yes" to send or "no" to make changes.`;
  }, [formData, currentLanguage]);
  
  // Process current step and move forward
  const processStep = useCallback((value: string) => {
    switch (step) {
      case 'welcome':
        // Check if user is asking a FAQ
        const faqMatch = detectFAQIntent(value, currentLanguage);
        if (faqMatch) {
          setHasAnsweredFAQ(true);
          const answer = currentLanguage === 'pt' ? faqMatch.answer.pt : faqMatch.answer.en;
          const followUp = currentLanguage === 'pt'
            ? "\n\nPosso ajudar com mais alguma dúvida? Ou se preferir, posso ajudá-lo a enviar uma mensagem para nossa equipe."
            : "\n\nCan I help with anything else? Or if you prefer, I can help you send a message to our team.";
          
          addMessage('assistant', answer + followUp);
          return;
        }
        
        // Move to name collection
        const namePrompt = currentLanguage === 'pt'
          ? "Vou ajudá-lo a entrar em contato com nossa equipe. Primeiro, qual é o seu nome?"
          : "I'll help you get in touch with our team. First, what's your name?";
        addMessage('assistant', namePrompt);
        setStep('name');
        break;
        
      case 'name':
        const nameValidation = validateField('name', value);
        if (nameValidation !== null) {
          const errorMsg = currentLanguage === 'pt'
            ? "Por favor, digite um nome válido (pelo menos 2 caracteres)."
            : "Please enter a valid name (at least 2 characters).";
          addMessage('assistant', errorMsg);
          return;
        }
        
        setFormData(prev => ({ ...prev, name: value }));
        const emailPrompt = currentLanguage === 'pt'
          ? `Prazer em conhecê-lo, ${value}! Qual é o seu endereço de email?`
          : `Nice to meet you, ${value}! What's your email address?`;
        addMessage('assistant', emailPrompt);
        setStep('email');
        break;
        
      case 'email':
        const emailValidation = validateField('email', value);
        if (emailValidation !== null) {
          const errorMsg = currentLanguage === 'pt'
            ? "Por favor, digite um endereço de email válido."
            : "Please enter a valid email address.";
          addMessage('assistant', errorMsg);
          return;
        }
        
        setFormData(prev => ({ ...prev, email: value }));
        const subjectPrompt = currentLanguage === 'pt'
          ? "Ótimo! Sobre qual assunto você gostaria de falar? Por favor, escolha uma opção:\n\n" +
            SUBJECT_OPTIONS.map((opt, i) => `${i + 1}. ${opt.labelKey}`).join('\n')
          : "Great! What topic would you like to discuss? Please choose an option:\n\n" +
            SUBJECT_OPTIONS.map((opt, i) => `${i + 1}. ${opt.labelKey}`).join('\n');
        addMessage('assistant', subjectPrompt);
        setStep('subject');
        break;
        
      case 'subject':
        // Check if user is asking a FAQ instead of selecting subject
        const subjectFaqMatch = detectFAQIntent(value, currentLanguage);
        if (subjectFaqMatch) {
          const answer = currentLanguage === 'pt' ? subjectFaqMatch.answer.pt : subjectFaqMatch.answer.en;
          const followUp = currentLanguage === 'pt'
            ? "\n\nAinda gostaria de enviar uma mensagem? Por favor, escolha um assunto:\n\n" +
              SUBJECT_OPTIONS.map((opt, i) => `${i + 1}. ${opt.labelKey}`).join('\n')
            : "\n\nWould you still like to send a message? Please choose a topic:\n\n" +
              SUBJECT_OPTIONS.map((opt, i) => `${i + 1}. ${opt.labelKey}`).join('\n');
          
          addMessage('assistant', answer + followUp);
          return;
        }
        
        // Try to match by number or keyword
        let selectedSubject: SubjectType | null = null;
        const numValue = parseInt(value, 10);
        
        if (numValue >= 1 && numValue <= SUBJECT_OPTIONS.length) {
          selectedSubject = SUBJECT_OPTIONS[numValue - 1].value;
        } else {
          // Try to match by keyword
          const lowerValue = value.toLowerCase();
          for (const opt of SUBJECT_OPTIONS) {
            if (opt.value.toLowerCase().includes(lowerValue) || 
                opt.labelKey.toLowerCase().includes(lowerValue)) {
              selectedSubject = opt.value;
              break;
            }
          }
        }
        
        if (!selectedSubject) {
          const errorMsg = currentLanguage === 'pt'
            ? "Por favor, selecione uma opção válida (1-6) ou digite o nome do assunto."
            : "Please select a valid option (1-6) or type the topic name.";
          addMessage('assistant', errorMsg);
          return;
        }
        
        setFormData(prev => ({ ...prev, subject: selectedSubject as SubjectType }));
        const subjectLabel = getSubjectDisplayLabel(selectedSubject as SubjectType);
        const messagePrompt = currentLanguage === 'pt'
          ? `Entendido - "${subjectLabel}". Agora, por favor, escreva sua mensagem (entre ${MESSAGE_MIN_LENGTH} e ${MESSAGE_MAX_LENGTH} caracteres).`
          : `Got it - "${subjectLabel}". Now, please write your message (between ${MESSAGE_MIN_LENGTH} and ${MESSAGE_MAX_LENGTH} characters).`;
        addMessage('assistant', messagePrompt);
        setStep('message');
        break;
        
      case 'message':
        const messageValidation = validateField('message', value);
        if (messageValidation !== null) {
          const charCount = value.length;
          let errorMsg: string;
          
          if (charCount < MESSAGE_MIN_LENGTH) {
            errorMsg = currentLanguage === 'pt'
              ? `Sua mensagem precisa de pelo menos ${MESSAGE_MIN_LENGTH} caracteres. Atualmente você tem ${charCount}.`
              : `Your message needs at least ${MESSAGE_MIN_LENGTH} characters. You currently have ${charCount}.`;
          } else {
            errorMsg = currentLanguage === 'pt'
              ? `Sua mensagem não pode exceder ${MESSAGE_MAX_LENGTH} caracteres. Atualmente você tem ${charCount}.`
              : `Your message cannot exceed ${MESSAGE_MAX_LENGTH} characters. You currently have ${charCount}.`;
          }
          addMessage('assistant', errorMsg);
          return;
        }
        
        setFormData(prev => ({ ...prev, message: value }));
        // Build review with the complete form data
        const updatedFormData = { ...formData, message: value };
        const subjectLabelReview = updatedFormData.subject ? getSubjectDisplayLabel(updatedFormData.subject as SubjectType) : '';
        
        const reviewText = currentLanguage === 'pt'
          ? `Aqui está um resumo da sua mensagem:\n\n` +
            `**Nome:** ${updatedFormData.name}\n` +
            `**Email:** ${updatedFormData.email}\n` +
            `**Assunto:** ${subjectLabelReview}\n` +
            `**Mensagem:** ${value}\n\n` +
            `Está tudo correto? Digite "sim" para enviar ou "não" para fazer alterações.`
          : `Here's a summary of your message:\n\n` +
            `**Name:** ${updatedFormData.name}\n` +
            `**Email:** ${updatedFormData.email}\n` +
            `**Subject:** ${subjectLabelReview}\n` +
            `**Message:** ${value}\n\n` +
            `Does everything look correct? Type "yes" to send or "no" to make changes.`;
        
        addMessage('assistant', reviewText);
        setStep('review');
        break;
        
      case 'review':
        const lowerValue = value.toLowerCase().trim();
        const confirmWords = ['yes', 'sim', 'y', 's', 'ok', 'confirmar', 'confirm', 'enviar', 'send'];
        const declineWords = ['no', 'não', 'nao', 'n', 'cancel', 'cancelar', 'change', 'alterar', 'edit', 'editar'];
        
        if (confirmWords.some(w => lowerValue.includes(w))) {
          handleSubmit();
        } else if (declineWords.some(w => lowerValue.includes(w))) {
          const restartMsg = currentLanguage === 'pt'
            ? "Sem problema! Vamos recomeçar. Qual é o seu nome?"
            : "No problem! Let's start over. What's your name?";
          addMessage('assistant', restartMsg);
          setFormData({});
          setStep('name');
        } else {
          const clarifyMsg = currentLanguage === 'pt'
            ? "Por favor, digite 'sim' para enviar sua mensagem ou 'não' para fazer alterações."
            : "Please type 'yes' to send your message or 'no' to make changes.";
          addMessage('assistant', clarifyMsg);
        }
        break;
    }
  }, [step, formData, currentLanguage, addMessage]);
  
  // Handle form submission
  const handleSubmit = useCallback(async () => {
    setStep('submitting');
    setIsSubmitting(true);
    
    const submittingMsg = currentLanguage === 'pt'
      ? "Enviando sua mensagem..."
      : "Sending your message...";
    addMessage('system', submittingMsg);
    
    try {
      // Validate complete form
      const validation = validateContactForm(formData as ContactFormData);
      if (!validation.success) {
        const errorMessages = validation.errors ? Object.values(validation.errors).join(', ') : 'Validation failed';
        throw new Error(errorMessages);
      }
      
      // Get reCAPTCHA token
      let recaptchaToken: string | undefined;
      if (executeRecaptcha) {
        try {
          recaptchaToken = await executeRecaptcha('contact_form');
        } catch (captchaError) {
          console.warn('reCAPTCHA failed, proceeding without token:', captchaError);
        }
      }
      
      // Submit to Formspree
      const result = await submitToFormspree(formData as ContactFormData, recaptchaToken);
      
      if (result.success) {
        // Store receipt locally
        const receipt = createSubmissionReceipt(formData as ContactFormData);
        storeReceipt(receipt);
        
        const successMsg = currentLanguage === 'pt'
          ? "✓ Sua mensagem foi enviada com sucesso! Nossa equipe responderá em breve. Você pode fechar esta janela."
          : "✓ Your message has been sent successfully! Our team will respond soon. You can close this window.";
        addMessage('assistant', successMsg);
        setStep('success');
        
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Contact form submission error:', errorMessage);
      
      const errorMsg = currentLanguage === 'pt'
        ? `Desculpe, houve um erro ao enviar sua mensagem. Por favor, tente novamente ou envie um email diretamente para contato@vocaid.io.`
        : `Sorry, there was an error sending your message. Please try again or email us directly at contact@vocaid.io.`;
      addMessage('assistant', errorMsg);
      setStep('error');
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, executeRecaptcha, currentLanguage, addMessage, onSubmitSuccess]);
  
  // Handle user input submission
  const handleInputSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    const value = inputValue.trim();
    if (!value) return;
    
    // Add user message
    addMessage('user', value);
    setInputValue('');
    
    // Process the step
    setTimeout(() => processStep(value), 300);
  }, [inputValue, addMessage, processStep]);
  
  // Handle quick action buttons
  const handleQuickAction = useCallback((action: string) => {
    addMessage('user', action);
    setTimeout(() => processStep(action), 300);
  }, [addMessage, processStep]);
  
  // Compute character count for message step
  const charCount = step === 'message' ? inputValue.length : 0;
  const charCountClass = useMemo(() => {
    if (charCount === 0) return 'text-zinc-400';
    if (charCount < MESSAGE_MIN_LENGTH) return 'text-red-500';
    if (charCount > MESSAGE_MAX_LENGTH) return 'text-red-500';
    return 'text-green-500';
  }, [charCount]);
  
  // Render quick actions for welcome step
  const renderQuickActions = () => {
    if (step !== 'welcome' || messages.length > 1) return null;
    
    const actions = currentLanguage === 'pt'
      ? [
          { label: 'Enviar mensagem', value: 'Quero enviar uma mensagem' },
          { label: 'Dúvidas sobre créditos', value: 'Como funcionam os créditos?' },
          { label: 'Idiomas suportados', value: 'Quais idiomas vocês suportam?' },
        ]
      : [
          { label: 'Send a message', value: 'I want to send a message' },
          { label: 'Questions about credits', value: 'How do credits work?' },
          { label: 'Supported languages', value: 'What languages do you support?' },
        ];
    
    return (
      <div className="flex flex-wrap gap-2 px-4 py-2">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={() => handleQuickAction(action.value)}
            className="px-3 py-1.5 text-sm bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-full transition-colors"
          >
            {action.label}
          </button>
        ))}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">
            {currentLanguage === 'pt' ? 'Assistente de Contato' : 'Contact Assistant'}
          </h2>
          <p className="text-sm text-zinc-500">
            {currentLanguage === 'pt' ? 'Pergunte ou envie uma mensagem' : 'Ask a question or send a message'}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
            aria-label={currentLanguage === 'pt' ? 'Fechar' : 'Close'}
          >
            <span className="text-xl font-light">×</span>
          </button>
        )}
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                message.type === 'user'
                  ? 'bg-purple-600 text-white'
                  : message.type === 'system'
                  ? 'bg-zinc-100 text-zinc-600 italic'
                  : 'bg-zinc-100 text-zinc-800'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Quick Actions */}
      {renderQuickActions()}
      
      {/* Input */}
      {!['submitting', 'success'].includes(step) && (
        <form onSubmit={handleInputSubmit} className="border-t border-zinc-200 p-4">
          <div className="flex flex-col gap-2">
            {step === 'message' ? (
              <>
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={currentLanguage === 'pt' ? 'Escreva sua mensagem...' : 'Write your message...'}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                  rows={4}
                  disabled={isSubmitting}
                />
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${charCountClass}`}>
                    {charCount}/{MESSAGE_MAX_LENGTH}
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmitting || charCount < MESSAGE_MIN_LENGTH || charCount > MESSAGE_MAX_LENGTH}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {currentLanguage === 'pt' ? 'Enviar' : 'Send'}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type={step === 'email' ? 'email' : 'text'}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    step === 'name' ? (currentLanguage === 'pt' ? 'Digite seu nome...' : 'Enter your name...') :
                    step === 'email' ? (currentLanguage === 'pt' ? 'Digite seu email...' : 'Enter your email...') :
                    step === 'subject' ? (currentLanguage === 'pt' ? 'Escolha uma opção (1-6)...' : 'Choose an option (1-6)...') :
                    (currentLanguage === 'pt' ? 'Digite sua resposta...' : 'Type your response...')
                  }
                  className="flex-1 px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !inputValue.trim()}
                  className="px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {currentLanguage === 'pt' ? 'Enviar' : 'Send'}
                </button>
              </div>
            )}
          </div>
        </form>
      )}
      
      {/* Success state close button */}
      {step === 'success' && onClose && (
        <div className="border-t border-zinc-200 p-4">
          <button
            onClick={onClose}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            {currentLanguage === 'pt' ? 'Fechar' : 'Close'}
          </button>
        </div>
      )}
      
      {/* Error state retry button */}
      {step === 'error' && (
        <div className="border-t border-zinc-200 p-4 flex gap-2">
          <button
            onClick={() => {
              setStep('review');
              setError(null);
              addMessage('assistant', buildReviewMessage());
            }}
            className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            {currentLanguage === 'pt' ? 'Tentar novamente' : 'Try again'}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-6 py-3 border border-zinc-300 text-zinc-700 rounded-xl font-medium hover:bg-zinc-50 transition-colors"
            >
              {currentLanguage === 'pt' ? 'Fechar' : 'Close'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ContactAssistant;
