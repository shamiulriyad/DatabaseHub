import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider } from "@chakra-ui/react";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import MyLearningPage from "./pages/MyLearningPage";
import CourseLearningPage from "./pages/CourseLearningPage";

const queryClient = new QueryClient();

export default function App() {
  return (
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/my-learning" element={<MyLearningPage />} />
            <Route path="/learn/:courseId" element={<CourseLearningPage />} />
            <Route path="/learning/:courseId" element={<CourseLearningPage />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ChakraProvider>
  );
}
