'use client'

import { Target, Clock, UserCheck, BrainCircuit, Sparkles } from 'lucide-react'

type BodyCopyProps = {
  isMobile: boolean
}

const features = [
  {
    icon: Target,
    title: 'Master Interview',
    description: 'Refine answers with AI-driven mock interviews'
  },
  {
    icon: BrainCircuit,
    title: 'Tailored Recommendations',
    description: 'Get tips based on job description and seniority'
  },
  {
    icon: Clock,
    title: 'Real-Time Feedback',
    description: 'Receive instant, constructive feedback'
  },
  {
    icon: UserCheck,
    title: 'Comprehensive Results',
    description: 'Review detailed performance and insights'
  }
]

const BodyCopy = ({ isMobile }: BodyCopyProps) => {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Sparkles className="w-5 h-5 text-voxly-purple" />
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">How It Works</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="voxly-card p-3 sm:p-4 flex flex-col items-center text-center"
          >
            <div className="inline-flex p-2 sm:p-3 bg-purple-100 rounded-xl mb-2 sm:mb-3">
              <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900 text-xs sm:text-sm mb-1">
              {feature.title}
            </h3>
            <p className="text-xs text-gray-500">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BodyCopy
