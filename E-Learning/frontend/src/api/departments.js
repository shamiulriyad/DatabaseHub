import { apiFetch } from "./client";

export function listDepartments() {
  return apiFetch("/departments");
}

export function getDepartment(id) {
  return apiFetch(`/departments/${id}`);
}

export function getDepartmentCourses(id) {
  return apiFetch(`/departments/${id}/courses`);
}

export function getDepartmentStats(id) {
  return apiFetch(`/departments/${id}/stats`);
}
