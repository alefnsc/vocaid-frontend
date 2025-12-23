'use client'

import { Target, Clock, UserCheck, BrainCircuit, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type BodyCopyProps = {
  isMobile: boolean
}

const featureIcons = [Target, BrainCircuit, Clock, UserCheck]
const featureKeys = ['masterInterview', 'tailoredRecommendations', 'realtimeFeedback', 'comprehensiveResults']

const BodyCopy = ({ isMobile }: BodyCopyProps) => {
  const { t } = useTranslation()
  
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg sm:text-xl font-semibold text-zinc-900">{t('bodyCopy.howItWorks')}</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {featureKeys.map((key, index) => {
          const Icon = featureIcons[index]
          return (
            <div 
              key={key} 
              className="p-3 sm:p-4 bg-white border border-zinc-200 rounded-xl flex flex-col items-center text-center"
            >
              <div className="inline-flex p-2 sm:p-3 bg-purple-100 rounded-xl mb-2 sm:mb-3">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-zinc-900 text-xs sm:text-sm mb-1">
                {t(`bodyCopy.features.${key}.title`)}
              </h3>
              <p className="text-xs text-zinc-500">
                {t(`bodyCopy.features.${key}.description`)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BodyCopy
