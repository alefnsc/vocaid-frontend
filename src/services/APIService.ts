import { RetellWebClient } from "retell-client-js-sdk";
import { config } from "../lib/config";

// Note: This service still requires backend API for Retell interview functionality
// Backend is NOT needed for: Authentication (Clerk), Credits (Clerk metadata), Payments (MercadoPago)
// Backend IS needed for: Interview calls (Retell API proxy), Feedback generation

// Backend URL from environment config
const BACKEND_URL = config.backendUrl;

// Get headers with optional user authentication
const getHeaders = (userId?: string): Record<string, string> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Required for ngrok free tier
    };
    
    if (userId) {
        headers['x-user-id'] = userId;
    }
    
    return headers;
};

interface RegisterCallResponse {
    call_id: string;
    access_token: string;
    status: string;
    message: string;
}

interface Metadata {
    first_name: string;
    job_title: string;
    company_name: string;
    job_description: string;
    interviewee_cv: string;
}

interface MainInterface {
    metadata: Metadata;
    userId?: string; // User ID for authentication
}

interface UserInfo {
    id: string;
    email: string;
    name: string;
    username: string;
    level: string;
    followers: number;
    followings: number;
    github: string;
    instagram: string;
    linkedin: string;
    role: string[];
    imageUrl: string | null;
    lastLogin: string | null;
    isDisabled: boolean;
    isPublicEmail: boolean;
    location: string | null;
}

interface UserInfoResponse {
    status: string;
    message: string;
    user: UserInfo;
}

// Dashboard Types
export interface DashboardStats {
    totalInterviews: number;
    completedInterviews: number;
    averageScore: number;
    totalSpent: number;
    creditsRemaining: number;
    scoreChange: number; // Percentage change from previous period
    interviewsThisMonth: number;
}

export interface InterviewSummary {
    id: string;
    retellCallId: string;
    jobTitle: string;      // Backend field name
    companyName: string;   // Backend field name
    createdAt: string;
    callDuration: number | null; // in milliseconds from backend
    score: number | null;  // Backend field name
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    // Aliases for backward compatibility
    position?: string;
    company?: string;
    duration?: number;
    overallScore?: number | null;
}

export interface InterviewDetail extends InterviewSummary {
    jobDescription?: string;
    resumeData?: string | null;
    resumeFileName?: string | null;
    resumeMimeType?: string | null;
    feedbackPdf?: string | null;
    feedbackText?: string | null;
    startedAt?: string | null;
    endedAt?: string | null;
    feedback: {
        overallScore: number;
        contentScore: number;
        communicationScore: number;
        confidenceScore: number;
        technicalScore: number;
        summary: string;
        strengths: string[];
        improvements: string[];
        recommendations: string[];
    } | null;
    transcript: string | null;
    resumeUrl: string | null;
}

export interface PaymentHistoryItem {
    id: string;
    packageId?: string;
    packageName: string;
    creditsAmount: number;
    amountUSD: number;
    amountBRL: number;
    status: string;
    statusDetail?: string;
    paidAt?: string;
    createdAt: string;
}

export interface ScoreDataPoint {
    date: string;
    score: number;
    interviewId: string;
}

export interface SpendingDataPoint {
    month: string;
    amount: number;
}

export interface CreateInterviewData {
    jobTitle: string;
    companyName: string;
    jobDescription: string;
    resumeData?: string;
    resumeFileName?: string;
    resumeMimeType?: string;
}

export interface CreatedInterview {
    id: string;
    userId: string;
    jobTitle: string;
    companyName: string;
    status: string;
    createdAt: string;
}

class APIService {
    private retellWebClient: RetellWebClient;

    constructor() {
        this.retellWebClient = new RetellWebClient();
    }

    initialize(eventHandlers: { [key: string]: (...args: any[]) => void }) {
        Object.keys(eventHandlers).forEach(event => {
            this.retellWebClient.on(event, eventHandlers[event]);
        });
    }

