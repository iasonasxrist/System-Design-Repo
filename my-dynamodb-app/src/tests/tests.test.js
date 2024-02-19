const request = require("supertest");
const app = require("../index");

describe("GET /", () => {
  test("It should respond with a welcome message", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Hello" });
  });
});

describe("GET /get-books", () => {
  test("It should respond with an array of books", async () => {
    const response = await request(app).get("/get-books");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe("POST /add-book-by-writer", () => {
  test("It should add a new book", async () => {
    const newBook = {
      id: '123',
      Title: "Test Book",
      Author: "Test Author",
      Pages: 200,
    };
    const response = await request(app)
      .post("/add-book-by-writer")
      .send(newBook);
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: "Book added successfully" });
  });
});

describe("DELETE /delete-book/:id", () => {
  test("It should delete a book by ID", async () => {
    // First, add a book to delete
    const newBook = {
      id: 456,
      Title: "Book to Delete",
      Author: "Author to Delete",
      Pages: 150,
    };
    await request(app).post("/add-book-by-writer").send(newBook);

    // Now, delete the book
    const response = await request(app).delete("/delete-book/456");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Book deleted successfully" });
  });
});
