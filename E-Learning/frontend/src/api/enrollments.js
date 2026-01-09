import { apiFetch } from "./client";
export function enroll(courseId) {
    return apiFetch(`/courses/${courseId}/enroll`, {
      method: "POST",
      auth: true,
    });
  }
  
  export function myEnrollments() {
    return apiFetch("/enrollments/user", { auth: true });
  }
  