'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { DefaultLayout } from 'components/default-layout';
import { useInterviewFlow } from 'hooks/use-interview-flow';
import InterviewBreadcrumbs from 'components/interview-breadcrumbs';
import Loading from 'components/loading';
import { useAuthCheck } from 'hooks/use-auth-check';
import CreditsModal from 'components/credits-modal';
import { Input } from 'components/ui/input';
import { Textarea } from 'components/ui/textarea';
import { Checkbox } from 'components/ui/checkbox';
import PurpleButton from 'components/ui/purple-button';
import { Upload, User, Briefcase, FileText, Building2, ArrowLeft, FolderOpen, Star, Check } from 'lucide-react';
import apiService, { ResumeListItem } from 'services/APIService';

type FieldName = 'companyName' | 'jobTitle' | 'jobDescription' | 'resume' | 'policy';
type FormErrors = Record<FieldName, string>;

interface FormValues {
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  resume: string; // Base64 encoded resume content
  resumeFileName?: string;
  resumeMimeType?: string;
}

const InterviewSetup: React.FC = () => {
  const navigate = useNavigate();
  const { user, isSignedIn, isLoaded } = useUser();
  const { t } = useTranslation();
  const { setStage, startInterview, isInFlow, resetFlow } = useInterviewFlow();
  
  // Form state
  const [formValues, setFormValues] = useState<FormValues>({
    companyName: '',
    jobTitle: '',
    jobDescription: '',
    resume: '',
    resumeFileName: '',
    resumeMimeType: ''
  });
  const [fileName, setFileName] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({
    companyName: '',
    jobTitle: '',
    jobDescription: '',
    resume: '',
    policy: ''
  });
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Resume repository state
  const [savedResumes, setSavedResumes] = useState<ResumeListItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [resumeSource, setResumeSource] = useState<'upload' | 'saved'>('upload');
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);

  // Auth and credits
  const {
    isLoading,
    userCredits,
    showCreditsModal,
    setShowCreditsModal,
    updateCredits
  } = useAuthCheck();

  // Get user's name from Clerk
  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';

  // Initialize interview flow if not already started
  useEffect(() => {
    if (!isInFlow) {
      startInterview();
    }
    setStage('details');
  }, [isInFlow, startInterview, setStage]);

  // Load saved resumes from repository
  useEffect(() => {
    const loadSavedResumes = async () => {
      if (!user?.id) return;
      
      setIsLoadingResumes(true);
      try {
        const response = await apiService.getResumes(user.id);
        if (response.status === 'success' && response.data) {
          setSavedResumes(response.data);
          
          // If there's a primary resume, pre-select it
          const primaryResume = response.data.find(r => r.isPrimary);
          if (primaryResume) {
            setSelectedResumeId(primaryResume.id);
            setResumeSource('saved');
          }
        }
      } catch (error) {
        console.error('Failed to load saved resumes:', error);
      } finally {
        setIsLoadingResumes(false);
      }
    };
    
    loadSavedResumes();
  }, [user?.id]);

  // Redirect to home if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/');
    }
  }, [isLoaded, isSignedIn, navigate]);

  // Handle form field changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
    if (errors[name as FieldName]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  // Handle file change - reads file and converts to Base64
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, resume: 'Please upload a PDF or Word document' }));
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, resume: 'File size must be less than 5MB' }));
        return;
      }

      setFileName(file.name);
      setIsProcessingFile(true);

      // Read file as Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64Data = result.split(',')[1];
        
        setFormValues(prev => ({
          ...prev,
          resume: base64Data,
          resumeFileName: file.name,
          resumeMimeType: file.type
        }));
        setIsProcessingFile(false);
        
        if (errors.resume) {
          setErrors(prev => ({ ...prev, resume: '' }));
        }
      };
      reader.onerror = () => {
        setErrors(prev => ({ ...prev, resume: 'Failed to read file. Please try again.' }));
        setIsProcessingFile(false);
      };
      reader.readAsDataURL(file);
    }
  }, [errors.resume]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {
      companyName: '',
      jobTitle: '',
      jobDescription: '',
      resume: '',
      policy: ''
    };

    if (!firstName.trim()) {
      newErrors.policy = 'Please set your first name in your Clerk profile';
    }
    if (!lastName.trim()) {
      newErrors.policy = 'Please set your last name in your Clerk profile';
    }
    if (!formValues.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    if (!formValues.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }
    if (!formValues.jobDescription.trim()) {
      newErrors.jobDescription = 'Job description is required';
    } else if (formValues.jobDescription.trim().length < 200) {
      newErrors.jobDescription = `Job description must be at least 200 characters (current: ${formValues.jobDescription.trim().length})`;
    }
    
    // Check resume based on source
    if (resumeSource === 'upload' && !formValues.resume) {
      newErrors.resume = 'Resume is required';
    } else if (resumeSource === 'saved' && !selectedResumeId) {
      newErrors.resume = 'Please select a resume from your library';
    }
    
    if (!isChecked) {
      newErrors.policy = 'You must accept the privacy policy and terms of use';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  }, [formValues, isChecked, firstName, lastName, resumeSource, selectedResumeId]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Check if credits are still loading or zero
    if (userCredits === null) {
      setErrors(prev => ({ ...prev, policy: 'Please wait while credits are loading...' }));
      return;
    }

    if (userCredits <= 0) {
      setShowCreditsModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      await updateCredits('use');

      const interviewId = `interview_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const tokenExpiration = Date.now() + (60 * 60 * 1000);

      localStorage.setItem('interviewValidationToken', interviewId);
      localStorage.setItem('tokenExpiration', tokenExpiration.toString());

      // Prepare resume data based on source
      let resumeData = formValues.resume;
      let resumeFileName = formValues.resumeFileName;
      let resumeMimeType = formValues.resumeMimeType;
      
      if (resumeSource === 'saved' && selectedResumeId) {
        // Fetch the resume data from repository
        try {
          const resumeResponse = await apiService.getResumeById(user!.id, selectedResumeId, true);
          if (resumeResponse.status === 'success' && resumeResponse.data.base64Data) {
            resumeData = resumeResponse.data.base64Data;
            resumeFileName = resumeResponse.data.fileName;
            resumeMimeType = resumeResponse.data.mimeType;
          }
        } catch (error) {
          console.error('Failed to fetch resume:', error);
          setIsSubmitting(false);
          setErrors(prev => ({ ...prev, resume: 'Failed to load resume. Please try again.' }));
          return;
        }
      }

      navigate('/interview', {
        state: {
          body: {
            userId: user?.id,
            metadata: {
              first_name: firstName,
              last_name: lastName,
              company_name: formValues.companyName,
              job_title: formValues.jobTitle,
              job_description: formValues.jobDescription,
              interviewee_cv: resumeData,
              resume_file_name: resumeFileName,
              resume_mime_type: resumeMimeType,
              interview_id: interviewId,
              preferred_language: i18n.language // Pass current language for multilingual Retell agent
            }
          }
        }
      });
    } catch (error) {
      console.error('Error starting interview:', error);
      setIsSubmitting(false);
      setErrors(prev => ({ ...prev, policy: 'Failed to start interview. Please try again.' }));
    }
  }, [validateForm, userCredits, updateCredits, navigate, formValues, firstName, lastName, user?.id, setShowCreditsModal]);

  if (!isLoaded || !isSignedIn || isLoading) {
    return <Loading />;
  }

  return (
    <DefaultLayout className="flex flex-col overflow-hidden bg-zinc-50 min-h-screen">
      <div className="page-container py-6 sm:py-8">

                {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <ArrowLeft onClick={() => navigate('/interviews')} className="w-5 h-5 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer" />
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
              {t('interviewSetup.title')} <span className="text-purple-600">{t('interviewSetup.titleHighlight')}</span>
              </h1>
            </div>
            <p className="text-zinc-600 mt-1 pl-8">
              {t('interviewSetup.subtitle')}
            </p>
          </div>
        </div>

        {/* Breadcrumbs */}
        <InterviewBreadcrumbs 
          currentStage="details" 
          showBackArrow={false}
          className="my-6"
        />

        {/* Main Content - Centered */}
        <div className="max-w-2xl mx-auto ">

          {/* User Info Card */}
          <div className="p-6 bg-white border border-zinc-200 rounded-xl mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-zinc-500">{t('interviewSetup.interviewingAs')}</p>
                <p className="text-lg font-semibold text-zinc-900">{firstName} {lastName}</p>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="p-6 bg-white border border-zinc-200 rounded-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  {t('interviewSetup.form.companyName')}
                </label>
                <Input
                  type="text"
                  name="companyName"
                  placeholder={t('interviewSetup.form.companyNamePlaceholder')}
                  value={formValues.companyName}
                  onChange={handleChange}
                  className="w-full"
                />
                {errors.companyName && (
                  <p className="text-red-500 text-sm">{errors.companyName}</p>
                )}
              </div>

              {/* Job Title */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                  {t('interviewSetup.form.jobTitle')}
                </label>
                <Input
                  type="text"
                  name="jobTitle"
                  placeholder={t('interviewSetup.form.jobTitlePlaceholder')}
                  value={formValues.jobTitle}
                  onChange={handleChange}
                  className="w-full"
                />
                {errors.jobTitle && (
                  <p className="text-red-500 text-sm">{errors.jobTitle}</p>
                )}
              </div>

              {/* Job Description */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <FileText className="w-4 h-4 text-purple-600" />
                  {t('interviewSetup.form.jobDescription')}
                </label>
                <Textarea
                  name="jobDescription"
                  placeholder={t('interviewSetup.form.jobDescriptionPlaceholder')}
                  rows={6}
                  value={formValues.jobDescription}
                  onChange={handleChange}
                  className="w-full resize-none"
                />
                <div className="flex justify-between text-xs">
                  <span className={formValues.jobDescription.length < 200 ? 'text-amber-600' : 'text-green-600'}>
                    {formValues.jobDescription.length}/200 {t('interviewSetup.form.charactersMinimum')}
                  </span>
                </div>
                {errors.jobDescription && (
                  <p className="text-red-500 text-sm">{errors.jobDescription}</p>
                )}
              </div>

              {/* Resume Upload */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <Upload className="w-4 h-4 text-purple-600" />
                  {t('interviewSetup.form.resume')}
                </label>
                
                {/* Resume Source Toggle */}
                {savedResumes.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        setResumeSource('saved');
                        setErrors(prev => ({ ...prev, resume: '' }));
                      }}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        resumeSource === 'saved'
                          ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                          : 'bg-zinc-100 text-zinc-600 border-2 border-transparent hover:bg-zinc-200'
                      }`}
                    >
                      <FolderOpen className="w-4 h-4 inline-block mr-2" />
                      {t('interviewSetup.form.fromLibrary', 'From Library')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setResumeSource('upload');
                        setSelectedResumeId(null);
                        setErrors(prev => ({ ...prev, resume: '' }));
                      }}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        resumeSource === 'upload'
                          ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                          : 'bg-zinc-100 text-zinc-600 border-2 border-transparent hover:bg-zinc-200'
                      }`}
                    >
                      <Upload className="w-4 h-4 inline-block mr-2" />
                      {t('interviewSetup.form.uploadNew', 'Upload New')}
                    </button>
                  </div>
                )}
                
                {/* Saved Resumes List */}
                {resumeSource === 'saved' && savedResumes.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-zinc-200 rounded-lg p-2">
                    {isLoadingResumes ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      savedResumes.map((resume) => (
                        <button
                          key={resume.id}
                          type="button"
                          onClick={() => {
                            setSelectedResumeId(resume.id);
                            setErrors(prev => ({ ...prev, resume: '' }));
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                            selectedResumeId === resume.id
                              ? 'bg-purple-50 border-2 border-purple-300'
                              : 'bg-zinc-50 border-2 border-transparent hover:bg-zinc-100'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedResumeId === resume.id
                              ? 'border-purple-600 bg-purple-600'
                              : 'border-zinc-300'
                          }`}>
                            {selectedResumeId === resume.id && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-zinc-900 text-sm">{resume.title}</span>
                              {resume.isPrimary && (
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              )}
                            </div>
                            <span className="text-xs text-zinc-500">{resume.fileName}</span>
                          </div>
                          {resume.qualityScore && (
                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                              resume.qualityScore >= 80 ? 'bg-green-100 text-green-700' :
                              resume.qualityScore >= 60 ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {resume.qualityScore}%
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
                
                {/* File Upload (shown when upload source selected or no saved resumes) */}
                {(resumeSource === 'upload' || savedResumes.length === 0) && (
                  <>
                    <input
                      type="file"
                      id="resume"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="resume"
                      className={`flex items-center justify-center gap-3 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                        fileName 
                          ? 'border-purple-300 bg-purple-50' 
                          : 'border-zinc-300 hover:border-purple-400 hover:bg-purple-50/50'
                      }`}
                    >
                      <Upload className={`w-5 h-5 ${fileName ? 'text-purple-600' : 'text-zinc-400'}`} />
                      <span className={fileName ? 'text-purple-700 font-medium' : 'text-zinc-500'}>
                        {fileName || t('interviewSetup.form.uploadResume')}
                      </span>
                    </label>
                  </>
                )}
                
                {errors.resume && (
                  <p className="text-red-500 text-sm">{errors.resume}</p>
                )}
              </div>

              {/* Privacy Policy Checkbox */}
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="acceptPolicy"
                    checked={isChecked}
                    onCheckedChange={(checked) => setIsChecked(checked === true)}
                    className="mt-1"
                  />
                  <label htmlFor="acceptPolicy" className="text-sm text-zinc-600 leading-relaxed">
                    {t('interviewSetup.form.acceptPolicy')}{' '}
                    <a 
                      href="https://drive.google.com/file/d/1697V9WvT0jzGWQ4_YJQjW2lpD_fBJLah/view" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 underline"
                    >
                      {t('interviewSetup.form.privacyPolicy')}
                    </a>{' '}
                    {t('common.and')}{' '}
                    <a 
                      href="https://drive.google.com/file/d/1KVWSGgYNaFFZ3OWQuPqB0puFzaWkRRbm/view?usp=sharing" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 underline"
                    >
                      {t('interviewSetup.form.termsOfUse')}
                    </a>
                  </label>
                </div>
                {errors.policy && (
                  <p className="text-red-500 text-sm">{errors.policy}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <PurpleButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting || userCredits === null || userCredits <= 0}
                  className="w-full py-4 text-lg font-semibold"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('common.processing')}
                    </span>
                  ) : userCredits === null ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('interviewSetup.loadingCredits')}
                    </span>
                  ) : (
                    t('interviewSetup.startInterview')
                  )}
                </PurpleButton>
              </div>
            </form>
          </div>

          {/* Help Text */}
          <p className="text-center text-sm text-zinc-500 mt-6">
            {t('interviewSetup.helpText')}
          </p>

         
        </div>
      </div>

      {/* Credits Modal */}
      <CreditsModal
        isOpen={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
      />
    </DefaultLayout>
  );
};

export default InterviewSetup;
