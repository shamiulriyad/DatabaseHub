import { apiFetch } from "./client";

export const getCourseModules = async (courseId) => {
  try {
    const res = await apiFetch(`/courses/${courseId}/modules`);
    return res.modules ?? [];
  } catch (err) {
    console.warn("Modules not available yet:", err.message);
    return []; // ✅ prevent crash
  }
};
