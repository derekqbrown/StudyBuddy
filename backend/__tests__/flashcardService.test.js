const flashcardService = require("../service/flashcardService"); 
const flashcardDAO = require("../repository/flashcardDAO"); 
const { v4: uuidv4 } = require("uuid");

jest.mock("../repository/flashcardDAO");
jest.mock("uuid");

describe("Flashcard Service", () => {
  const userId = "USER#123";
  const flashcardSetName = "Spanish Vocabulary";
  const flashcards = [{ front: "hola", back: "hello" }, { front: "gracias", back: "thank you" }];
  const setId = "mock-uuid-456";
  const flashcardSetJson = JSON.stringify({ flashcards });
  const allFlashcardSetsData = [{ id: "set1", name: "Set One" }, { id: "set2", name: "Set Two" }];
  const singleFlashcardSetData = { id: setId, name: flashcardSetName, flashcards };
  const selectedSet = "my-sets";

  beforeEach(() => {
    jest.clearAllMocks();
    uuidv4.mockReturnValue(setId); 
  });

  describe("saveFlashcards", () => {
    it("should save flashcards and return the set ID on success", async () => {
      flashcardDAO.saveFlashcardSetToS3.mockResolvedValueOnce();
      flashcardDAO.saveFlashcardSetMetadata.mockResolvedValueOnce();

      const result = await flashcardService.saveFlashcards(userId, flashcardSetName, flashcards);

      expect(uuidv4).toHaveBeenCalledTimes(1);
      expect(flashcardDAO.saveFlashcardSetToS3).toHaveBeenCalledWith(
        userId,
        setId,
        flashcardSetName,
        flashcardSetJson
      );
      expect(flashcardDAO.saveFlashcardSetMetadata).toHaveBeenCalledWith(
        userId,
        setId,
        flashcardSetName
      );
      expect(result).toBe(setId);
    });

    it("should throw an error if saving to S3 fails", async () => {
      const errorMessage = "Failed to save to S3";
      flashcardDAO.saveFlashcardSetToS3.mockRejectedValueOnce(new Error(errorMessage));

      await expect(
        flashcardService.saveFlashcards(userId, flashcardSetName, flashcards)
      ).rejects.toThrow(errorMessage);

      expect(uuidv4).toHaveBeenCalledTimes(1);
      expect(flashcardDAO.saveFlashcardSetToS3).toHaveBeenCalledWith(
        userId,
        setId,
        flashcardSetName,
        flashcardSetJson
      );
      expect(flashcardDAO.saveFlashcardSetMetadata).not.toHaveBeenCalled();
    });

    it("should throw an error if saving metadata fails", async () => {
      flashcardDAO.saveFlashcardSetToS3.mockResolvedValueOnce();
      const errorMessage = "Failed to save metadata";
      flashcardDAO.saveFlashcardSetMetadata.mockRejectedValueOnce(new Error(errorMessage));

      await expect(
        flashcardService.saveFlashcards(userId, flashcardSetName, flashcards)
      ).rejects.toThrow(errorMessage);

      expect(uuidv4).toHaveBeenCalledTimes(1);
      expect(flashcardDAO.saveFlashcardSetToS3).toHaveBeenCalledWith(
        userId,
        setId,
        flashcardSetName,
        flashcardSetJson
      );
      expect(flashcardDAO.saveFlashcardSetMetadata).toHaveBeenCalledWith(
        userId,
        setId,
        flashcardSetName
      );
    });
  });

  describe("getAllFlashcardSets", () => {
    it("should return an array of flashcard sets when found", async () => {
      flashcardDAO.getAllFlashcardSets.mockResolvedValueOnce(allFlashcardSetsData);

      const result = await flashcardService.getAllFlashcardSets(userId);

      expect(flashcardDAO.getAllFlashcardSets).toHaveBeenCalledWith(userId);
      expect(result).toEqual(allFlashcardSetsData);
    });

    it("should return false when no flashcard sets are found", async () => {
      flashcardDAO.getAllFlashcardSets.mockResolvedValueOnce(null);

      const result = await flashcardService.getAllFlashcardSets(userId);

      expect(flashcardDAO.getAllFlashcardSets).toHaveBeenCalledWith(userId);
      expect(result).toBe(false);
    });

    it("should handle errors from the DAO and rethrow them", async () => {
      const errorMessage = "Failed to get all flashcard sets";
      flashcardDAO.getAllFlashcardSets.mockRejectedValueOnce(new Error(errorMessage));

      await expect(flashcardService.getAllFlashcardSets(userId)).rejects.toThrow(errorMessage);
      expect(flashcardDAO.getAllFlashcardSets).toHaveBeenCalledWith(userId);
    });
  });

  describe("getSetById", () => {
    it("should return the flashcard set when found", async () => {
      flashcardDAO.getSetById.mockResolvedValueOnce(singleFlashcardSetData);

      const result = await flashcardService.getSetById(userId, setId);

      expect(flashcardDAO.getSetById).toHaveBeenCalledWith(userId, setId);
      expect(result).toEqual(singleFlashcardSetData);
    });

    it("should return false when the flashcard set is not found", async () => {
      flashcardDAO.getSetById.mockResolvedValueOnce(null);

      const result = await flashcardService.getSetById(userId, setId);

      expect(flashcardDAO.getSetById).toHaveBeenCalledWith(userId, setId);
      expect(result).toBe(false);
    });

    it("should handle errors from the DAO and rethrow them", async () => {
      const errorMessage = "Failed to get flashcard set by ID";
      flashcardDAO.getSetById.mockRejectedValueOnce(new Error(errorMessage));

      await expect(flashcardService.getSetById(userId, setId)).rejects.toThrow(
        errorMessage
      );
      expect(flashcardDAO.getSetById).toHaveBeenCalledWith(userId, setId);
    });
  });
});