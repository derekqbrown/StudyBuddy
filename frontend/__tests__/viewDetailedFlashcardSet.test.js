import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ViewFlashcardsPage from "../src/pages/viewDetailedFlashcardSet";

jest.mock("axios");

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ setName: "test-set" }),
}));

//mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

const textMatcher = (content, element) => {
  const hasText = (node) => node.textContent === content;
  const elementHasText = hasText(element);
  const childrenDontHaveText = Array.from(element.children).every(
    (child) => !hasText(child)
  );
  return elementHasText && childrenDontHaveText;
};

describe("ViewFlashcardsPage Component", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    axios.get.mockClear();
  });

  const mockFlashcards = [
    {
      flashcards: [
        { question: "Question 1", answer: "Answer 1" },
        { question: "Question 2", answer: "Answer 2" },
      ],
    },
  ];

  test("renders component title with set name", async () => {
    localStorageMock.getItem.mockReturnValueOnce("fake-token");
    axios.get.mockResolvedValueOnce({ data: mockFlashcards });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/flashcards/test-set"]}>
          <Routes>
            <Route
              path="/flashcards/:setName"
              element={<ViewFlashcardsPage />}
            />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(screen.getByText("Flashcard Set: test-set")).toBeInTheDocument();
  });

  test("shows error when user is not logged in", async () => {
    localStorageMock.getItem.mockReturnValueOnce(null);

    await act(async () => {
      render(<ViewFlashcardsPage />);
    });

    expect(screen.getByText("You are not logged in!")).toBeInTheDocument();
    expect(axios.get).not.toHaveBeenCalled();
  });

  test("fetches and displays flashcards correctly", async () => {
    localStorageMock.getItem.mockReturnValueOnce("fake-token");
    axios.get.mockResolvedValueOnce({ data: mockFlashcards });

    await act(async () => {
      render(<ViewFlashcardsPage />);
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "http://34.217.210.224:3000/flashcards/test-set",
        { headers: { Authorization: "Bearer fake-token" } }
      );
    });

    expect(
      screen.getByText(
        (content, element) =>
          content.includes("Question 1") &&
          element.tagName.toLowerCase() === "p"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        (content, element) =>
          content.includes("Question 2") &&
          element.tagName.toLowerCase() === "p"
      )
    ).toBeInTheDocument();
  });

  test("handles API error gracefully", async () => {
    localStorageMock.getItem.mockReturnValueOnce("fake-token");
    axios.get.mockRejectedValueOnce(new Error("Network error"));

    await act(async () => {
      render(<ViewFlashcardsPage />);
    });

    expect(screen.getByText("Failed to load flashcards.")).toBeInTheDocument();
  });

  test("displays message when no flashcards are found", async () => {
    localStorageMock.getItem.mockReturnValueOnce("fake-token");
    axios.get.mockResolvedValueOnce({ data: [] });

    await act(async () => {
      render(<ViewFlashcardsPage />);
    });

    expect(screen.getByText("No flashcards found.")).toBeInTheDocument();
  });

  test("correctly flattens nested flashcard data structure", async () => {
    localStorageMock.getItem.mockReturnValueOnce("fake-token");
    const complexNestedData = [
      {
        flashcards: [
          { question: "Q1", answer: "A1" },
          { question: "Q2", answer: "A2" },
        ],
      },
      {
        flashcards: [{ question: "Q3", answer: "A3" }],
      },
    ];

    axios.get.mockResolvedValueOnce({ data: complexNestedData });

    await act(async () => {
      render(<ViewFlashcardsPage />);
    });

    expect(
      screen.getByText((content) => content.includes("Q1"))
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes("Q2"))
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes("Q3"))
    ).toBeInTheDocument();
  });
});
