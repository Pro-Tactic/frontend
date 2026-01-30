import { api } from "./api";

export async function fetchNavigation() {
  const res = await api.get("/navigation/");
  return res.data;
}