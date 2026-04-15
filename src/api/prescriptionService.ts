import axios from "axios";

const IS_PROD = import.meta.env.PROD;
const DEV_PRESCRIPTION_URL =
  import.meta.env.VITE_PRESCRIPTION_API_URL || "http://50.6.228.16:8000";

// ─── Response Types ──────────────────────────────────────────────────────────

export interface PrescriptionMedicineMatching {
  input_type: string;
  active: string | null;
  category: string | null;
  confidence: string;
  note: string | null;
  matches: string[];
}

export interface PrescriptionMedicine {
  ocr_name: string;
  cleaned_name: string;
  dose: string | null;
  frequency: string | null;
  duration: string | null;
  route: string | null;
  notes: string | null;
  read_confidence: string;
  corrected_from: string | null;
  matching: PrescriptionMedicineMatching;
}

export interface PrescriptionOCR {
  doctor: string;
  patient: string;
  date: string;
  confidence: string;
  raw_text: string;
}

export interface PrescriptionAnalysisResponse {
  generated_at: string;
  image: string;
  ocr: PrescriptionOCR;
  medicines: PrescriptionMedicine[];
  summary: {
    total: number;
    found: number;
    not_found: number;
  };
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const prescriptionService = {
  /**
   * Upload a prescription image for AI analysis.
   *
   * - Dev:  hits the ML backend directly (http://…:8000/analyze)
   * - Prod: routes through Netlify function to avoid mixed-content block
   */
  analyze: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const url = IS_PROD
      ? "/.netlify/functions/prescription-proxy"
      : `${DEV_PRESCRIPTION_URL}/analyze`;

    return axios.post<PrescriptionAnalysisResponse>(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000, // 2 min — AI analysis can be slow
    });
  },
};
