/**
 * Pricing Configuration
 * 
 * All pricing plans, features, and metadata are defined here.
 * This keeps pricing data separate from UI rendering.
 */

export type PlatformType = 'b2c' | 'b2b' | 'hr'
export type B2CToggleType = 'credits' | 'subscription'

export interface PricingPlan {
  id: string
  titleKey: string
  taglineKey: string
  featuresKey: string
  ctaKey: string
  ctaAction: 'buy' | 'subscribe' | 'waitlist' | 'sales'
  badge?: 'bestValue' | 'mostPopular' | 'save' | 'comingSoon'
  highlighted?: boolean
  comingSoon?: boolean
  price?: string // e.g. "$29", "$—", or empty for coming soon
  priceSubtext?: string // e.g. "/month", "one-time"
}

export interface PlatformPricingConfig {
  id: PlatformType
  tabLabelKey: string
  introKey: string
  noteKey?: string
  footnoteKey?: string
  plans: PricingPlan[]
}

// ============================================================================
// B2C PLANS - Personal Interview Practice
// ============================================================================

export const B2C_CREDITS_PLANS: PricingPlan[] = [
  {
    id: 'starter-credits',
    titleKey: 'pricing.b2c.credits.starter.title',
    taglineKey: 'pricing.b2c.credits.starter.tagline',
    featuresKey: 'pricing.b2c.credits.starter.features',
    ctaKey: 'pricing.b2c.credits.starter.cta',
    ctaAction: 'buy',
    price: '$—',
    priceSubtext: '',
  },
  {
    id: 'pro-credits',
    titleKey: 'pricing.b2c.credits.pro.title',
    taglineKey: 'pricing.b2c.credits.pro.tagline',
    featuresKey: 'pricing.b2c.credits.pro.features',
    ctaKey: 'pricing.b2c.credits.pro.cta',
    ctaAction: 'buy',
    badge: 'bestValue',
    highlighted: true,
    price: '$—',
    priceSubtext: '',
  },
  {
    id: 'max-credits',
    titleKey: 'pricing.b2c.credits.max.title',
    taglineKey: 'pricing.b2c.credits.max.tagline',
    featuresKey: 'pricing.b2c.credits.max.features',
    ctaKey: 'pricing.b2c.credits.max.cta',
    ctaAction: 'buy',
    price: '$—',
    priceSubtext: '',
  },
]

export const B2C_SUBSCRIPTION_PLANS: PricingPlan[] = [
  {
    id: 'monthly',
    titleKey: 'pricing.b2c.subscription.monthly.title',
    taglineKey: 'pricing.b2c.subscription.monthly.tagline',
    featuresKey: 'pricing.b2c.subscription.monthly.features',
    ctaKey: 'pricing.b2c.subscription.monthly.cta',
    ctaAction: 'subscribe',
    price: '$—',
    priceSubtext: '/month',
  },
  {
    id: 'plus',
    titleKey: 'pricing.b2c.subscription.plus.title',
    taglineKey: 'pricing.b2c.subscription.plus.tagline',
    featuresKey: 'pricing.b2c.subscription.plus.features',
    ctaKey: 'pricing.b2c.subscription.plus.cta',
    ctaAction: 'subscribe',
    badge: 'mostPopular',
    highlighted: true,
    price: '$—',
    priceSubtext: '/month',
  },
  {
    id: 'annual',
    titleKey: 'pricing.b2c.subscription.annual.title',
    taglineKey: 'pricing.b2c.subscription.annual.tagline',
    featuresKey: 'pricing.b2c.subscription.annual.features',
    ctaKey: 'pricing.b2c.subscription.annual.cta',
    ctaAction: 'subscribe',
    badge: 'save',
    price: '$—',
    priceSubtext: '/year',
  },
]

// ============================================================================
// B2B PLANS - Recruiter Platform
// ============================================================================

