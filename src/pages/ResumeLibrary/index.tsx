'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { DefaultLayout } from 'components/default-layout';
import Loading from 'components/loading';
import { Input } from 'components/ui/input';
import PurpleButton from 'components/ui/purple-button';
import {
  Upload,
  FileText,
  Star,
  Trash2,
  Edit3,
  Plus,
  Search,
  Clock,
  Tag,
  MoreVertical,
  ArrowLeft,
  FolderOpen,
  Check,
  X
} from 'lucide-react';
import apiService, { ResumeListItem } from 'services/APIService';

const ResumeLibrary: React.FC = () => {
  const navigate = useNavigate();
  const { user, isSignedIn, isLoaded } = useUser();
  const { t } = useTranslation();

  // State
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [editingResume, setEditingResume] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load resumes
  const loadResumes = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const response = await apiService.getResumes(user.id);
      if (response.status === 'success') {
        setResumes(response.data);
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
      setError('Failed to load resumes');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isSignedIn && user?.id) {
      loadResumes();
    }
  }, [isSignedIn, user?.id, loadResumes]);

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/');
    }
  }, [isLoaded, isSignedIn, navigate]);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];

        const response = await apiService.createResume(user.id, {
          fileName: file.name,
          mimeType: file.type,
          base64Data,
          title: file.name.replace(/\.[^/.]+$/, ''),
          isPrimary: resumes.length === 0 // First resume is primary
        });

        if (response.status === 'success') {
          await loadResumes();
        }
        setIsUploading(false);
      };
      reader.onerror = () => {
        setError('Failed to read file');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to upload resume:', err);
      setError('Failed to upload resume');
      setIsUploading(false);
    }

    // Reset input
    e.target.value = '';
  };

  // Set primary resume
  const handleSetPrimary = async (resumeId: string) => {
    if (!user?.id) return;

    try {
      await apiService.setPrimaryResume(user.id, resumeId);
      await loadResumes();
      setActiveMenu(null);
    } catch (err) {
      console.error('Failed to set primary:', err);
      setError('Failed to set as primary');
    }
  };

  // Delete resume
  const handleDelete = async (resumeId: string) => {
    if (!user?.id) return;

    if (!window.confirm(t('resumeLibrary.confirmDelete', 'Are you sure you want to delete this resume?'))) {
      return;
    }

    try {
      await apiService.deleteResume(user.id, resumeId);
      await loadResumes();
      setActiveMenu(null);
    } catch (err) {
      console.error('Failed to delete resume:', err);
      setError('Failed to delete resume');
    }
  };

  // Update resume title
  const handleUpdateTitle = async (resumeId: string) => {
    if (!user?.id || !editTitle.trim()) return;

    try {
      await apiService.updateResume(user.id, resumeId, { title: editTitle.trim() });
      await loadResumes();
      setEditingResume(null);
      setEditTitle('');
    } catch (err) {
      console.error('Failed to update resume:', err);
      setError('Failed to update resume');
    }
  };

  // Filter resumes
  const filteredResumes = resumes.filter(resume =>
    resume.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resume.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resume.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isLoaded || !isSignedIn) {
    return <Loading />;
  }

  return (
    <DefaultLayout className="flex flex-col overflow-hidden bg-zinc-50 min-h-screen">
      <div className="page-container py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <ArrowLeft
                onClick={() => navigate('/dashboard')}
                className="w-5 h-5 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
              />
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
                {t('resumeLibrary.title', 'Resume')} <span className="text-purple-600">{t('resumeLibrary.titleHighlight', 'Library')}</span>
              </h1>
            </div>
            <p className="text-zinc-600 mt-1 pl-8">
              {t('resumeLibrary.subtitle', 'Manage your resumes for quick interview setup')}
            </p>
          </div>

          {/* Upload Button */}
          <div>
            <input
              type="file"
              id="resume-upload"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="resume-upload">
              <PurpleButton
                as="span"
                variant="primary"
                disabled={isUploading}
                className="cursor-pointer"
              >
                {isUploading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('common.uploading', 'Uploading...')}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    {t('resumeLibrary.uploadNew', 'Upload Resume')}
                  </span>
                )}
              </PurpleButton>
            </label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              type="text"
              placeholder={t('resumeLibrary.search', 'Search resumes...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Resumes Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredResumes.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className="w-16 h-16 mx-auto text-zinc-300 mb-4" />
            <h3 className="text-lg font-medium text-zinc-700 mb-2">
              {searchQuery
                ? t('resumeLibrary.noResults', 'No resumes match your search')
                : t('resumeLibrary.empty', 'No resumes yet')
              }
            </h3>
            <p className="text-zinc-500 mb-6">
              {t('resumeLibrary.emptyDescription', 'Upload your first resume to get started')}
            </p>
            {!searchQuery && (
              <label htmlFor="resume-upload">
                <PurpleButton as="span" variant="secondary" className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  {t('resumeLibrary.uploadFirst', 'Upload Resume')}
                </PurpleButton>
              </label>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResumes.map((resume) => (
              <div
                key={resume.id}
                className={`relative bg-white border rounded-xl p-4 transition-all hover:shadow-md ${
                  resume.isPrimary ? 'border-purple-200 ring-1 ring-purple-100' : 'border-zinc-200'
                }`}
              >
                {/* Primary Badge */}
                {resume.isPrimary && (
                  <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" />
                    {t('resumeLibrary.primary', 'Primary')}
                  </div>
                )}

                {/* Menu Button */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => setActiveMenu(activeMenu === resume.id ? null : resume.id)}
                    className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-zinc-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenu === resume.id && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg py-1 z-10 min-w-[150px]">
                      {!resume.isPrimary && (
                        <button
                          onClick={() => handleSetPrimary(resume.id)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 flex items-center gap-2"
                        >
                          <Star className="w-4 h-4" />
                          {t('resumeLibrary.setAsPrimary', 'Set as Primary')}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingResume(resume.id);
                          setEditTitle(resume.title);
                          setActiveMenu(null);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 flex items-center gap-2"
                      >
                        <Edit3 className="w-4 h-4" />
                        {t('resumeLibrary.rename', 'Rename')}
                      </button>
                      <button
                        onClick={() => handleDelete(resume.id)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 flex items-center gap-2 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        {t('resumeLibrary.delete', 'Delete')}
                      </button>
                    </div>
                  )}
                </div>

                {/* Resume Icon */}
                <div className="p-3 bg-purple-50 rounded-lg w-fit mb-3">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>

                {/* Title */}
                {editingResume === resume.id ? (
                  <div className="flex items-center gap-2 mb-2">
                    <Input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="h-8 text-sm"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdateTitle(resume.id)}
                      className="p-1.5 bg-purple-100 hover:bg-purple-200 rounded text-purple-600"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingResume(null);
                        setEditTitle('');
                      }}
                      className="p-1.5 bg-zinc-100 hover:bg-zinc-200 rounded text-zinc-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <h3 className="font-semibold text-zinc-900 mb-1 pr-8 truncate">{resume.title}</h3>
                )}

                <p className="text-xs text-zinc-500 mb-3 truncate">{resume.fileName}</p>

                {/* Metadata */}
                <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(resume.updatedAt)}
                  </span>
                  <span>{formatFileSize(resume.fileSize)}</span>
                  {resume.usageCount > 0 && (
                    <span>{resume.usageCount} {t('resumeLibrary.uses', 'uses')}</span>
                  )}
                </div>

                {/* Quality Score */}
                {resume.qualityScore !== undefined && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-zinc-500">{t('resumeLibrary.qualityScore', 'Quality Score')}</span>
                      <span className={`font-medium ${
                        resume.qualityScore >= 80 ? 'text-green-600' :
                        resume.qualityScore >= 60 ? 'text-amber-600' :
                        'text-red-600'
                      }`}>
                        {resume.qualityScore}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          resume.qualityScore >= 80 ? 'bg-green-500' :
                          resume.qualityScore >= 60 ? 'bg-amber-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${resume.qualityScore}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Tags */}
                {resume.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {resume.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-100 text-zinc-600 text-xs rounded-full"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                    {resume.tags.length > 3 && (
                      <span className="text-xs text-zinc-400">+{resume.tags.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Start Interview Button */}
                <button
                  onClick={() => navigate('/interview-setup', { state: { selectedResumeId: resume.id } })}
                  className="mt-4 w-full py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-medium rounded-lg transition-colors"
                >
                  {t('resumeLibrary.startInterview', 'Start Interview')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {activeMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveMenu(null)}
        />
      )}
    </DefaultLayout>
  );
};

export default ResumeLibrary;
