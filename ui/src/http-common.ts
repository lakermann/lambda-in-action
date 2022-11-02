import axios from "axios";

export function setAxiosBaseURL(baseURL: string) {
  axios.defaults.baseURL = baseURL;
}

export function setAxiosApiKey(apiKey: string) {
  axios.defaults.headers.common["x-api-key"] = apiKey;
}

axios.defaults.headers.common["traceId"] = "test-trace-id";
axios.defaults.headers.common["userId"] = "userId";
