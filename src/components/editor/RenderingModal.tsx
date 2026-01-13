import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface RenderJob {
  job_id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  message: string;
  output_path?: string;
  video_url?: string;
  duration?: number;
  lyrics_count?: number;
  error?: string;
}

interface RenderingModalProps {
  isOpen: boolean;
  jobId: string | null;
  projectId?: string | null;
  onClose: () => void;
  onComplete?: (outputPath: string) => void;
}

export function RenderingModal({ isOpen, jobId, projectId, onClose, onComplete }: RenderingModalProps) {
  const [job, setJob] = useState<RenderJob | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (!jobId || !isOpen) {
      setJob(null);
      setIsPolling(false);
      return;
    }

    setIsPolling(true);

    const pollJobStatus = async () => {
      try {
        // 1. Poll FastAPI for progress and status
        const response = await fetch(`/api/status/${jobId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch job status');
        }

        const data = await response.json();
        
        // 2. If COMPLETED, also check database as requested
        if (data.status === 'COMPLETED' && projectId) {
          const { data: dbProject, error: dbError } = await supabase
            .from('editor_projects')
            .select('status, video_url')
            .eq('id', projectId)
            .single();
            
          if (!dbError && dbProject && dbProject.status === 'completed') {
            data.video_url = dbProject.video_url || data.video_url;
          }
        }

        setJob(data);

        // Stop polling if job is completed or failed
        if (data.status === 'COMPLETED' || data.status === 'FAILED') {
          setIsPolling(false);
          if (data.status === 'COMPLETED' && (data.output_path || data.video_url)) {
            onComplete?.(data.video_url || data.output_path || '');
          }
        }
      } catch (error) {
        console.error('Error polling job status:', error);
        // Don't stop polling on single error, might be temporary
      }
    };

    // Initial poll
    pollJobStatus();

    // Set up polling every 2 seconds
    const interval = setInterval(pollJobStatus, 2000);

    return () => {
      clearInterval(interval);
      setIsPolling(false);
    };
  }, [jobId, isOpen, onComplete]);

  const handleDownload = () => {
    if (job?.video_url) {
      window.open(job.video_url, '_blank');
    } else if (jobId) {
      window.open(`/api/download/${jobId}`, '_blank');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600';
      case 'PROCESSING':
        return 'text-blue-600';
      case 'COMPLETED':
        return 'text-green-600';
      case 'FAILED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500';
      case 'PROCESSING':
        return 'bg-blue-500';
      case 'COMPLETED':
        return 'bg-green-500';
      case 'FAILED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!isOpen || !jobId) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-[#1A1D23] rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Rendering Video
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          {job ? (
            <div className="space-y-6">
              {/* Status Icon */}
              <div className="flex items-center justify-center">
                {job.status === 'PENDING' && (
                  <div className="relative">
                    <Loader className="w-12 h-12 text-yellow-500 animate-spin" />
                  </div>
                )}
                {job.status === 'PROCESSING' && (
                  <div className="relative">
                    <Loader className="w-12 h-12 text-blue-500 animate-spin" />
                  </div>
                )}
                {job.status === 'COMPLETED' && (
                  job.video_url ? (
                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-black shadow-inner">
                      <video 
                        src={job.video_url} 
                        controls 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )
                )}
                {job.status === 'FAILED' && (
                  <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>

              {/* Status Text */}
              <div className="text-center">
                <h3 className={`text-lg font-semibold ${getStatusColor(job.status)}`}>
                  {job.status === 'PENDING' && 'Queued for Processing'}
                  {job.status === 'PROCESSING' && 'Processing Video'}
                  {job.status === 'COMPLETED' && 'Render Complete!'}
                  {job.status === 'FAILED' && 'Render Failed'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {job.message}
                </p>
              </div>

              {/* Progress Bar */}
              {job.status !== 'COMPLETED' && job.status !== 'FAILED' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Progress</span>
                    <span>{job.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${getProgressColor(job.status)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${job.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* Lyrics Progress (for processing) */}
              {job.status === 'PROCESSING' && job.lyrics_count && (
                <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Processing {job.lyrics_count} lyrics...
                </div>
              )}

              {/* Error Message */}
              {job.status === 'FAILED' && job.error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200 text-sm">
                    {job.error}
                  </p>
                </div>
              )}

              {/* Success Details */}
              {job.status === 'COMPLETED' && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="text-sm text-green-800 dark:text-green-200 space-y-2">
                    {job.video_url && (
                      <div className="break-all">
                        <p className="font-semibold mb-1">Video URL:</p>
                        <a href={job.video_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-600">
                          {job.video_url}
                        </a>
                      </div>
                    )}
                    {job.duration && (
                      <p>Duration: {job.duration.toFixed(1)}s</p>
                    )}
                    {job.lyrics_count && (
                      <p>Lyrics: {job.lyrics_count} words</p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {job.status === 'COMPLETED' && (
                  <button
                    onClick={handleDownload}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Download Video
                  </button>
                )}
                
                {job.status === 'FAILED' && (
                  <button
                    onClick={onClose}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-gray-600 dark:text-gray-400">
                Loading job status...
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}