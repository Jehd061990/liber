import axios, { AxiosHeaders } from "axios";
import { useLibraryStore } from "@/app/store/libraryStore";

const apiClient = axios.create({
  baseURL: "https://liber-be.onrender.com/api",
});

apiClient.interceptors.request.use((config) => {
  const token = useLibraryStore.getState().authToken;
  if (token) {
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }

    if (config.headers instanceof AxiosHeaders) {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      (config.headers as Record<string, string>).Authorization =
        `Bearer ${token}`;
    }
  }
  return config;
});

export default apiClient;
