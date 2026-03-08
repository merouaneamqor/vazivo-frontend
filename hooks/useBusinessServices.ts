import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export function useBusinessServices(businessId: number | undefined) {
  return useQuery({
    queryKey: ["business-services", businessId],
    queryFn: () => api.getBusinessServices(businessId!),
    enabled: !!businessId,
  });
}
