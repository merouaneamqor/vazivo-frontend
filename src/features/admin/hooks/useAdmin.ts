"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminService } from '../services/adminApi';
import type { AdminProvidersFilters } from '../types';
import type { InvoiceFilters } from '@/types/invoice';

const queryKeys = {
  all: ['admin'] as const,
  me: () => [...queryKeys.all, 'me'] as const,
  dashboard: () => [...queryKeys.all, 'dashboard'] as const,
  users: (filters?: Record<string, unknown>) => [...queryKeys.all, 'users', filters] as const,
  user: (id: number) => [...queryKeys.all, 'user', id] as const,
  providers: (filters?: AdminProvidersFilters) => [...queryKeys.all, 'providers', filters] as const,
  provider: (id: number) => [...queryKeys.all, 'provider', id] as const,
  bookings: (filters?: Record<string, unknown>) => [...queryKeys.all, 'bookings', filters] as const,
  booking: (id: number) => [...queryKeys.all, 'booking', id] as const,
  reviews: (filters?: Record<string, unknown>) => [...queryKeys.all, 'reviews', filters] as const,
  review: (id: number) => [...queryKeys.all, 'review', id] as const,
  categories: () => [...queryKeys.all, 'categories'] as const,
  cities: () => [...queryKeys.all, 'cities'] as const,
  neighborhoods: (cityId?: number) => [...queryKeys.all, 'neighborhoods', cityId] as const,
  plans: () => [...queryKeys.all, 'plans'] as const,
  seoPages: () => [...queryKeys.all, 'seoPages'] as const,
  claimRequests: (filters?: Record<string, unknown>) => [...queryKeys.all, 'claimRequests', filters] as const,
  claimRequest: (id: number) => [...queryKeys.all, 'claimRequest', id] as const,
  invoices: (filters?: InvoiceFilters) => [...queryKeys.all, 'invoices', filters] as const,
  reports: () => [...queryKeys.all, 'reports'] as const,
  finance: () => [...queryKeys.all, 'finance'] as const,
  staff: () => [...queryKeys.all, 'staff'] as const,
  settings: () => [...queryKeys.all, 'settings'] as const,
  activityLog: (params?: { page?: number; per_page?: number; resource_type?: string; action_type?: string; since?: string }) =>
    [...queryKeys.all, 'activityLog', params] as const,
};

// Current admin user (for topbar, etc.)
export function useAdminMe() {
  return useQuery({
    queryKey: queryKeys.me(),
    queryFn: () => adminService.me(),
  });
}

// Dashboard
export function useAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard(),
    queryFn: () => adminService.getDashboard(),
  });
}

// Activity log (admin actions)
export function useAdminActivityLog(params?: { page?: number; per_page?: number; resource_type?: string; action_type?: string; since?: string }) {
  return useQuery({
    queryKey: queryKeys.activityLog(params),
    queryFn: () => adminService.getActivityLog(params),
  });
}

// Users
export function useAdminUsers(filters?: Record<string, unknown>, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.users(filters),
    queryFn: () => adminService.getUsers(filters),
    ...options,
  });
}

export function useAdminUser(id: number) {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => adminService.getUser(id),
    enabled: !!id,
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => adminService.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users() });
      toast.success('User updated');
    },
    onError: () => toast.error('Failed to update user'),
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users() });
      toast.success('User deleted');
    },
    onError: () => toast.error('Failed to delete user'),
  });
}

// Providers
export function useAdminProviders(filters?: AdminProvidersFilters) {
  return useQuery({
    queryKey: queryKeys.providers(filters),
    queryFn: () => adminService.getProviders(filters),
  });
}

export function useAdminProvider(id: number) {
  return useQuery({
    queryKey: queryKeys.provider(id),
    queryFn: () => adminService.getProvider(id),
    enabled: !!id,
  });
}

export function useCreateAdminProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminService.createProvider(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.providers() });
      toast.success('Provider created');
    },
    onError: () => toast.error('Failed to create provider'),
  });
}

