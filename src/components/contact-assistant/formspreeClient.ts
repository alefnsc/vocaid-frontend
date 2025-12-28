/**
 * Formspree Client
 * Handles form submission to Formspree API
 */

import { ContactFormData, getSubjectDisplayLabel, SubjectType } from './contactSchema';

const FORMSPREE_FORM_ID = process.env.REACT_APP_FORMSPREE_ID || 'mqaregzo';
const FORMSPREE_ENDPOINT = `https://formspree.io/f/${FORMSPREE_FORM_ID}`;

export interface FormspreeResponse {
  success: boolean;
  submissionId?: string;
  error?: string;
}

export interface SubmissionReceipt {
  id: string;
  timestamp: Date;
  data: ContactFormData;
}

/**
 * Submit contact form data to Formspree
 * @param data - Validated contact form data
 * @param recaptchaToken - Optional reCAPTCHA v3 token
 * @returns Success/failure result with optional submission ID
 */
export async function submitToFormspree(
  data: ContactFormData,
  recaptchaToken?: string
): Promise<FormspreeResponse> {
  try {
    // Get human-readable subject label for email subject line
    const subjectLabel = getSubjectDisplayLabel(data.subject as SubjectType);
    
    const payload: Record<string, string> = {
      name: data.name,
      email: data.email,
      // Formspree uses _subject for email subject line (not "subject")
      _subject: `[Vocaid Contact] ${subjectLabel}`,
      // Store the category for filtering in Formspree dashboard
      category: data.subject,
      message: data.message,
    };

    // Add reCAPTCHA token if available
    if (recaptchaToken) {
      payload['g-recaptcha-response'] = recaptchaToken;
    }

    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        submissionId: result.submissionId || generateReceiptId(),
      };
    }

    // Handle error responses
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 422) {
      // Validation error from Formspree
      return {
        success: false,
        error: errorData.error || 'Please check your form data and try again.',
      };
    }
    
    if (response.status === 403) {
      // CORS or domain not allowed
      return {
        success: false,
        error: 'Form submission blocked. Please try again later.',
      };
    }

    return {
      success: false,
      error: errorData.error || 'Failed to send message. Please try again.',
    };
  } catch (error) {
    console.error('Formspree submission error:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
    };
  }
}

/**
 * Generate a local receipt ID for the submission
 */
function generateReceiptId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `VX-${timestamp}-${random}`.toUpperCase();
}

/**
 * Create a submission receipt for local storage
 */
export function createSubmissionReceipt(data: ContactFormData): SubmissionReceipt {
  return {
    id: generateReceiptId(),
    timestamp: new Date(),
    data,
  };
}

/**
 * Store submission receipt in localStorage
 */
export function storeReceipt(receipt: SubmissionReceipt): void {
  try {
    const key = `vocaid_contact_receipt_${receipt.id}`;
    localStorage.setItem(key, JSON.stringify({
      ...receipt,
      timestamp: receipt.timestamp.toISOString(),
    }));
  } catch (error) {
    console.warn('Failed to store submission receipt:', error);
  }
}

/**
 * Retrieve stored receipts
 */
export function getStoredReceipts(): SubmissionReceipt[] {
  const receipts: SubmissionReceipt[] = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('vocaid_contact_receipt_')) {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          receipts.push({
            ...parsed,
            timestamp: new Date(parsed.timestamp),
          });
        }
      }
    }
  } catch (error) {
    console.warn('Failed to retrieve receipts:', error);
  }
  
  return receipts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
