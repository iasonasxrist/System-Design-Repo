const express = require("express");
const cors = require("cors");
const {
  DynamoDBClient,
  CreateTableCommand,
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
  QueryCommand,
  DeleteItemCommand,
} = require("@aws-sdk/client-dynamodb");

const Book = require("./models/Book");

const app = express();

app.use(cors());
// Middleware to parse JSON bodies
app.use(express.json());

// Configure DynamoDB client
const dynamoDBConfig = {
  region: process.env.AWS_REGION, // Change to your preferred region
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  endpoint: process.env.URL, // Local DynamoDB endpoint
};

// Initialize Dynamo to client connection
const client = new DynamoDBClient(dynamoDBConfig);

// Scan the table
app.get("/get-books", async (req, res) => {
  try {
    // Define parameters for DynamoDB scan operation
    const params = {
      TableName: "Books",
    };

    // Send Scan command to DynamoDB
    const command = new ScanCommand(params);
    const data = await client.send(command);

    console.log("Retrieved books successfully:", data);

    // Extract and return the items from the response
    // Be cautious on types of data!! May not be returned
    const books = data.Items.map((item) => {
      return {
        id: item.id.S,
        Title: item.Title.S,
        Author: item.Author.S,
        Pages: item.Pages.N,
      };
    });

    return res.status(200).json(books);
  } catch (error) {
    console.error("Unable to retrieve books:", error);
    return res.status(500).json({ error: "Unable to retrieve books" });
  }
});

