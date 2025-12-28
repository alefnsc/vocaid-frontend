'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from 'components/ui/dialog'
import { Button } from 'components/ui/button'
import { Input } from 'components/ui/input'

const FORMSPREE_FORM_ID = process.env.REACT_APP_FORMSPREE_ID || 'mqaregzo'
const FORMSPREE_ENDPOINT = `https://formspree.io/f/${FORMSPREE_FORM_ID}`

export type WaitlistModule = 'recruiter_platform' | 'employee_hub'

interface WaitlistModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedModule?: WaitlistModule
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({
  open,
  onOpenChange,
  preselectedModule,
}) => {
  const { t } = useTranslation()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    module: preselectedModule || '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update module when preselectedModule changes
  React.useEffect(() => {
    if (preselectedModule) {
      setFormData((prev) => ({ ...prev, module: preselectedModule }))
    }
  }, [preselectedModule])

  const moduleOptions = [
    { value: 'recruiter_platform', label: t('landing.waitlist.modules.recruiter') },
    { value: 'employee_hub', label: t('landing.waitlist.modules.hr') },
    { value: 'both', label: t('landing.waitlist.modules.both') },
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = t('landing.waitlist.validation.nameRequired')
    }

    if (!formData.email.trim()) {
      newErrors.email = t('landing.waitlist.validation.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('landing.waitlist.validation.emailInvalid')
    }

    if (!formData.module) {
      newErrors.module = t('landing.waitlist.validation.moduleRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const moduleLabel = moduleOptions.find((o) => o.value === formData.module)?.label || formData.module

      const payload = {
        name: formData.name,
        email: formData.email,
        company: formData.company || 'Not provided',
        module: moduleLabel,
        _subject: `[Waitlist] ${moduleLabel} - ${formData.email}`,
      }

      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Submission failed')
      }

      setIsSubmitted(true)

      // Reset after showing success
      setTimeout(() => {
        setIsSubmitted(false)
        setFormData({
          name: '',
          email: '',
          company: '',
          module: '',
        })
        onOpenChange(false)
      }, 3000)
    } catch (error) {
      console.error('Waitlist submission failed:', error)
      setErrors({ submit: t('landing.waitlist.validation.submitFailed') })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: '' }))
      }
    }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-zinc-900">
            {t('landing.waitlist.title')}
          </DialogTitle>
          <DialogDescription className="text-zinc-600">
            {t('landing.waitlist.description')}
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              {t('landing.waitlist.success.title')}
            </h3>
            <p className="text-zinc-600">{t('landing.waitlist.success.message')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label
                htmlFor="waitlist-name"
                className="block text-sm font-medium text-zinc-700 mb-1"
              >
                {t('landing.waitlist.labels.fullName')}
              </label>
              <Input
                id="waitlist-name"
                type="text"
                placeholder={t('landing.waitlist.placeholders.fullName')}
                value={formData.name}
                onChange={handleChange('name')}
                className={errors.name ? 'border-red-300' : ''}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label
                htmlFor="waitlist-email"
                className="block text-sm font-medium text-zinc-700 mb-1"
              >
                {t('landing.waitlist.labels.email')}
              </label>
              <Input
                id="waitlist-email"
                type="email"
                placeholder={t('landing.waitlist.placeholders.email')}
                value={formData.email}
                onChange={handleChange('email')}
                className={errors.email ? 'border-red-300' : ''}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label
                htmlFor="waitlist-company"
                className="block text-sm font-medium text-zinc-700 mb-1"
              >
                {t('landing.waitlist.labels.company')}{' '}
                <span className="text-zinc-400">({t('common.optional')})</span>
              </label>
              <Input
                id="waitlist-company"
                type="text"
                placeholder={t('landing.waitlist.placeholders.company')}
                value={formData.company}
                onChange={handleChange('company')}
              />
            </div>

            <div>
              <label
                htmlFor="waitlist-module"
                className="block text-sm font-medium text-zinc-700 mb-1"
              >
                {t('landing.waitlist.labels.module')}
              </label>
              <select
                id="waitlist-module"
                value={formData.module}
                onChange={handleChange('module')}
                className={`w-full h-10 px-3 rounded-md border bg-white text-sm ${
                  errors.module ? 'border-red-300' : 'border-zinc-300'
                } focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent`}
              >
                <option value="">{t('landing.waitlist.placeholders.module')}</option>
                {moduleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.module && <p className="mt-1 text-xs text-red-600">{errors.module}</p>}
            </div>

            {errors.submit && (
              <p className="text-sm text-red-600 text-center">{errors.submit}</p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-6"
            >
              {isSubmitting ? t('common.processing') : t('landing.waitlist.submitButton')}
            </Button>

            <p className="text-xs text-zinc-500 text-center mt-4">
              {t('landing.waitlist.disclaimer')}
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default WaitlistModal