export function useUpdateAdminProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => adminService.updateProvider(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.provider(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.providers() });
      toast.success('Provider updated');
    },
    onError: () => toast.error('Failed to update provider'),
  });
}

export function useApproveAdminProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.approveProvider(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.provider(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.providers() });
      toast.success('Provider approved');
    },
    onError: () => toast.error('Failed to approve provider'),
  });
}

// Bookings
export function useAdminBookings(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.bookings(filters),
    queryFn: () => adminService.getBookings(filters),
  });
}

export function useAdminBooking(id: number) {
  return useQuery({
    queryKey: queryKeys.booking(id),
    queryFn: () => adminService.getBooking(id),
    enabled: !!id,
  });
}

// Reviews
export function useAdminReviews(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.reviews(filters),
    queryFn: () => adminService.getReviews(filters),
  });
}

export function useAdminReview(id: number) {
  return useQuery({
    queryKey: queryKeys.review(id),
    queryFn: () => adminService.getReview(id),
    enabled: !!id,
  });
}

// Categories
export function useAdminCategories() {
  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: () => adminService.getCategories(),
  });
}

export function useCreateAdminCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
      toast.success('Category created');
    },
    onError: () => toast.error('Failed to create category'),
  });
}

export function useUpdateAdminCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => adminService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
      toast.success('Category updated');
    },
    onError: () => toast.error('Failed to update category'),
  });
}

export function useDeleteAdminCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
      toast.success('Category deleted');
    },
    onError: () => toast.error('Failed to delete category'),
  });
}

// Cities
export function useAdminCities() {
  return useQuery({
    queryKey: queryKeys.cities(),
    queryFn: () => adminService.getCities(),
  });
}

export function useCreateAdminCity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminService.createCity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cities() });
      toast.success('City created');
    },
    onError: () => toast.error('Failed to create city'),
  });
}

// Plans
export function useAdminPlans() {
  return useQuery({
    queryKey: queryKeys.plans(),
    queryFn: () => adminService.getPlans(),
  });
}

// SEO Pages
export function useAdminSeoPages() {
  return useQuery({
    queryKey: queryKeys.seoPages(),
    queryFn: () => adminService.getSeoPages(),
  });
}

// Claim Requests
export function useAdminClaimRequests(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.claimRequests(filters),
    queryFn: () => adminService.getClaimRequests(filters),
  });
}

export function useAdminClaimRequest(id: number) {
  return useQuery({
    queryKey: queryKeys.claimRequest(id),
    queryFn: () => adminService.getClaimRequest(id),
    enabled: !!id,
  });
}

export function useApproveClaimRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.approveClaimRequest(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.claimRequest(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.claimRequests() });
      toast.success('Claim request approved');
    },
    onError: () => toast.error('Failed to approve claim request'),
  });
}

export function useRejectClaimRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.rejectClaimRequest(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.claimRequest(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.claimRequests() });
      toast.success('Claim request rejected');
    },
    onError: () => toast.error('Failed to reject claim request'),
  });
}

// Invoices
export function useAdminInvoices(filters?: InvoiceFilters) {
  return useQuery({
    queryKey: queryKeys.invoices(filters),
    queryFn: () => adminService.getInvoices(filters),
  });
}

// Reports
export function useAdminReports() {
  return useQuery({
    queryKey: queryKeys.reports(),
    queryFn: () => adminService.getReports(),
  });
}

// Finance
export function useAdminFinance() {
  return useQuery({
    queryKey: queryKeys.finance(),
    queryFn: () => adminService.getEarnings(),
  });
}

// Staff
export function useAdminStaff() {
  return useQuery({
    queryKey: queryKeys.staff(),
    queryFn: () => adminService.getStaff(),
  });
}

// Settings
export function useAdminSettings() {
  return useQuery({
    queryKey: queryKeys.settings(),
    queryFn: () => adminService.getSettings(),
  });
}
