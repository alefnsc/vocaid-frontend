/**
 * Contact Form Schema
 * Zod validation for contact assistant form data
 * Matches Formspree payload structure
 */

import { z } from 'zod';

// Subject options matching the original Contact page
// displayLabel is the human-readable text for Formspree email subject
export const SUBJECT_OPTIONS = [
  { value: 'general', labelKey: 'contact.form.subjects.general', displayLabel: 'General Inquiry' },
  { value: 'support', labelKey: 'contact.form.subjects.support', displayLabel: 'Technical Support' },
  { value: 'billing', labelKey: 'contact.form.subjects.billing', displayLabel: 'Billing Question' },
  { value: 'feedback', labelKey: 'contact.form.subjects.feedback', displayLabel: 'Feedback' },
  { value: 'partnership', labelKey: 'contact.form.subjects.partnership', displayLabel: 'Partnership Opportunity' },
  { value: 'other', labelKey: 'contact.form.subjects.other', displayLabel: 'Other' },
] as const;

export type SubjectType = typeof SUBJECT_OPTIONS[number]['value'];

// Get display label for a subject value
export function getSubjectDisplayLabel(value: SubjectType): string {
  const option = SUBJECT_OPTIONS.find(opt => opt.value === value);
  return option?.displayLabel || value;
}

// Validation constants matching original Contact page
export const MESSAGE_MIN_LENGTH = 50;
export const MESSAGE_MAX_LENGTH = 250;

// Zod schema for contact form
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .transform((val) => val.trim()),
  
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .transform((val) => val.trim().toLowerCase()),
  
  subject: z.enum(['general', 'support', 'billing', 'feedback', 'partnership', 'other'], {
    errorMap: () => ({ message: 'Please select a subject' }),
  }),
  
  message: z
    .string()
    .min(MESSAGE_MIN_LENGTH, `Message must be at least ${MESSAGE_MIN_LENGTH} characters`)
    .max(MESSAGE_MAX_LENGTH, `Message must be less than ${MESSAGE_MAX_LENGTH} characters`)
    .transform((val) => val.trim())
    // Strip HTML tags for security
    .transform((val) => val.replace(/<[^>]*>/g, '')),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Partial schema for step-by-step validation
export const nameSchema = contactFormSchema.pick({ name: true });
export const emailSchema = contactFormSchema.pick({ email: true });
export const subjectSchema = contactFormSchema.pick({ subject: true });
export const messageSchema = contactFormSchema.pick({ message: true });

// Validate a single field
export function validateField(field: keyof ContactFormData, value: string): string | null {
  try {
    switch (field) {
      case 'name':
        nameSchema.parse({ name: value });
        break;
      case 'email':
        emailSchema.parse({ email: value });
        break;
      case 'subject':
        subjectSchema.parse({ subject: value });
        break;
      case 'message':
        messageSchema.parse({ message: value });
        break;
    }
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || 'Invalid input';
    }
    return 'Validation error';
  }
}

// Validate full form
export function validateContactForm(data: Partial<ContactFormData>): {
  success: boolean;
  data?: ContactFormData;
  errors?: Record<string, string>;
} {
  const result = contactFormSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const field = err.path[0] as string;
    if (!errors[field]) {
      errors[field] = err.message;
    }
  });
  
  return { success: false, errors };
}