export const B2B_PLANS: PricingPlan[] = [
  {
    id: 'b2b-starter',
    titleKey: 'pricing.b2b.starter.title',
    taglineKey: 'pricing.b2b.starter.tagline',
    featuresKey: 'pricing.b2b.starter.features',
    ctaKey: 'pricing.b2b.starter.cta',
    ctaAction: 'waitlist',
    badge: 'comingSoon',
    comingSoon: true,
  },
  {
    id: 'b2b-growth',
    titleKey: 'pricing.b2b.growth.title',
    taglineKey: 'pricing.b2b.growth.tagline',
    featuresKey: 'pricing.b2b.growth.features',
    ctaKey: 'pricing.b2b.growth.cta',
    ctaAction: 'waitlist',
    badge: 'mostPopular',
    highlighted: true,
    comingSoon: true,
  },
  {
    id: 'b2b-enterprise',
    titleKey: 'pricing.b2b.enterprise.title',
    taglineKey: 'pricing.b2b.enterprise.tagline',
    featuresKey: 'pricing.b2b.enterprise.features',
    ctaKey: 'pricing.b2b.enterprise.cta',
    ctaAction: 'sales',
    badge: 'comingSoon',
    comingSoon: true,
  },
]

// ============================================================================
// HR PLANS - Employee Hub
// ============================================================================

export const HR_PLANS: PricingPlan[] = [
  {
    id: 'hr-starter',
    titleKey: 'pricing.hr.starter.title',
    taglineKey: 'pricing.hr.starter.tagline',
    featuresKey: 'pricing.hr.starter.features',
    ctaKey: 'pricing.hr.starter.cta',
    ctaAction: 'waitlist',
    badge: 'comingSoon',
    comingSoon: true,
  },
  {
    id: 'hr-growth',
    titleKey: 'pricing.hr.growth.title',
    taglineKey: 'pricing.hr.growth.tagline',
    featuresKey: 'pricing.hr.growth.features',
    ctaKey: 'pricing.hr.growth.cta',
    ctaAction: 'waitlist',
    badge: 'comingSoon',
    comingSoon: true,
  },
  {
    id: 'hr-enterprise',
    titleKey: 'pricing.hr.enterprise.title',
    taglineKey: 'pricing.hr.enterprise.tagline',
    featuresKey: 'pricing.hr.enterprise.features',
    ctaKey: 'pricing.hr.enterprise.cta',
    ctaAction: 'sales',
    badge: 'comingSoon',
    comingSoon: true,
  },
]

// ============================================================================
// PLATFORM CONFIGURATIONS
// ============================================================================

export const PLATFORM_CONFIGS: Record<PlatformType, {
  tabLabelKey: string
  introKey: string
  noteKey?: string
}> = {
  b2c: {
    tabLabelKey: 'pricing.tabs.b2c',
    introKey: 'pricing.b2c.intro',
  },
  b2b: {
    tabLabelKey: 'pricing.tabs.b2b',
    introKey: 'pricing.b2b.intro',
    noteKey: 'pricing.b2b.note',
  },
  hr: {
    tabLabelKey: 'pricing.tabs.hr',
    introKey: 'pricing.hr.intro',
    noteKey: 'pricing.hr.note',
  },
}

export const B2C_TOGGLE_CONFIG = {
  credits: {
    labelKey: 'pricing.b2c.toggle.credits',
    helperKey: 'pricing.b2c.toggle.creditsHelper',
    footnoteKey: 'pricing.b2c.footnote.credits',
  },
  subscription: {
    labelKey: 'pricing.b2c.toggle.subscription',
    helperKey: 'pricing.b2c.toggle.subscriptionHelper',
    footnoteKey: 'pricing.b2c.footnote.subscription',
  },
}

// Badge display configuration
export const BADGE_CONFIG: Record<string, { labelKey: string; className: string }> = {
  bestValue: {
    labelKey: 'pricing.badges.bestValue',
    className: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  mostPopular: {
    labelKey: 'pricing.badges.mostPopular',
    className: 'bg-purple-600 text-white border-purple-600',
  },
  save: {
    labelKey: 'pricing.badges.save',
    className: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  comingSoon: {
    labelKey: 'pricing.badges.comingSoon',
    className: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  },
}
