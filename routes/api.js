"use strict";

const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to database");
  })
  .catch(() => {
    console.log("Failed to connect to database");
  });

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: [String],
});

const Book = mongoose.model("Book", bookSchema);

module.exports = function (app) {
  app
    .route("/api/books")
    .get(async (req, res) => {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      try {
        const books = await Book.find({});
        if (!books) {
          res.json([]);
          return;
        }
        const formattedBooks = books.map((book) => {
          return {
            _id: book._id,
            title: book.title,
            comments: book.comments,
            commentcount: book.comments.length,
          };
        });
        res.json(formattedBooks);
        return;
      } catch (err) {
        res.json([]);
      }
    })

    .post(async (req, res) => {
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (!title) {
        res.send("missing required field title");
        return;
      }
      const newBook = new Book({ title, comments: [] });
      try {
        const savedBook = await newBook.save();
        res.json({ _id: savedBook._id, title: savedBook.title });
      } catch (err) {
        res.send("there was an error saving");
      }
    })

    .delete(async (req, res) => {
      //if successful response will be 'complete delete successful'
      try {
        await Book.deleteMany();
        res.send("complete delete successful");
      } catch (err) {
        res.send("error");
      }
    });

  app
    .route("/api/books/:id")
    .get(async (req, res) => {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      try {
        const book = await Book.findById(bookid);
        res.json({
          comments: book.comments,
          _id: book._id,
          title: book.title,
          commentcount: book.comments.length,
        });
      } catch (err) {
        res.send("no book exists");
      }
    })

    .post(async (req, res) => {
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if (!comment) {
        res.send("missing required field comment");
        return;
      }
      try {
        let book = await Book.findById(bookid);
        book.comments.push(comment);
        book = await book.save();
        res.json({
          comments: book.comments,
          _id: book._id,
          title: book.title,
          commentcount: book.comments.length,
        });
      } catch (err) {
        res.send("no book exists");
      }
    })

    .delete(async (req, res) => {
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      try {
        const deletedBook = await Book.findByIdAndDelete(bookid);
        if (!deletedBook) throw new Error("no book exists");
        res.send("delete successful");
      } catch (err) {
        res.send("no book exists");
      }
    });
};