// Define a route to create a table
app.get("/create-table", async (req, res) => {
  // Send the command to DynamoDB and handle the response

  try {
    // Create a new CreateTableCommand
    const params = {
      TableName: "Books",
      AttributeDefinitions: [
        { AttributeName: "ID", AttributeType: "N" },
        { AttributeName: "Title", AttributeType: "S" },
        { AttributeName: "Author", AttributeType: "S" },
        { AttributeName: "Pages", AttributeType: "N" },
      ],

      KeySchema: [
        { AttributeName: "ID", KeyType: "HASH" },
        { AttributeName: "Title", KeyType: "RANGE" },

        // Hash key
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    };
    const command = new CreateTableCommand(params);

    const data = await client.send(command);
    console.log("Table created successfully:", data);
    res.json({ message: "Table created successfully" });
  } catch (error) {
    console.error("Unable to create table:", error);
    res.status(500).json(error);
  }
});

// Update the book by Id
app.put("/update-book", async (req, res) => {
  const { id, Title, Author, Pages } = req.body;

  // Validate that all required fields are provided
  if (!id || !Title || !Author || !Pages) {
    return res
      .status(400)
      .json({ error: "All fields (id, Title, Author, Pages) are required" });
  }

  // Construct the update expression and attribute values
  const updateExpression =
    "SET Title = :title, Author = :author, Pages = :pages";
  const expressionAttributeValues = {
    ":title": { S: Title },
    ":author": { S: Author },
    ":pages": { N: Pages.toString() },
  };

  // Define parameters for the update operation
  const params = {
    TableName: "Books",
    Key: {
      id: { S: id.toString() },
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW", // Return all attributes of the updated item
  };

  try {
    // Create UpdateItem command and send it to DynamoDB
    const command = new UpdateItemCommand(params);
    const data = await client.send(command);
    console.log("Updated book successfully:", data);
    res.json({
      message: "Book updated successfully",
      updatedBook: data.Attributes,
    });
  } catch (error) {
    console.error("Unable to update book:", error);
    return res.status(500).json({ error: "Unable to update book" });
  }
});
// Get by query command a specific author
app.get("/get-books-by-author", async (req, res) => {
  try {
    // Extract the author parameter from the query string
    const { authorId } = req.query;
    console.log("🚀 ~ app.get ~ author:", authorId);

    // Validate that the author parameter is provided
    if (!authorId || isNaN(authorId)) {
      return res.status(400).json({ error: "Author parameter is required" });
    }

    // Define the parameters for the DynamoDB query operation
    const params = {
      TableName: "Books",
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: {
        ":id": { S: authorId.toString() }, // Assuming "authorId" is a number
      },
      // ConsistentRead: false,
    };

    // Send Query command to DynamoDB
    const command = new QueryCommand(params);
    const data = await client.send(command);

    if (!data.Items || data.Items.length === 0) {
      return res
        .status(404)
        .json({ message: "No books found for the provided author ID" });
    }

    console.log("Retrieved books by author successfully:", data);

    // Extract and return the items from the response
    const books = data.Items.map((item) => {
      return {
        id: item.id.S,
        Title: item.Title.S,
        Author: item.Author.S,
        Pages: item.Pages.N,
      };
    });

    return res.status(200).json(books);
  } catch (error) {
    console.error("Unable to retrieve books by author:", error);
    return res
      .status(500)
      .json({ error: "Unable to retrieve books by author" });
  }
});

// Insert data into dynamodb,  Add a book
app.post("/add-book-by-writer", async (req, res) => {
  try {
    // Extract book details from the request body
    const { id, Title, Author, Pages } = req.body;
    console.log(
      "🚀 ~ app.post ~ id, Title, Author, Pages :",
      id,
      Title,
      Author,
      Pages
    );

    // Validate that all required fields are provided
    if (!id || !Title || !Author || !Pages) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Parse Pages to ensure it's a number
    // const parsedPages = parseInt(Pages, 10);

    // Convert id to number
    const parsedId = parseInt(id, 10);

    // Create parameters for the PutItem operation
    const params = {
      TableName: "Books",
      Item: {
        id: { S: parsedId.toString() },
        Title: { S: Title },
        Author: { S: Author },
        Pages: { N: Pages },
      },
    };

    // Send PutItem command to DynamoDB
    const command = new PutItemCommand(params);
    await client.send(command);

    console.log("Added book successfully:", params.Item);

    return res.status(201).json({ message: "Book added successfully" });
  } catch (error) {
    console.error("Unable to add book:", error);
    return res.status(500).json({ error: "Unable to add book" });
  }
});

// Add mulitple writes
app.post("/add-books", async (req, res) => {
  try {
    const books = req.body;

    // Validate that books array is provided and not empty
    if (!Array.isArray(books) || books.length === 0) {
      return res
        .status(400)
        .json({ error: "Books array is required and should not be empty" });
    }

    // Construct an array of PutItemCommands for each book
    const putItemCommands = books.map((book) => {
      // Validate each book object
      if (!book.id || !book.Title || !book.Author || !book.Pages) {
        throw new Error(
          "All fields (id, Title, Author, Pages) are required for each book"
        );
      }

      // Construct parameters for PutItemCommand
      const params = {
        TableName: "Books",
        Item: {
          id: { S: book.id.toString() },
          Title: { S: book.Title },
          Author: { S: book.Author },
          Pages: { N: book.Pages.toString() },
        },
      };

      return new PutItemCommand(params);
    });

    // Execute all PutItemCommands in parallel
    await Promise.all(putItemCommands.map((command) => client.send(command)));

    console.log("Added books successfully");
    res.json({ message: "Books added successfully" });
  } catch (error) {
    console.error("Unable to add books:", error);
    return res
      .status(500)
      .json({ error: "Unable to add books", details: error.message });
  }
});

// Delete a book by Id
app.delete("/delete-book/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate that the ID parameter is provided
    if (!id) {
      return res.status(400).json({ error: "ID parameter is required" });
    }

    const params = {
      TableName: "Books",
      Key: {
        id: { S: id.toString() }, // Assuming 'id' is a number
      },
    };

    const command = new DeleteItemCommand(params);
    await client.send(command);

    console.log("Deleted book with ID:", id);
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Unable to delete book:", error);
    return res.status(500).json({ error: "Unable to delete book" });
  }
});

// Example
app.get("/", (req, res) => {
  return res.json({ message: "Hello" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
