import { apiFetch } from "./client";

export function listUniversities() {
  return apiFetch("/universities");
}

export function getUniversity(id) {
  return apiFetch(`/universities/${id}`);
}

export function getUniversityDetails(id) {
  return apiFetch(`/universities/${id}/details`);
}

export function getUniversityCourses(id) {
  return apiFetch(`/universities/${id}/courses`);
}

export function getUniversityDepartments(id) {
  return apiFetch(`/universities/${id}/departments`);
}

export function getUniversityStats(id) {
  return apiFetch(`/universities/${id}/stats`);
}
