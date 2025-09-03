import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "applicastion/json",
  },
});

export default apiClient;
