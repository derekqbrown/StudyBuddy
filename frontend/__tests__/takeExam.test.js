// TakeExam.test.js
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import TakeExam from "../src/pages/takeExam";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import axios from "axios";

jest.mock("axios");

// Mock localStorage token
beforeEach(() => {
  Storage.prototype.getItem = jest.fn(() => "mock-token");
});

const mockExamData = {
  exam: [
    {
      question: "What is 2 + 2?",
      answers: [{ text: "3" }, { text: "4" }],
    },
  ],
};

test("renders loading state and then exam", async () => {
  axios.post.mockResolvedValueOnce({ data: mockExamData });

  render(
    <MemoryRouter initialEntries={["/take/123/MathTest"]}>
      <Routes>
        <Route path="/take/:examId/:examSetName" element={<TakeExam />} />
      </Routes>
    </MemoryRouter>
  );

  expect(screen.getByText(/preparing your exam/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText(/What is 2 \+ 2/i)).toBeInTheDocument();
  });
});

test("selecting an answer updates state", async () => {
  axios.post.mockResolvedValueOnce({ data: mockExamData });

  render(
    <MemoryRouter initialEntries={["/take/123/MathTest"]}>
      <Routes>
        <Route path="/take/:examId/:examSetName" element={<TakeExam />} />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByText("What is 2 + 2?")).toBeInTheDocument();
  });

  const answer = screen.getByLabelText("4");
  fireEvent.click(answer);

  expect(answer.checked).toBe(true);
});

test("submits answers and shows score", async () => {
  axios.post
    .mockResolvedValueOnce({ data: mockExamData }) // fetch exam
    .mockResolvedValueOnce({ data: { score: 100 } }); // submit score

  render(
    <MemoryRouter initialEntries={["/take/123/MathTest"]}>
      <Routes>
        <Route path="/take/:examId/:examSetName" element={<TakeExam />} />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => screen.getByText("What is 2 + 2?"));

  fireEvent.click(screen.getByLabelText("4"));
  fireEvent.click(screen.getByText(/submit/i));

  await waitFor(() => {
    expect(screen.getByText(/Exam Results/i)).toBeInTheDocument();
  });
});
