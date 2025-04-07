const userService = require("../service/userService");
const userDAO = require("../repository/userDAO");
const bcrypt = require("bcrypt");

jest.mock("../repository/userDAO");
jest.mock("bcrypt");

describe("User Service", () => {
    const username = "testUser";
    const password = "testPassword";
    const userId = "USER#1";
    const hashedPassword = "hashed_password";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getUser", () => {
        it("should return a user when found", async () => {
            userDAO.getUser.mockResolvedValueOnce({ username });

            const result = await userService.getUser(username);
            expect(result).toEqual({ username });
            expect(userDAO.getUser).toHaveBeenCalledWith(username);
        });

        it("should return null when user is not found", async () => {
            userDAO.getUser.mockResolvedValueOnce(null);

            const result = await userService.getUser(username);
            expect(result).toBeNull();
        });
    });

    describe("createUser", () => {
        it("should create a user successfully", async () => {
            bcrypt.hash.mockResolvedValueOnce(hashedPassword);
            userDAO.createUser.mockResolvedValueOnce({ username });

            const result = await userService.createUser(username, password);
            expect(result).toEqual({ username });
            expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
            expect(userDAO.createUser).toHaveBeenCalledWith(username, hashedPassword);
        });
    });

    describe("updateUser", () => {
        it("should update a user successfully", async () => {
            bcrypt.hash.mockResolvedValueOnce(hashedPassword);
            userDAO.updateUser.mockResolvedValueOnce({ username });

            const result = await userService.updateUser(userId, username, password);
            expect(result).toEqual({ username });
            expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
            expect(userDAO.updateUser).toHaveBeenCalledWith(userId, username, hashedPassword);
        });

        it("should return null if user update fails", async () => {
            userDAO.updateUser.mockResolvedValueOnce(null);

            const result = await userService.updateUser(userId, username, password);
            expect(result).toBeNull();
        });
    });

    describe("deleteUser", () => {
        it("should delete a user successfully", async () => {
            userDAO.deleteUser.mockResolvedValueOnce({ message: "User deleted successfully" });

            const result = await userService.deleteUser(userId);
            expect(result).toEqual({ message: "User deleted successfully" });
            expect(userDAO.deleteUser).toHaveBeenCalledWith(userId);
        });
    });
});