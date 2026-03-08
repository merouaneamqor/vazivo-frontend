"use client";

import * as adminApi from '@/lib/admin-api';

export const adminService = {
  // Auth
  login: adminApi.adminLogin,
  me: adminApi.adminMe,
  
  // Dashboard
  getDashboard: adminApi.getAdminDashboard,
  
  // Users
  getUsers: adminApi.getAdminUsers,
  getUser: adminApi.getAdminUser,
  updateUser: adminApi.updateAdminUser,
  deleteUser: adminApi.deleteAdminUser,
  suspendUser: adminApi.suspendAdminUser,
  unsuspendUser: adminApi.unsuspendAdminUser,
  promoteToAdmin: adminApi.promoteToAdmin,
  forcePasswordReset: adminApi.forcePasswordReset,
  
  // Providers
  getProviders: adminApi.getAdminProviders,
  getProvider: adminApi.getAdminProvider,
  createProvider: adminApi.createAdminProvider,
  updateProvider: adminApi.updateAdminProvider,
  approveProvider: adminApi.approveProvider,
  rejectProvider: adminApi.rejectProvider,
  unconfirmProvider: adminApi.unconfirmProvider,
  verifyProvider: adminApi.verifyProvider,
  unverifyProvider: adminApi.unverifyProvider,
  suspendProvider: adminApi.suspendProvider,
  reactivateProvider: adminApi.reactivateProvider,
  impersonateProvider: adminApi.impersonateProvider,
  sendOnboardingEmailProvider: adminApi.sendOnboardingEmailProvider,
  upgradeProviderPremium: adminApi.upgradeProviderPremium,
  
  // Bookings
  getBookings: adminApi.getAdminBookings,
  getBooking: adminApi.getAdminBooking,
  updateBooking: adminApi.updateAdminBooking,
  cancelBooking: adminApi.cancelAdminBooking,
  refundBooking: adminApi.refundAdminBooking,
  
  // Reviews
  getReviews: adminApi.getAdminReviews,
  getReview: adminApi.getAdminReview,
  updateReview: adminApi.updateAdminReview,
  deleteReview: adminApi.deleteAdminReview,
  hideReview: adminApi.hideAdminReview,
  unhideReview: adminApi.unhideAdminReview,
  flagReview: adminApi.flagAdminReview,
  unflagReview: adminApi.unflagAdminReview,
  
  // Categories
  getCategories: adminApi.getAdminCategories,
  createCategory: adminApi.createAdminCategory,
  updateCategory: adminApi.updateAdminCategory,
  deleteCategory: adminApi.deleteAdminCategory,
  
  // Cities
  getCities: adminApi.getAdminCities,
  createCity: adminApi.createAdminCity,
  updateCity: adminApi.updateAdminCity,
  deleteCity: adminApi.deleteAdminCity,
  
  // Neighborhoods
  createNeighborhood: adminApi.createAdminNeighborhood,
  updateNeighborhood: adminApi.updateAdminNeighborhood,
  deleteNeighborhood: adminApi.deleteAdminNeighborhood,
  
  // Plans
  getPlans: adminApi.getAdminPlans,
  createPlan: adminApi.createAdminPlan,
  updatePlan: adminApi.updateAdminPlan,
  deletePlan: adminApi.deleteAdminPlan,

  // SEO Pages
  getSeoPages: adminApi.getAdminSeoPages,
  getSeoPage: adminApi.getAdminSeoPage,
  createSeoPage: adminApi.createAdminSeoPage,
  updateSeoPage: adminApi.updateAdminSeoPage,
  deleteSeoPage: adminApi.deleteAdminSeoPage,
  
  // Claim Requests
  getClaimRequests: adminApi.getAdminClaimRequests,
  getClaimRequest: adminApi.getAdminClaimRequest,
  approveClaimRequest: adminApi.approveClaimRequest,
  rejectClaimRequest: adminApi.rejectClaimRequest,
  
  // Invoices
  getInvoices: adminApi.getAdminBusinessInvoices,
  
  // Reports
  getReports: adminApi.getAdminReports,
  exportReport: adminApi.exportAdminReport,
  
  // Finance
  getEarnings: adminApi.getAdminEarnings,
  getPayouts: adminApi.getAdminPayouts,
  getFinanceLogs: adminApi.getAdminFinanceLogs,
  
  // Staff
  getStaff: adminApi.getAdminStaff,
  createStaff: adminApi.createAdminStaff,
  updateStaff: adminApi.updateAdminStaff,
  suspendStaff: adminApi.suspendAdminStaff,
  
  // Support
  impersonate: adminApi.supportImpersonate,
  getActivityLog: adminApi.getSupportActivityLog,
  
  // Settings
  getSettings: adminApi.getAdminSettings,
};
