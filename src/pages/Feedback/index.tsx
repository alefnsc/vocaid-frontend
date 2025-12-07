'use client';
import jsPDF from "jspdf";
import { useLocation, useNavigate } from 'react-router-dom';
import { DefaultLayout } from 'components/default-layout'
import { useEffect, useState, useCallback, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import APIService from "services/APIService";
import ScoreDisplay from 'components/score-display';
import { Card } from "components/ui/card";
import { Button } from "components/ui/button";
import { Separator } from "components/ui/separator";
import TextBox from "components/ui/text-box";
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Download, RotateCcw, Home } from 'lucide-react';
import InterviewBreadcrumbs from 'components/interview-breadcrumbs';
import { useInterviewFlow } from 'hooks/use-interview-flow';
import PurpleButton from 'components/ui/purple-button';

const Feedback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const state = location.state;
  const { setStage, resetFlow } = useInterviewFlow();

  // Set stage to feedback on mount and invalidate dashboard cache
  useEffect(() => {
    setStage('feedback');
    // Invalidate interview caches so dashboard shows updated data
    if (user?.id) {
      APIService.invalidateInterviewCaches(user.id);
    }
  }, [setStage, user?.id]);

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [summary, setSummary] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0); // 0-100 percentage
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 3000; // 3 seconds

  // Prevent double fetching
  const hasFetched = useRef(false);

  const fetchFeedback = useCallback(async (retry = 0) => {
    if (!state?.call_id) {
      setError('No interview data found. Please complete an interview first.');
      setIsLoading(false);
      return;
    }

    // Only set hasFetched on first attempt
    if (retry === 0) {
      if (hasFetched.current) return;
      hasFetched.current = true;
    }

    try {
      setIsLoading(true);
      setError(null);
      setRetryCount(retry);

      const response = await APIService.getFeedback(state.call_id);

      // Check content type to avoid parsing HTML as JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Received non-JSON response:', contentType);
        throw new Error('Server returned an invalid response. The backend may not be running or accessible.');
      }

      const json = await response.json();

      // Handle transcript not ready - retry with delay
      if (!response.ok) {
        if (json.message?.includes('transcript not available') && retry < MAX_RETRIES) {
          console.log(`⏳ Transcript not ready, retrying in ${RETRY_DELAY / 1000}s... (attempt ${retry + 1}/${MAX_RETRIES})`);
          setTimeout(() => fetchFeedback(retry + 1), RETRY_DELAY);
          return;
        }
        throw new Error(json.message || `Error: ${json.status}`);
      }

      // Set metadata from state
      setCandidateName(state?.metadata?.first_name || 'Candidate');
      setJobDescription(state?.metadata?.job_description || 'No job description available');

      // Set feedback data - handle different response structures
      if (json.feedback) {
        setSummary(json.feedback.detailed_feedback || json.summary || '');
        // Convert 1-5 rating to 0-100 percentage for display
        const percentageScore = json.feedback.overall_rating ? json.feedback.overall_rating * 20 : 0;
        setScore(percentageScore);

        // Format feedback from structured data
        const feedbackParts = [];
        if (json.feedback.strengths?.length) {
          feedbackParts.push('## Strengths\n' + json.feedback.strengths.map(s => `- ${s}`).join('\n'));
        }
        if (json.feedback.areas_for_improvement?.length) {
          feedbackParts.push('## Areas for Improvement\n' + json.feedback.areas_for_improvement.map(a => `- ${a}`).join('\n'));
        }
        if (json.feedback.recommendations?.length) {
          feedbackParts.push('## Recommendations\n' + json.feedback.recommendations.map(r => `- ${r}`).join('\n'));
        }
        setFeedback(feedbackParts.join('\n\n') || json.feedback.detailed_feedback || '');
        
        // Save score to interview record if interview_id is available
        const overallScore = percentageScore > 0 ? percentageScore : null;
        if (state?.interview_id && user?.id && overallScore !== null) {
          try {
            await APIService.completeInterview(state.interview_id, user.id, {
              score: overallScore,
              feedbackText: feedbackParts.join('\n\n') || json.feedback.detailed_feedback || ''
            });
            console.log('✅ Interview score saved:', overallScore);
          } catch (saveError) {
            console.error('⚠️ Failed to save interview score:', saveError);
          }
        }
      } else {
        setSummary(json.summary || 'No summary available');
        setFeedback(json.feedback_text || 'No detailed feedback available');
        // Convert 1-5 rating to 0-100 percentage for display
        const percentageScore = json.score ? json.score * 20 : 0;
        setScore(percentageScore);
        
        // Save score for legacy response format
        const legacyScore = percentageScore > 0 ? percentageScore : null;
        if (state?.interview_id && user?.id && legacyScore !== null) {
          try {
            await APIService.completeInterview(state.interview_id, user.id, {
              score: legacyScore,
              feedbackText: json.feedback_text || ''
            });
            console.log('✅ Interview score saved (legacy):', legacyScore);
          } catch (saveError) {
            console.error('⚠️ Failed to save interview score:', saveError);
          }
        }
      }

      setRetryCount(0); // Reset on success
    } catch (err: any) {
      console.error("Failed to fetch feedback:", err);
      setError(err.message || 'Failed to load feedback. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [state, user]);

  useEffect(() => {
    fetchFeedback();

    // Cleanup function
    return () => {
      hasFetched.current = false;
    };
  }, [fetchFeedback]);

  const handleDownloadTranscript = useCallback(() => {
    const doc = new jsPDF();
    let y = 20;
    const pageHeight = 280;
    const margin = 15;
    const maxWidth = doc.internal.pageSize.getWidth() - (margin * 2);
    const lineHeight = 6;

    const initializePage = () => {
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), "F");
    };

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight) {
        doc.addPage();
        initializePage();
        y = 20;
      }
    };

    const addText = (text: string, fontSize: number, isBold: boolean = false, color: number[] = [55, 65, 81]) => {
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.setFontSize(fontSize);
      doc.setTextColor(color[0], color[1], color[2]);
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        checkPageBreak(lineHeight);
        doc.text(line, margin, y);
        y += lineHeight;
      });
    };

    const addSection = (title: string, content: string) => {
      checkPageBreak(20);
      // Section title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(88, 28, 135); // purple-800
      doc.text(title, margin, y);
      y += 8;
      
      // Section content - clean up markdown but preserve readability
      const cleanContent = content
        .replace(/^##?\s*/gm, '') // Remove markdown headers
        .replace(/^\*\*(.+?)\*\*/gm, '$1') // Remove bold markers
        .replace(/^\*(.+?)\*/gm, '$1') // Remove italic markers
        .trim();
      
      addText(cleanContent, 11, false, [55, 65, 81]);
      y += 6;
    };

    initializePage();

    // Title
    doc.setTextColor(88, 28, 135); // purple-800
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Interview Feedback Report", margin, y);
    y += 12;

    // Candidate info
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text(`Candidate: ${candidateName}`, margin, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.text(`Score: ${score}%`, margin, y);
    y += 12;

    // Summary section
    if (summary) {
      addSection("Summary", summary);
    }

    // Feedback section
    if (feedback) {
      addSection("Detailed Feedback", feedback);
    }

    // Job Description section
    if (jobDescription) {
      addSection("Job Description", jobDescription);
    }

    doc.save(`${candidateName.replace(/\s+/g, '_')}_feedback_report.pdf`);
  }, [candidateName, score, summary, feedback, jobDescription]);

  const handleRetryInterview = useCallback(() => {
    resetFlow();
    navigate('/interview-setup');
  }, [navigate, resetFlow]);

  const handleBackToDashboard = useCallback(() => {
    resetFlow();
    navigate('/');
  }, [navigate, resetFlow]);

  const handleScoreChange = useCallback((newScore: number) => {
    // Score change handler for ScoreDisplay component
    console.log('Score updated:', newScore);
  }, []);

  const getResultText = useCallback(() => {
    if (score >= 80) return 'Outstanding Performance!';
    if (score >= 60) return 'Great Job!';
    if (score >= 40) return 'Good Effort, Keep Improving!';
    if (score >= 20) return 'Room for Growth';
    return 'Keep Practicing!';
  }, [score]);

  // Loading state
  if (isLoading) {
    return (
      <DefaultLayout className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
        <Card className="max-w-md p-8 text-center bg-white border-gray-200">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Generating Feedback</h2>
          <p className="text-gray-600 mb-2">
            {retryCount > 0
              ? `Waiting for transcript... (attempt ${retryCount + 1}/${MAX_RETRIES})`
              : 'Analyzing your interview performance...'}
          </p>
          <p className="text-sm text-gray-400">This may take a few seconds</p>
        </Card>
      </DefaultLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DefaultLayout className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
        <Card className="max-w-md p-8 text-center bg-white border-gray-200">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Feedback</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={handleRetryInterview}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Return Home
          </Button>
        </Card>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout className="flex flex-col overflow-hidden items-center bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen py-6 sm:py-10">
      {/* Breadcrumbs */}
      <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 mb-6">
        <InterviewBreadcrumbs
          currentStage="feedback"
          showBackArrow={true}
        />
      </div>

      <Card className="xl:w-[80%] lg:w-[90%] w-[95%] flex flex-col p-4 sm:p-6 md:p-8 relative items-center justify-center mb-12 max-w-5xl shadow-lg bg-white border border-gray-200">
        {/* Header */}
        <h1 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-4 sm:mt-6 mb-2'>
          Interview Feedback
        </h1>

        {/* Candidate Name */}
        <p className='text-lg sm:text-xl font-medium text-purple-600 mb-2'>
          {candidateName}
        </p>

        {/* Result Message */}
        <p className='text-base sm:text-lg text-gray-600 mb-4'>
          {getResultText()}
        </p>

        {/* Score Display - 0-100% with progress bar */}
        <div className="w-full max-w-md mb-6 px-4">
          <ScoreDisplay score={score} onScoreChange={handleScoreChange} size="lg" />
        </div>

        <Separator className="bg-gray-200 mb-6" />

        {/* Content Sections */}
        <div className="flex flex-col items-center space-y-6 w-full">
          {/* Summary Section */}
          <div className="w-full">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 flex items-center">
              <span className="w-2 h-6 bg-purple-500 rounded-full mr-3"></span>
              Summary
            </h2>
            <TextBox>
              <Markdown
                remarkPlugins={[remarkGfm]}
                className="prose prose-gray prose-sm sm:prose-base max-w-none
                  prose-headings:text-gray-800 prose-headings:font-semibold
                  prose-p:text-gray-600 prose-p:leading-relaxed
                  prose-li:text-gray-600
                  prose-strong:text-gray-800"
              >
                {summary || 'No summary available'}
              </Markdown>
            </TextBox>
          </div>

          {/* Feedback Section */}
          <div className="w-full">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 flex items-center">
              <span className="w-2 h-6 bg-purple-500 rounded-full mr-3"></span>
              Detailed Feedback
            </h2>
            <TextBox>
              <Markdown
                remarkPlugins={[remarkGfm]}
                className="prose prose-gray prose-sm sm:prose-base max-w-none
                  prose-headings:text-gray-800 prose-headings:font-semibold
                  prose-p:text-gray-600 prose-p:leading-relaxed
                  prose-li:text-gray-600
                  prose-strong:text-gray-800"
              >
                {feedback || 'No detailed feedback available'}
              </Markdown>
            </TextBox>
          </div>

          <Separator className="bg-gray-200" />

          {/* Job Description Section */}
          <div className="w-full">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 flex items-center">
              <span className="w-2 h-6 bg-gray-400 rounded-full mr-3"></span>
              Job Description
            </h2>
            <TextBox className="bg-gray-100">
              <p className="text-gray-600 whitespace-pre-wrap">{jobDescription}</p>
            </TextBox>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center w-full items-center gap-3 sm:gap-4 pt-4">
            <Button
              className="w-full sm:w-auto px-6 py-3 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
              onClick={handleDownloadTranscript}
              aria-label="Download transcript as PDF"
            >
              <Download className="w-4 h-4" />
              Download PDF Report
            </Button>
            <Button
              className="w-full sm:w-auto px-6 py-3 flex items-center justify-center gap-2 font-medium border-gray-300 text-gray-700 hover:bg-gray-100"
              variant="outline"
              onClick={handleRetryInterview}
              aria-label="Start new interview"
            >
              <RotateCcw className="w-4 h-4" />
              New Interview
            </Button>

          </div>
        </div>
      </Card>
      <PurpleButton
        variant="outline"
        size="md"
        onClick={handleBackToDashboard}
        className="w-full sm:w-auto"
      >
        <Home className="w-4 h-4" />
        Back to Dashboard
      </PurpleButton>
    </DefaultLayout>
  );
}

export default Feedback;