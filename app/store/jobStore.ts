import { create } from 'zustand';
import { axiosInstance } from '@/lib/axios';

export type JobType = "FullTime" | "PartTime" | "Remote" | "Hybrid";
export type ExperienceLevel = "Junior" | "Middle" | "Senior";

export interface Job {
  id: number;
  organizationId: number;
  title: string;
  description: string;
  salaryMin: number;
  salaryMax: number;
  location: string;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  experienceRequired: number;
  categoryId: number;
  createdAt: string;
}

interface JobFilters {
  Title?: string;
  Location?: string;
  SalaryMin?: number;
  SalaryMax?: number;
  JobType?: JobType;
  ExperienceLevel?: ExperienceLevel;
}

interface JobState {
  jobs: Job[];
  currentJob: Job | null;
  isLoading: boolean;
  error: string | null;
  fetchJobs: (filters?: JobFilters) => Promise<void>;
  fetchJobById: (id: number) => Promise<void>;
  applyToJob: (jobId: number, userId: number) => Promise<boolean>;
  createJob: (jobData: any) => Promise<boolean>;
}

export const useJobStore = create<JobState>((set) => ({
  jobs: [],
  currentJob: null,
  isLoading: false,
  error: null,

  fetchJobs: async (filters?: JobFilters) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });
      }
      
      const endpoint = filters ? '/Job/paged' : '/Job';
      const response = await axiosInstance.get(`${endpoint}?${params.toString()}`);
      
      const data = response.data?.data || response.data;
      const jobsList = data?.items || data;
      set({ jobs: Array.isArray(jobsList) ? jobsList : [], isLoading: false });
    } catch (err: any) {
      console.error('Failed to fetch jobs:', err);
      set({ error: err.message || 'Failed to fetch jobs', isLoading: false });
    }
  },

  fetchJobById: async (id: number) => {
    set({ isLoading: true, error: null, currentJob: null });
    try {
      const response = await axiosInstance.get(`/Job/${id}`);
      const data = response.data?.data || response.data;
      set({ currentJob: data, isLoading: false });
    } catch (err: any) {
      console.error(`Failed to fetch job ${id}:`, err);
      set({ error: err.message || `Failed to fetch job ${id}`, isLoading: false });
    }
  },

  applyToJob: async (jobId: number, userId: number) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.post('/JobApplication', { jobId, userId });
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      console.error('Failed to apply to job:', err);
      set({ error: err.response?.data?.message || 'Failed to apply to job', isLoading: false });
      return false;
    }
  },

  createJob: async (jobData: any) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.post('/Job', jobData);
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      console.error('Failed to create job:', err);
      set({ error: err.response?.data?.message || 'Failed to create job', isLoading: false });
      return false;
    }
  },
}));
