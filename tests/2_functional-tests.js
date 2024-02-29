const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

let bookid;
const timeout = 10000;

suite("Functional Tests", function () {
  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */
  test("#example Test GET /api/books", function (done) {
    chai
      .request(server)
      .get("/api/books")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, "response should be an array");
        assert.property(
          res.body[0],
          "commentcount",
          "Books in array should contain commentcount"
        );
        assert.property(
          res.body[0],
          "title",
          "Books in array should contain title"
        );
        assert.property(
          res.body[0],
          "_id",
          "Books in array should contain _id"
        );
        done();
      })
      .timeout(timeout);
  });
  /*
   * ----[END of EXAMPLE TEST]----
   */

  suite("Routing tests", function () {
    suite(
      "POST /api/books with title => create book object/expect book object",
      function () {
        test("Test POST /api/books with title", function (done) {
          chai
            .request(server)
            .post("/api/books")
            .send({ title: "test-title" })
            .end((err, res) => {
              assert.equal(res.status, 200);
              bookid = res.body._id;
              assert.equal(res.body.title, "test-title");
              done();
            })
            .timeout(timeout);
        });

        test("Test POST /api/books with no title given", function (done) {
          chai
            .request(server)
            .post("/api/books")
            .send({})
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.equal(res.text, "missing required field title");
              done();
            })
            .timeout(timeout);
        });
      }
    );

    suite("GET /api/books => array of books", function () {
      test("Test GET /api/books", function (done) {
        chai
          .request(server)
          .get("/api/books")
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body, "it is an array");
            done();
          })
          .timeout(timeout);
      });
    });

    suite("GET /api/books/[id] => book object with [id]", function () {
      test("Test GET /api/books/[id] with id not in db", function (done) {
        chai
          .request(server)
          .get("/api/books/invalidId")
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "no book exists");
            done();
          })
          .timeout(timeout);
      });

      test("Test GET /api/books/[id] with valid id in db", function (done) {
        chai
          .request(server)
          .get("/api/books/" + bookid)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.title, "test-title");
            done();
          })
          .timeout(timeout);
      });
    });

    suite(
      "POST /api/books/[id] => add comment/expect book object with id",
      function () {
        test("Test POST /api/books/[id] with comment", function (done) {
          chai
            .request(server)
            .post("/api/books/" + bookid)
            .send({ comment: "test-comment" })
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.equal(res.body.comments[0], "test-comment");
              done();
            })
            .timeout(timeout);
        });

        test("Test POST /api/books/[id] without comment field", function (done) {
          chai
            .request(server)
            .post("/api/books/" + bookid)
            .send({})
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.equal(res.text, "missing required field comment");
              done();
            })
            .timeout(timeout);
        });

        test("Test POST /api/books/[id] with comment, id not in db", function (done) {
          chai
            .request(server)
            .get("/api/books/invalidId")
            .send({ comment: "test-comment" })
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.equal(res.text, "no book exists");
              done();
            })
            .timeout(timeout);
        });
      }
    );

    suite("DELETE /api/books/[id] => delete book object id", function () {
      test("Test DELETE /api/books/[id] with valid id in db", function (done) {
        chai
          .request(server)
          .delete("/api/books/" + bookid)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "delete successful");
            done();
          })
          .timeout(timeout);
      });

      test("Test DELETE /api/books/[id] with  id not in db", function (done) {
        chai
          .request(server)
          .delete("/api/books/invalidId")
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "no book exists");
            done();
          })
          .timeout(timeout);
      });
    });
  });
});
