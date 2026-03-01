import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { lookupService } from "@/api/lookupService";
import { AppLookupMasterDto, AppLookupDetailDto } from "@/types";
import { useAuthStore } from "@/store/authStore";

interface LookupCache {
  [masterCode: string]: AppLookupDetailDto[];
}

interface LookupContextType {
  getLookupValue: (
    masterCode: string,
    detailId: string | null | undefined,
    language: string,
  ) => string;
  getLookupDetails: (masterCode: string) => AppLookupDetailDto[];
  refreshLookups: (masterCodes?: string[]) => Promise<void>;
  isLoading: boolean;
}

const LookupContext = createContext<LookupContextType | undefined>(undefined);

const CACHE_KEY = "pharmacy_lookup_cache";

export const LookupProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cache, setCache] = useState<LookupCache>(() => {
    const saved = localStorage.getItem(CACHE_KEY);
    return saved ? JSON.parse(saved) : {};
  });
  const [isLoading, setIsLoading] = useState(false);

  const refreshLookups = useCallback(async (masterCodes?: string[]) => {
    setIsLoading(true);
    try {
      // Use bulk query to fetch lookups.
      // We pass an empty filter or a specific filter if masterCodes are provided.
      const res = await lookupService.query({
        request: {
          pagination: { getAll: true, pageNumber: 1, pageSize: 100 },
          sort: [{ sortBy: "LookupCode", sortDirection: "asc" }],
        },
      });

      if (res.data.success && res.data.data) {
        setCache((prev) => {
          const newCache = { ...prev };
          res.data.data.data.forEach((master) => {
            // Apply filtering if specific codes were requested, otherwise take all
            if (!masterCodes || masterCodes.includes(master.lookupCode)) {
              newCache[master.lookupCode] = master.lookupDetails || [];
            }
          });
          localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
          return newCache;
        });
      }
    } catch (err) {
      console.error("Failed to fetch lookups", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getLookupDetails = useCallback(
    (masterCode: string) => {
      return cache[masterCode] || [];
    },
    [cache],
  );

  const getLookupValue = useCallback(
    (
      masterCode: string,
      detailId: string | null | undefined,
      language: string,
    ) => {
      if (!detailId) return "";
      const details = cache[masterCode] || [];
      const detail = details.find((d) => d.oid === detailId);
      if (!detail) return "";
      return language === "ar"
        ? detail.valueNameAr || detail.valueNameEn || ""
        : detail.valueNameEn || "";
    },
    [cache],
  );

  // Initial fetch of commonly used lookups if cache is empty
  const { isAuthenticated } = useAuthStore();
  useEffect(() => {
    if (isAuthenticated && Object.keys(cache).length === 0) {
      refreshLookups();
    }
  }, [cache, refreshLookups, isAuthenticated]);

  return (
    <LookupContext.Provider
      value={{ getLookupValue, getLookupDetails, refreshLookups, isLoading }}
    >
      {children}
    </LookupContext.Provider>
  );
};

export const useLookup = () => {
  const context = useContext(LookupContext);
  if (context === undefined) {
    throw new Error("useLookup must be used within a LookupProvider");
  }
  return context;
};
