import { Suspense } from "react";
import { ProviderRegisterForm } from "../ProviderRegisterForm";
import { PageSpinner } from "@/components/ui/spinner";
import { PreloadCarouselImages } from "@/components/provider/PreloadCarouselImages";

export const metadata = {
  title: "Register your business",
  description: "Create your account and submit your restaurant for review. List your restaurant on Vazivo.",
};

export default function ProviderRegisterFormPage() {
  return (
    <>
      <PreloadCarouselImages />
      <Suspense fallback={<PageSpinner />}>
        <ProviderRegisterForm />
      </Suspense>
    </>
  );
}