    /**
     * Create an interview record in the database
     */
    async createInterview(userId: string, data: CreateInterviewData): Promise<CreatedInterview> {
        console.log('📝 Creating interview record:', {
            position: data.jobTitle,
            company: data.companyName,
            userId: userId ? '✅ Present' : '❌ Missing'
        });
        
        const response = await fetch(`${BACKEND_URL}/api/interviews`, {
            method: "POST",
            headers: getHeaders(userId),
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            console.error('❌ Interview creation failed:', response.status);
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error creating interview: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Interview created:', {
            interview_id: result.data?.id,
            status: result.status
        });
        
        return result.data;
    }

    /**
     * Link Retell call ID to existing interview
     */
    async linkRetellCallToInterview(interviewId: string, retellCallId: string, userId: string): Promise<void> {
        console.log('🔗 Linking Retell call to interview:', { interviewId, retellCallId });
        
        const response = await fetch(`${BACKEND_URL}/api/interviews/${interviewId}`, {
            method: "PATCH",
            headers: getHeaders(userId),
            body: JSON.stringify({
                retellCallId,
                status: 'IN_PROGRESS',
                startedAt: new Date().toISOString()
            }),
        });
        
        if (!response.ok) {
            console.error('❌ Failed to link Retell call:', response.status);
            // Don't throw - interview can still proceed
        } else {
            console.log('✅ Retell call linked to interview');
        }
    }

    /**
     * Complete interview with results
     */
    async completeInterview(interviewId: string, userId: string, results: {
        score?: number;
        feedbackText?: string;
        callDuration?: number;
    }): Promise<void> {
        console.log('✅ Completing interview:', { interviewId });
        
        const response = await fetch(`${BACKEND_URL}/api/interviews/${interviewId}`, {
            method: "PATCH",
            headers: getHeaders(userId),
            body: JSON.stringify({
                status: 'COMPLETED',
                endedAt: new Date().toISOString(),
                ...results
            }),
        });
        
        if (!response.ok) {
            console.error('❌ Failed to complete interview:', response.status);
        } else {
            console.log('✅ Interview marked as completed');
        }
    }

    /**
     * Cancel interview (early termination)
     */
    async cancelInterview(interviewId: string, userId: string, callDuration?: number): Promise<void> {
        console.log('🚫 Cancelling interview:', { interviewId, callDuration });
        
        const response = await fetch(`${BACKEND_URL}/api/interviews/${interviewId}`, {
            method: "PATCH",
            headers: getHeaders(userId),
            body: JSON.stringify({
                status: 'CANCELLED',
                endedAt: new Date().toISOString(),
                callDuration
            }),
        });
        
        if (!response.ok) {
            console.error('❌ Failed to cancel interview:', response.status);
        } else {
            console.log('✅ Interview marked as cancelled');
        }
    }

