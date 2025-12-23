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
import apiService from 'services/APIService'

interface DemoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const DemoModal: React.FC<DemoModalProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation()
  
  const useCaseOptions = t('landing.demo.useCaseOptions', { returnObjects: true }) as string[]
  const teamSizeOptions = t('landing.demo.teamSizeOptions', { returnObjects: true }) as string[]
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    teamSize: '',
    useCase: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = t('landing.demo.validation.nameRequired')
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('landing.demo.validation.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('landing.demo.validation.emailInvalid')
    }
    
    if (!formData.company.trim()) {
      newErrors.company = t('landing.demo.validation.companyRequired')
    }
    
    if (!formData.teamSize) {
      newErrors.teamSize = t('landing.demo.validation.teamSizeRequired')
    }
    
    if (!formData.useCase) {
      newErrors.useCase = t('landing.demo.validation.useCaseRequired')
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      await apiService.submitDemoRequest({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        teamSize: formData.teamSize || undefined,
        useCase: formData.useCase || undefined,
      })
      
      setIsSubmitted(true)
      
      // Reset after showing success
      setTimeout(() => {
        setIsSubmitted(false)
        setFormData({
          name: '',
          email: '',
          company: '',
          teamSize: '',
          useCase: '',
        })
        onOpenChange(false)
      }, 3000)
    } catch (error) {
      console.error('Demo request failed:', error)
      setErrors({ submit: t('landing.demo.validation.submitFailed') })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
            {t('landing.demo.title')}
          </DialogTitle>
          <DialogDescription className="text-zinc-600">
            {t('landing.demo.description')}
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
              {t('landing.demo.success.title')}
            </h3>
            <p className="text-zinc-600">
              {t('landing.demo.success.message')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label
                htmlFor="demo-name"
                className="block text-sm font-medium text-zinc-700 mb-1"
              >
                {t('landing.demo.labels.fullName')}
              </label>
              <Input
                id="demo-name"
                type="text"
                placeholder={t('landing.demo.placeholders.fullName')}
                value={formData.name}
                onChange={handleChange('name')}
                className={errors.name ? 'border-red-300' : ''}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="demo-email"
                className="block text-sm font-medium text-zinc-700 mb-1"
              >
                {t('landing.demo.labels.workEmail')}
              </label>
              <Input
                id="demo-email"
                type="email"
                placeholder={t('landing.demo.placeholders.workEmail')}
                value={formData.email}
                onChange={handleChange('email')}
                className={errors.email ? 'border-red-300' : ''}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="demo-company"
                className="block text-sm font-medium text-zinc-700 mb-1"
              >
                {t('landing.demo.labels.company')}
              </label>
              <Input
                id="demo-company"
                type="text"
                placeholder={t('landing.demo.placeholders.company')}
                value={formData.company}
                onChange={handleChange('company')}
                className={errors.company ? 'border-red-300' : ''}
              />
              {errors.company && (
                <p className="mt-1 text-xs text-red-600">{errors.company}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="demo-team-size"
                className="block text-sm font-medium text-zinc-700 mb-1"
              >
                {t('landing.demo.labels.teamSize')}
              </label>
              <select
                id="demo-team-size"
                value={formData.teamSize}
                onChange={handleChange('teamSize')}
                className={`w-full h-10 px-3 rounded-md border bg-white text-sm ${
                  errors.teamSize ? 'border-red-300' : 'border-zinc-300'
                } focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent`}
              >
                <option value="">{t('landing.demo.placeholders.teamSize')}</option>
                {teamSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.teamSize && (
                <p className="mt-1 text-xs text-red-600">{errors.teamSize}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="demo-use-case"
                className="block text-sm font-medium text-zinc-700 mb-1"
              >
                {t('landing.demo.labels.useCase')}
              </label>
              <select
                id="demo-use-case"
                value={formData.useCase}
                onChange={handleChange('useCase')}
                className={`w-full h-10 px-3 rounded-md border bg-white text-sm ${
                  errors.useCase ? 'border-red-300' : 'border-zinc-300'
                } focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent`}
              >
                <option value="">{t('landing.demo.placeholders.useCase')}</option>
                {useCaseOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.useCase && (
                <p className="mt-1 text-xs text-red-600">{errors.useCase}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-6"
            >
              {isSubmitting ? t('common.processing') : t('landing.demo.submitButton')}
            </Button>

            <p className="text-xs text-zinc-500 text-center mt-4">
              {t('landing.demo.disclaimer')}
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default DemoModal
