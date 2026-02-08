import axios from "axios";
import { useLibraryStore } from "@/app/store/libraryStore";

const apiClient = axios.create({
  baseURL: "https://liber-be.onrender.com/api",
});

apiClient.interceptors.request.use((config) => {
  const token = useLibraryStore.getState().authToken;
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

export default apiClient;