    async registerCall(body: MainInterface): Promise<RegisterCallResponse & { interviewId?: string }> {
        // Backend endpoint required for Retell API integration
        console.log('📞 Registering call with backend:', {
            candidate: body.metadata.first_name,
            position: body.metadata.job_title,
            backend_url: BACKEND_URL,
            userId: body.userId ? '✅ Present' : '❌ Missing'
        });
        
        // Step 1: Create interview record in database
        let interviewId: string | undefined;
        if (body.userId) {
            try {
                const interview = await this.createInterview(body.userId, {
                    jobTitle: body.metadata.job_title,
                    companyName: body.metadata.company_name,
                    jobDescription: body.metadata.job_description,
                    resumeData: body.metadata.interviewee_cv,
                });
                interviewId = interview.id;
                console.log('✅ Interview record created:', interviewId);
            } catch (err) {
                console.error('⚠️ Failed to create interview record, continuing with call:', err);
                // Don't fail the call if interview creation fails
            }
        }
        
        // Step 2: Register Retell call
        const response = await fetch(`${BACKEND_URL}/register-call`, {
            method: "POST",
            headers: getHeaders(body.userId),
            body: JSON.stringify(body),
        });
        
        if (!response.ok) {
            console.error('❌ Call registration failed:', response.status);
            throw new Error(`Error: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Call registered:', {
            call_id: result.call_id,
            status: result.status
        });
        
        // Step 3: Link Retell call ID to interview record
        if (interviewId && result.call_id && body.userId) {
            try {
                await this.linkRetellCallToInterview(interviewId, result.call_id, body.userId);
            } catch (err) {
                console.error('⚠️ Failed to link Retell call to interview:', err);
                // Don't fail - interview can still proceed
            }
        }
        
        return { ...result, interviewId };
    }

    /**
     * @deprecated Use Clerk user data instead - this endpoint no longer exists
     * User information should be retrieved from:
     * - useUser() hook from @clerk/clerk-react
     * - getCurrentUser() method below for backend-synced data
     */
    async getUserInfo(_userId: string): Promise<UserInfoResponse> {
        console.warn('⚠️ getUserInfo is deprecated. Use Clerk user data or getCurrentUser() instead.');
        throw new Error('getUserInfo is deprecated. Use Clerk user data or getCurrentUser() instead.');
    }

    async getCall(call_id: string): Promise<Response> {
        // Backend endpoint required for Retell call data
        return await fetch(`${BACKEND_URL}/get-call/`+call_id, {
            headers: getHeaders()
        });
    }

    async getFeedback(call_id: string): Promise<Response> {
        // Backend endpoint required for AI-generated interview feedback
        return await fetch(`${BACKEND_URL}/get-feedback-for-interview/${call_id}`, 
            {
              method: 'GET',
              headers: getHeaders()
            });
    }

    async restoreCredit(userId: string, reason: string, callId?: string): Promise<{ status: string; newCredits?: number; message?: string }> {
        // Restore credit when interview is cancelled due to incompatibility
        console.log('💳 Requesting credit restoration:', { userId, reason, callId });
        
        const response = await fetch(`${BACKEND_URL}/restore-credit`, {
            method: 'POST',
            headers: getHeaders(userId),
            body: JSON.stringify({ userId, reason, callId })
        });
        
        if (!response.ok) {
            console.error('❌ Credit restoration failed:', response.status);
            throw new Error(`Error restoring credit: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Credit restored:', result);
        return result;
    }

    async consumeCredit(userId: string, callId?: string): Promise<{ status: string; newCredits?: number; message?: string }> {
        // Consume credit when interview starts
        console.log('💳 Consuming credit:', { userId, callId });
        
        const response = await fetch(`${BACKEND_URL}/consume-credit`, {
            method: 'POST',
            headers: getHeaders(userId),
            body: JSON.stringify({ userId, callId })
        });
        
        if (!response.ok) {
            console.error('❌ Credit consumption failed:', response.status);
            throw new Error(`Error consuming credit: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Credit consumed:', result);
        return result;
    }

    async startCall(accessToken: string, emitRawAudio = false) {
        console.log('═══════════════════════════════════════════════════════════');
        console.log('🎙️ Starting Retell call with access token');
        console.log('═══════════════════════════════════════════════════════════');
        
        if (!this.retellWebClient) {
            console.error("❌ Retell Web Client not initialized");
            return;
        }

        try {
            // Ensure audio context is resumed (required for some browsers)
            if (typeof window !== 'undefined' && 'AudioContext' in window) {
                try {
                    const audioContext = new AudioContext();
                    if (audioContext.state === 'suspended') {
                        await audioContext.resume();
                        console.log('🔊 Audio context resumed');
                    }
                    console.log('🔊 Audio context state:', audioContext.state);
                } catch (audioErr) {
                    console.warn('⚠️ Could not create audio context:', audioErr);
                }
            }

            console.log('📞 Calling retellWebClient.startCall with options:');
            console.log('   • accessToken:', accessToken.substring(0, 20) + '...');
            console.log('   • sampleRate: 24000');
            console.log('   • captureDeviceId: default');
            console.log('   • playbackDeviceId: default');
            console.log('   • emitRawAudioSamples:', emitRawAudio);
            console.log('');
            console.log('⏳ Waiting for Retell to connect...');
            console.log('   (This may take a few seconds)');

            await this.retellWebClient.startCall({
                accessToken: accessToken,
                sampleRate: 24000,
                captureDeviceId: "default",
                playbackDeviceId: "default",
                emitRawAudioSamples: emitRawAudio 
            });
            
            console.log('');
            console.log('═══════════════════════════════════════════════════════════');
            console.log('✅ Retell call started successfully');
            console.log('🔊 Audio playback should be active');
            console.log('');
            console.log('📋 If you cannot hear the agent, check:');
            console.log('   1. System volume is not muted');
            console.log('   2. Browser tab is not muted');
            console.log('   3. Retell agent has a VOICE configured');
            console.log('═══════════════════════════════════════════════════════════');
        } catch (error: any) {
            console.error('═══════════════════════════════════════════════════════════');
            console.error('❌ ERROR STARTING RETELL CALL');
            console.error('═══════════════════════════════════════════════════════════');
            console.error('   • Error:', error);
            console.error('   • Error message:', error?.message || 'Unknown');
            console.error('   • Error name:', error?.name || 'Unknown');
            console.error('');
            console.error('🔧 POSSIBLE CAUSES:');
            console.error('   1. Microphone permission denied');
            console.error('   2. Invalid access token');
            console.error('   3. Retell agent not configured properly');
            console.error('   4. Network/WebRTC connection failed');
            console.error('═══════════════════════════════════════════════════════════');
            throw error;
        }
    }
    stopCall() {
        this.retellWebClient.stopCall();

    }

    // ==========================================
    // DASHBOARD API METHODS
    // ==========================================

    /**
     * Get dashboard statistics for a user
     */
    async getDashboardStats(userId: string): Promise<DashboardStats> {
        console.log('📊 Fetching dashboard stats for user:', userId);
        
        const response = await fetch(`${BACKEND_URL}/api/users/${userId}/stats`, {
            method: 'GET',
            headers: getHeaders(userId),
        });
        
        if (!response.ok) {
            console.error('❌ Failed to fetch dashboard stats:', response.status);
            throw new Error(`Error fetching dashboard stats: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Dashboard stats received:', result);
        return result.data;
    }

    /**
     * Get list of user's interviews
     */
    async getUserInterviews(userId: string, page = 1, limit = 10): Promise<{ interviews: InterviewSummary[]; total: number; page: number; totalPages: number }> {
        console.log('📋 Fetching interviews for user:', userId);
        
        const response = await fetch(`${BACKEND_URL}/api/users/${userId}/interviews?page=${page}&limit=${limit}`, {
            method: 'GET',
            headers: getHeaders(userId),
        });
        
        if (!response.ok) {
            console.error('❌ Failed to fetch interviews:', response.status);
            throw new Error(`Error fetching interviews: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Interviews received:', result.data?.length || 0);
        return {
            interviews: result.data || [],
            total: result.pagination?.total || 0,
            page: result.pagination?.page || 1,
            totalPages: result.pagination?.totalPages || 1
        };
    }

    /**
     * Get detailed interview information by ID
     */
    async getInterviewDetails(interviewId: string, userId: string): Promise<InterviewDetail> {
        console.log('🔍 Fetching interview details:', interviewId);
        
        const response = await fetch(`${BACKEND_URL}/api/interviews/${interviewId}`, {
            method: 'GET',
            headers: getHeaders(userId),
        });
        
        if (!response.ok) {
            console.error('❌ Failed to fetch interview details:', response.status);
            throw new Error(`Error fetching interview details: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Interview details received');
        return result.data;
    }

    /**
     * Get user's payment history
     */
    async getPaymentHistory(userId: string): Promise<PaymentHistoryItem[]> {
        console.log('💰 Fetching payment history for user:', userId);
        
        const response = await fetch(`${BACKEND_URL}/api/users/${userId}/payments`, {
            method: 'GET',
            headers: getHeaders(userId),
        });
        
        if (!response.ok) {
            console.error('❌ Failed to fetch payment history:', response.status);
            throw new Error(`Error fetching payment history: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Payment history received:', result.data?.length || 0);
        return result.data || [];
    }

    /**
     * Get score evolution data for charts
     */
    async getScoreEvolution(userId: string, months = 6): Promise<ScoreDataPoint[]> {
        console.log('📈 Fetching score evolution for user:', userId);
        
        const response = await fetch(`${BACKEND_URL}/api/users/${userId}/score-evolution?months=${months}`, {
            method: 'GET',
            headers: getHeaders(userId),
        });
        
        if (!response.ok) {
            console.error('❌ Failed to fetch score evolution:', response.status);
            throw new Error(`Error fetching score evolution: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Score evolution received:', result.data?.length || 0);
        return result.data || [];
    }

    /**
     * Get spending data for charts
     */
    async getSpendingHistory(userId: string, months = 6): Promise<SpendingDataPoint[]> {
        console.log('💵 Fetching spending history for user:', userId);
        
        const response = await fetch(`${BACKEND_URL}/api/users/${userId}/spending?months=${months}`, {
            method: 'GET',
            headers: getHeaders(userId),
        });
        
        if (!response.ok) {
            console.error('❌ Failed to fetch spending history:', response.status);
            throw new Error(`Error fetching spending history: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Spending history received:', result.data?.length || 0);
        return result.data || [];
    }

    // ========================================
    // USER SYNC METHODS
    // ========================================

    /**
     * Sync user data to backend database on login
     * This ensures user exists in local database even if webhook wasn't received
     */
    async syncUser(userId: string): Promise<{ status: string; user: any; message: string }> {
        console.log('🔄 Syncing user to backend:', userId);
        
        const response = await fetch(`${BACKEND_URL}/api/users/sync`, {
            method: 'POST',
            headers: getHeaders(userId),
        });
        
        if (!response.ok) {
            console.error('❌ User sync failed:', response.status);
            throw new Error(`Error syncing user: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ User synced:', {
            status: result.status,
            message: result.message,
            userId: result.user?.id
        });
        return result;
    }

    /**
     * Validate user session and ensure user exists in database
     * Called on interview page load and critical actions
     */
    async validateUser(userId: string): Promise<{ status: string; user: any; message: string; freeTrialGranted?: boolean }> {
        console.log('🔐 Validating user session:', userId);
        
        const response = await fetch(`${BACKEND_URL}/api/users/validate`, {
            method: 'POST',
            headers: getHeaders(userId),
        });
        
        if (!response.ok) {
            console.error('❌ User validation failed:', response.status);
            throw new Error(`Error validating user: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ User validated:', {
            status: result.status,
            message: result.message,
            userId: result.user?.id,
            credits: result.user?.credits,
            freeTrialGranted: result.freeTrialGranted
        });
        return result;
    }

    /**
     * Get current user data from backend
     */
    async getCurrentUser(userId: string): Promise<{ status: string; user: any }> {
        console.log('👤 Getting current user from backend:', userId);
        
        const response = await fetch(`${BACKEND_URL}/api/users/me`, {
            method: 'GET',
            headers: getHeaders(userId),
        });
        
        if (!response.ok) {
            console.error('❌ Failed to get current user:', response.status);
            throw new Error(`Error getting user: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Current user received:', {
            id: result.user?.id,
            email: result.user?.email,
            credits: result.user?.credits
        });
        return result;
    }
}
const apiService =  new APIService();
export default apiService;