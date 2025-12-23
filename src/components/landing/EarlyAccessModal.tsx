'use client'

import React, { useState, useEffect } from 'react'
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

export type ModuleInterest = 'recruiter_platform' | 'employee_hub'

interface EarlyAccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedModule?: ModuleInterest
}

export const EarlyAccessModal: React.FC<EarlyAccessModalProps> = ({
  open,
  onOpenChange,
  preselectedModule,
}) => {
  const { t } = useTranslation()
  
  const moduleOptions: { value: ModuleInterest; label: string; description: string }[] = [
    {
      value: 'recruiter_platform',
      label: t('landing.earlyAccess.modules.recruiter.label'),
      description: t('landing.earlyAccess.modules.recruiter.description'),
    },
    {
      value: 'employee_hub',
      label: t('landing.earlyAccess.modules.employeeHub.label'),
      description: t('landing.earlyAccess.modules.employeeHub.description'),
    },
  ]
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    selectedModules: [] as ModuleInterest[],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Pre-select module if provided
  useEffect(() => {
    if (preselectedModule && open) {
      setFormData((prev) => ({
        ...prev,
        selectedModules: prev.selectedModules.includes(preselectedModule)
          ? prev.selectedModules
          : [...prev.selectedModules, preselectedModule],
      }))
    }
  }, [preselectedModule, open])

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        name: '',
        email: '',
        company: '',
        selectedModules: [],
      })
      setErrors({})
      setIsSubmitted(false)
    }
  }, [open])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = t('landing.earlyAccess.validation.nameRequired')
    }

    if (!formData.email.trim()) {
      newErrors.email = t('landing.earlyAccess.validation.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('landing.earlyAccess.validation.emailInvalid')
    }

    if (formData.selectedModules.length === 0) {
      newErrors.modules = t('landing.earlyAccess.validation.moduleRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      await apiService.submitEarlyAccess({
        name: formData.name,
        email: formData.email,
        company: formData.company || undefined,
        interestedModules: formData.selectedModules,
      })

      setIsSubmitted(true)

      // Reset after showing success
      setTimeout(() => {
        onOpenChange(false)
      }, 3000)
    } catch (error) {
      console.error('Early access request failed:', error)
      setErrors({ submit: t('landing.earlyAccess.validation.submitFailed') })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleModuleToggle = (module: ModuleInterest) => {
    setFormData((prev) => ({
      ...prev,
      selectedModules: prev.selectedModules.includes(module)
        ? prev.selectedModules.filter((m) => m !== module)
        : [...prev.selectedModules, module],
    }))
    if (errors.modules) {
      setErrors((prev) => ({ ...prev, modules: '' }))
    }
  }

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
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
            {t('landing.earlyAccess.title')}
          </DialogTitle>
          <DialogDescription className="text-zinc-600">
            {t('landing.earlyAccess.description')}
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
              {t('landing.earlyAccess.success.title')}
            </h3>
            <p className="text-zinc-600">
              {t('landing.earlyAccess.success.message', {
                modules: formData.selectedModules
                  .map((m) => moduleOptions.find((o) => o.value === m)?.label)
                  .join(` ${t('common.and')} `)
              })}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label
                htmlFor="ea-name"
                className="block text-sm font-medium text-zinc-700 mb-1"
              >
                {t('landing.earlyAccess.labels.name')}
              </label>
              <Input
                id="ea-name"
                type="text"
                placeholder={t('landing.earlyAccess.placeholders.name')}
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
                htmlFor="ea-email"
                className="block text-sm font-medium text-zinc-700 mb-1"
              >
                {t('landing.earlyAccess.labels.email')}
              </label>
              <Input
                id="ea-email"
                type="email"
                placeholder={t('landing.earlyAccess.placeholders.email')}
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
                htmlFor="ea-company"
                className="block text-sm font-medium text-zinc-700 mb-1"
              >
                {t('landing.earlyAccess.labels.company')}{' '}
                <span className="text-zinc-400 font-normal">({t('common.optional')})</span>
              </label>
              <Input
                id="ea-company"
                type="text"
                placeholder={t('landing.earlyAccess.placeholders.company')}
                value={formData.company}
                onChange={handleChange('company')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                {t('landing.earlyAccess.labels.interestedIn')}
              </label>
              <div className="space-y-2">
                {moduleOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleModuleToggle(option.value)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      formData.selectedModules.includes(option.value)
                        ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600'
                        : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          formData.selectedModules.includes(option.value)
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-zinc-300'
                        }`}
                      >
                        {formData.selectedModules.includes(option.value) && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900">
                          {option.label}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {errors.modules && (
                <p className="mt-1 text-xs text-red-600">{errors.modules}</p>
              )}
            </div>

            {errors.submit && (
              <p className="text-sm text-red-600 text-center">
                {errors.submit}
              </p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-6"
            >
              {isSubmitting ? t('common.submitting') : t('landing.earlyAccess.submitButton')}
            </Button>

            <p className="text-xs text-zinc-500 text-center mt-4">
              {t('landing.earlyAccess.disclaimer')}
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default EarlyAccessModal
