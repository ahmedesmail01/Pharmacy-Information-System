import axios from "./axios";
import {
  RsdDispatchDetailRequest,
  RsdDispatchDetailResponseData,
  ApiResponse,
} from "@/types";

export const rsdService = {
  getDispatchDetail: (data: RsdDispatchDetailRequest) =>
    axios.post<ApiResponse<RsdDispatchDetailResponseData>>(
      "/RsdIntegration/dispatch-detail",
      data,
    ),
};
