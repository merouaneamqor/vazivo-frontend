/**
 * Onboarding Feature — Type Definitions
 * @module src/features/onboarding/types
 */

export type OnboardingStep =
  | "profile"
  | "business"
  | "services"
  | "availability"
  | "complete";

export interface OnboardingState {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  userId: number;
  businessId?: number;
}
