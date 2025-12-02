'use client'

import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, ValidationError } from '@formspree/react'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { DefaultLayout } from 'components/default-layout'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

const FORMSPREE_FORM_ID = process.env.REACT_APP_FORMSPREE_ID || 'mqaregzo'

// Validation constants matching Formspree settings
const MESSAGE_MIN_LENGTH = 50
const MESSAGE_MAX_LENGTH = 250

export default function Contact() {
  const navigate = useNavigate()
  const { executeRecaptcha } = useGoogleReCaptcha()
  
  // Pass the executeRecaptcha function to Formspree via the data option
  const [state, handleFormspreeSubmit] = useForm(FORMSPREE_FORM_ID, {
    data: { 'g-recaptcha-response': executeRecaptcha }
  })
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    subject: false,
    message: false
  })

  // Validation
  const messageLength = formData.message.trim().length
  const validation = useMemo(() => {
    const errors: { [key: string]: string } = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    if (!formData.subject) {
      errors.subject = 'Please select a subject'
    }
    
    if (messageLength === 0) {
      errors.message = 'Message is required'
    } else if (messageLength < MESSAGE_MIN_LENGTH) {
      errors.message = `Message must be at least ${MESSAGE_MIN_LENGTH} characters (${MESSAGE_MIN_LENGTH - messageLength} more needed)`
    } else if (messageLength > MESSAGE_MAX_LENGTH) {
      errors.message = `Message must be less than ${MESSAGE_MAX_LENGTH} characters (${messageLength - MESSAGE_MAX_LENGTH} over limit)`
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }, [formData, messageLength])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // For message, prevent typing beyond max length
    if (name === 'message' && value.length > MESSAGE_MAX_LENGTH + 10) {
      return
    }
    
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      subject: true,
      message: true
    })
    
    // If validation fails, prevent submission
    if (!validation.isValid) {
      e.preventDefault()
      return
    }
    
    // Let Formspree's handler take over
    handleFormspreeSubmit(e)
  }

  // Redirect on success
  useEffect(() => {
    if (state.succeeded) {
      const timer = setTimeout(() => {
        navigate('/contact/thank-you')
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [state.succeeded, navigate])

  // Character count color
  const getCharCountColor = () => {
    if (messageLength === 0) return 'text-gray-400'
    if (messageLength < MESSAGE_MIN_LENGTH) return 'text-amber-500'
    if (messageLength > MESSAGE_MAX_LENGTH) return 'text-red-500'
    return 'text-green-500'
  }

  const getInputBorderClass = (field: keyof typeof touched) => {
    if (!touched[field]) return 'border-gray-300'
    if (validation.errors[field]) return 'border-red-300'
    return 'border-green-300'
  }

  return (
    <DefaultLayout>
      <div className="page-container py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Contact <span className="text-voxly-purple">Us</span>
            </h1>
            <p className="text-lg text-gray-600">
              Have questions or feedback? We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              <div className="voxly-card">
                <div className="p-2 bg-purple-100 rounded-lg w-fit mb-3">
                  <svg className="w-5 h-5 text-voxly-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                <a href="mailto:support@voxly.ai" className="text-voxly-purple hover:underline">
                  support@voxly.ai
                </a>
              </div>

              <div className="voxly-card">
                <div className="p-2 bg-purple-100 rounded-lg w-fit mb-3">
                  <svg className="w-5 h-5 text-voxly-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Response Time</h3>
                <p className="text-gray-600 text-sm">We typically respond within 24-48 hours.</p>
              </div>

              <div className="voxly-card">
                <div className="p-2 bg-purple-100 rounded-lg w-fit mb-3">
                  <svg className="w-5 h-5 text-voxly-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">FAQ</h3>
                <p className="text-gray-600 text-sm">
                  Check our <a href="/about" className="text-voxly-purple hover:underline">About page</a> for common questions.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="voxly-card">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Send us a Message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('name')}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${getInputBorderClass('name')}`}
                        placeholder="Your name"
                      />
                      <ValidationError prefix="Name" field="name" errors={state.errors} />
                      {touched.name && validation.errors.name && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {validation.errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('email')}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${getInputBorderClass('email')}`}
                        placeholder="your@email.com"
                      />
                      <ValidationError prefix="Email" field="email" errors={state.errors} />
                      {touched.email && validation.errors.email && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {validation.errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('subject')}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${getInputBorderClass('subject')}`}
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing Question</option>
                      <option value="feedback">Feedback</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="other">Other</option>
                    </select>
                    <ValidationError prefix="Subject" field="subject" errors={state.errors} />
                    {touched.subject && validation.errors.subject && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validation.errors.subject}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      minLength={MESSAGE_MIN_LENGTH}
                      maxLength={MESSAGE_MAX_LENGTH + 10}
                      value={formData.message}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('message')}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none ${
                        touched.message && messageLength > 0
                          ? messageLength < MESSAGE_MIN_LENGTH
                            ? 'border-amber-300 bg-amber-50/50'
                            : messageLength > MESSAGE_MAX_LENGTH
                            ? 'border-red-300 bg-red-50/50'
                            : 'border-green-300'
                          : 'border-gray-300'
                      }`}
                      placeholder={`How can we help you? (minimum ${MESSAGE_MIN_LENGTH} characters)`}
                    />
                    <ValidationError prefix="Message" field="message" errors={state.errors} />
                    
                    {/* Character count and validation feedback */}
                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex-1">
                        {touched.message && messageLength > 0 && messageLength < MESSAGE_MIN_LENGTH && (
                          <p className="text-xs text-amber-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {MESSAGE_MIN_LENGTH - messageLength} more characters needed
                          </p>
                        )}
                        {messageLength > MESSAGE_MAX_LENGTH && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {messageLength - MESSAGE_MAX_LENGTH} characters over limit
                          </p>
                        )}
                        {messageLength >= MESSAGE_MIN_LENGTH && messageLength <= MESSAGE_MAX_LENGTH && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Message looks good!
                          </p>
                        )}
                      </div>
                      <span className={`text-xs font-medium ${getCharCountColor()}`}>
                        {messageLength}/{MESSAGE_MAX_LENGTH}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={state.submitting || !validation.isValid}
                    className="w-full btn-voxly py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {state.submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                  
                  {/* reCAPTCHA notice */}
                  <p className="text-xs text-gray-400 text-center">
                    This site is protected by reCAPTCHA and the Google{' '}
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
                      Privacy Policy
                    </a>{' '}
                    and{' '}
                    <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
                      Terms of Service
                    </a>{' '}
                    apply.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}
