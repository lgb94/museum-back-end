const request = require("supertest");
const app = require(`${__dirname}/../app`);
const data = require(`${__dirname}/../db/data/test-data`);
const seed = require(`${__dirname}/../db/seeds/seed`);
const db = require(`${__dirname}/../db/connection`);

beforeEach(() => seed(data));
afterAll(() => db.end());

// API ENDPOINTS REQUEST

describe("GET /api", () => {
  test("GET /api gives status 200: sends back an object with available endpoints.", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(typeof body).toBe("object");
      });
  });
});

// USER REQUESTS - GET POST PATCH DELETE

describe("GET /api/users", () => {
  test('GET /api/users gives status 200: sends back an object with key "users", with a value of an array containing ALL users in the database (test expecting 10 users). Each user has keys user_id, username, email, password. Password is hashed successfully.', () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const usersResultsArray = body.users;
        expect(usersResultsArray.length).toEqual(10);
        usersResultsArray.forEach((user) => {
          expect(user).toEqual({
            user_id: expect.any(Number),
            username: expect.any(String),
            email: expect.any(String),
            password: expect.any(String),
          });
        });
        expect(usersResultsArray[0].password).not.toEqual("password123");
      });
  });
});

describe("GET /api/users/:user_id", () => {
  test('GET /api/users/5 (a valid user ID) gives status 200: sends back an object with key "user", value of an object reflecting user with given ID', () => {
    return request(app)
      .get("/api/users/5")
      .expect(200)
      .then(({ body }) => {
        expect(body).toMatchObject({
          user: expect.any(Object),
        });
        const user = body.user;
        expect(user).toMatchObject({
          username: "user005",
          email: "user005@email.com",
          password: expect.any(String),
        });
      });
  });
  test('GET /api/users/15 (an invalid user ID - ID doesnt exist) gives status 404: responds with custom error message on an object, key "msg" ', () => {
    return request(app)
      .get("/api/users/15")
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: "bad request - user_id not recognised",
        });
      });
  });
});

describe("GET /api/users/email/:email", () => {
  test('GET /api/users/email/user005@email.com (a valid email) gives status 200: sends back an object with key "user", value of an object reflecting user with given ID', () => {
    return request(app)
      .get("/api/users/email/user005@email.com")
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          user: expect.any(Object),
        });
        const user = body.user;
        expect(user).toMatchObject({
          username: "user005",
          email: "user005@email.com",
          password: expect.any(String),
        });
      });
  });
  test('GET /api/users/email/user015@email.com (an invalid email - email doesnt exist) gives status 404: responds with custom error message on an object, key "msg" ', () => {
    return request(app)
      .get("/api/users/email/user015@email.com")
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: "bad request - email not recognised",
        });
      });
  });
});

describe("POST /api/users/login", () => {
  test('GET /api/users/login with valid credentials sent on the request body responds with a status 200 and that users information on a key of "user".', () => {
    return request(app)
      .post("/api/users/login")
      .send({
        email: 'user001@email.com',
        password: 'password123'
      })
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          user: expect.any(Object),
        });
        const user = body.user;
        expect(user).toMatchObject({
          username: "user001",
          email: "user001@email.com",
          password: expect.any(String),
        });
      });
  });
  test('GET /api/users/login with INVALID credentials sent on the request body (wrong password) responds with a status 401 and error message "wrong email/password".', () => {
    return request(app)
      .post("/api/users/login")
      .send({
        email: 'user001@email.com',
        password: 'password23'
      })
      .expect(401)
      .then(({ body }) => {
        const errorMessage = body.msg
        expect(errorMessage).toBe('wrong email/password')
      });
  });
});

describe("GET /api/users/username/:username", () => {
  test('GET /api/users/username/user005 (a valid username) gives status 200: sends back an object with key "user", value of an object reflecting user with given ID', () => {
    return request(app)
      .get("/api/users/username/user005")
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          user: expect.any(Object),
        });
        const user = body.user;
        expect(user).toMatchObject({
          username: "user005",
          email: "user005@email.com",
          password: expect.any(String),
        });
      });
  });
  test('GET /api/users/username/user015 (an invalid username - username doesnt exist) gives status 404: responds with custom error message on an object, key "msg" ', () => {
    return request(app)
      .get("/api/users/username/user015")
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: "bad request - username not recognised",
        });
      });
  });
});

describe("POST /api/users", () => {
  test("POST /api/users with a valid new user (valid unique email, valid unique username, valid password, no other keys) returns status 200, adds given user to the user table, returns object, key user, value - object with new user table entry.", () => {
    return request(app)
      .post("/api/users")
      .send({
        username: "user011",
        email: "user011@email.com",
        password: "password420",
      })
      .expect(200)
      .then(({ body }) => {
        const user = body.user;
        expect(user).toMatchObject({
          user_id: 11,
          username: "user011",
          email: "user011@email.com",
          password: expect.any(String),
        });
      });
  });
  test('POST /api/users rejects the request if a username already exists, responds with an appropriate message on an object, key "msg".', () => {
    return request(app)
      .post("/api/users")
      .send({
        username: "user001",
        email: "user012@email.com",
        password: "password6969",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: "already in database",
        });
      });
  });
  test('POST /api/users rejects the request if an email is already in use, responds with an appropriate message on an object, key "msg".', () => {
    return request(app)
      .post("/api/users")
      .send({
        username: "user012",
        email: "user001@email.com",
        password: "password6969",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: "already in database",
        });
      });
  });
});

describe("PATCH /api/users/:user_id", () => {
  test('PATCH /api/users/5 with an object sent with key "new_username", value "bob123" (valid new username) updates the relevant user with their new chosen username, responding with that users updated information on an object: key "user", value an object with updated information (status 200).', () => {
    return request(app)
      .patch("/api/users/5")
      .send({
        new_username: "bob123",
      })
      .expect(200)
      .then(({ body }) => {
        expect(body.user).toMatchObject({
          username: "bob123",
          email: "user005@email.com",
          password: expect.any(String),
        });
      });
  });
  test('PATCH /api/users/5 with an object sent with key "new_username", value "user006" (invalid new username - already taken) gives the correct error status (400) with relevant message.', () => {
    return request(app)
      .patch("/api/users/5")
      .send({
        new_username: "user006",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: "already in database",
        });
      });
  });
  test('PATCH /api/users/5 with an object sent with key "new_email", value "bob123@email.com" (valid new email) updates the relevant user with their new chosen email, responding with that users updated information on an object: key "user", value an object with updated information (status 200).', () => {
    return request(app)
      .patch("/api/users/5")
      .send({
        new_email: "bob123@email.com",
      })
      .expect(200)
      .then(({ body }) => {
        expect(body.user).toMatchObject({
          username: "user005",
          email: "bob123@email.com",
          password: expect.any(String),
        });
      });
  });
  test('PATCH /api/users/5 with an object sent with key "new_email", value "user006@email.com" (invalid new email - already taken) gives the correct error status (400) with relevant message.', () => {
    return request(app)
      .patch("/api/users/5")
      .send({
        new_email: "user006@email.com",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: "already in database",
        });
      });
  });
  test('PATCH /api/users/5 with an object sent with key "new_password", value "brandnewpassword" (valid new password) updates the relevant user with their hashed new password, responding with that users updated information on an object: key "user", value an object with updated information (status 200).', () => {
    return request(app)
      .patch("/api/users/5")
      .send({
        new_password: "brandnewpassword",
      })
      .expect(200)
      .then(({ body }) => {
        expect(body.user).toMatchObject({
          username: "user005",
          email: "user005@email.com",
          password: expect.any(String),
        });
        let user = body.user;
        expect(user.password).not.toEqual("brandnewpassword");
      });
  });
  test('PATCH /api/users/15 patch request to an invalid id (id doesnt exist) responds with status 404, an object with key "msg", value "bad request - user_id not recognised".', () => {
    return request(app)
      .patch("/api/users/15")
      .send({
        new_username: "bob123",
      })
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: "bad request - user_id not recognised",
        });
      });
  });
});

describe("DELETE /api/users/:user_id", () => {
  test("DELETE /api/users/5 - a valid delete request removes the user with the corresponding id provided correctly removes the user, responding with status 204 and an empty object in response.", () => {
    return request(app)
      .delete("/api/users/5")
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
      });
  });
  test(`DELETE /api/users/15 - an invalid delete request (user_id doesnt exist), responds with status 404 and an object with key "msg", value "bad request - user_id not recognised".`, () => {
    return request(app)
      .delete("/api/users/15")
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: "bad request - user_id not recognised",
        });
      });
  });
});

// OBJECT REQUESTS - GET ALL, QUERIES, SORTING, PAGINATION

describe("GET /api/objects", () => {
  test('GET /api/objects gives status 200: sends object with key "results", value of an object containing multiple keys of information: objects: an array containing ALL objects in db with object info keys (expecting 10). totalRecords: the total amount of objects returned for the search (10) totalPages: the total amount of pages for the search (1) currentPage: the page returned (1) limit: the amount of results on each page (10) Limits and pages are default values, objects returned should be sorted by default (object_id ASC).', () => {
    return request(app)
      .get("/api/objects")
      .expect(200)
      .then(({ body }) => {
        const totalRecords = body.results.totalRecords;
        expect(totalRecords).toBe(10);
        const totalPages = body.results.totalPages;
        expect(totalPages).toBe(1);
        const currentPage = body.results.currentPage;
        expect(currentPage).toBe(1);
        const limit = body.results.limit;
        expect(limit).toBe(10);
        const objectsResultsArray = body.results.objects;
        expect(objectsResultsArray.length).toEqual(10);
        objectsResultsArray.forEach((object) => {
          expect(object).toEqual({
            object_id: expect.any(Number),
            title: expect.any(String),
            culture: expect.any(String),
            period: expect.any(String),
            object_begin_date: expect.any(Number),
            object_end_date: expect.any(Number),
            medium: expect.any(String),
            classification: expect.any(String),
            primary_image: expect.any(String),
            object_url: expect.any(String),
            museum_dataset: expect.any(String),
          });
        });
        expect(objectsResultsArray[0].object_id).toBeLessThan(
          objectsResultsArray[1].object_id
        );
      });
  });
  test('GET /api/objects?culture=Roman correctly takes one query, giving a status 200 and sneding back all objects with a museum_dataset of "harvard". Objects are sorted by their object_id in ascending order (default)', () => {
    return request(app)
      .get("/api/objects?museum_dataset=harvard")
      .expect(200)
      .then(({ body }) => {
        const totalRecords = body.results.totalRecords;
        expect(totalRecords).toBe(4);
        const objectsResultsArray = body.results.objects;
        expect(objectsResultsArray.length).toBe(4);
        objectsResultsArray.forEach((object) => {
          expect(object).toEqual({
            object_id: expect.any(Number),
            title: expect.any(String),
            culture: expect.any(String),
            period: expect.any(String),
            object_begin_date: expect.any(Number),
            object_end_date: expect.any(Number),
            medium: expect.any(String),
            classification: expect.any(String),
            primary_image: expect.any(String),
            object_url: expect.any(String),
            museum_dataset: "harvard",
          });
        });
        expect(objectsResultsArray[0].object_id).toBeLessThan(
          objectsResultsArray[1].object_id
        );
        expect(objectsResultsArray[1].object_id).toBeLessThan(
          objectsResultsArray[2].object_id
        );
        expect(objectsResultsArray[2].object_id).toBeLessThan(
          objectsResultsArray[3].object_id
        );
      });
  });
  test('GET /api/objects?culture=Greek&classification=Sculpture correctly takes more than one query giving a status 200 and sneding back all objects with a culture value of "Greek", and a classification of "Sculpture" (3 objects). Objects are sorted by their object_id in ascending order (default)', () => {
    return request(app)
      .get("/api/objects?culture=Greek&classification=Sculpture")
      .expect(200)
      .then(({ body }) => {
        const totalRecords = body.results.totalRecords;
        expect(totalRecords).toBe(3);
        const objectsResultsArray = body.results.objects;
        expect(objectsResultsArray.length).toBe(3);
        objectsResultsArray.forEach((object) => {
          expect(object).toEqual({
            object_id: expect.any(Number),
            title: expect.any(String),
            culture: "Greek",
            period: expect.any(String),
            object_begin_date: expect.any(Number),
            object_end_date: expect.any(Number),
            medium: expect.any(String),
            classification: "Sculpture",
            primary_image: expect.any(String),
            object_url: expect.any(String),
            museum_dataset: expect.any(String),
          });
        });
        expect(objectsResultsArray[0].object_id).toBeLessThan(
          objectsResultsArray[1].object_id
        );
        expect(objectsResultsArray[1].object_id).toBeLessThan(
          objectsResultsArray[2].object_id
        );
      });
  });
  test('GET /api/objects?object_begin_date=0&object_begin_date_operator=<&sortBy=object_end_date&sortOrder=desc correctly takes more a query for objects older than a certain date (0), correctly applying the "<" operator. Also correctly sorts objects by newest first (end date DESC) instead of default sorting. ', () => {
    return request(app)
      .get(
        "/api/objects?object_begin_date=0&object_begin_date_operator=<&sortBy=object_end_date&sortOrder=desc"
      )
      .expect(200)
      .then(({ body }) => {
        const totalRecords = body.results.totalRecords;
        const objectsResultsArray = body.results.objects;
        expect(totalRecords).toBe(7);
        expect(objectsResultsArray.length).toBe(7);
        objectsResultsArray.forEach((object) => {
          expect(object).toEqual({
            object_id: expect.any(Number),
            title: expect.any(String),
            culture: expect.any(String),
            period: expect.any(String),
            object_begin_date: expect.any(Number),
            object_end_date: expect.any(Number),
            medium: expect.any(String),
            classification: expect.any(String),
            primary_image: expect.any(String),
            object_url: expect.any(String),
            museum_dataset: expect.any(String),
          });
          expect(object.object_begin_date).toBeLessThan(0);
        });
        expect(objectsResultsArray[0].object_end_date).toBeGreaterThanOrEqual(
          objectsResultsArray[1].object_end_date
        );
        expect(objectsResultsArray[1].object_end_date).toBeGreaterThanOrEqual(
          objectsResultsArray[2].object_end_date
        );
      });
  });
  test("GET /api/objects?limit=5&page=2 correctly takes more a query for object limit and pagination - in this case limiting each page to 5 results and sending back page 2 (objects 6 - 10). ", () => {
    return request(app)
      .get("/api/objects?limit=5&page=2")
      .expect(200)
      .then(({ body }) => {
        const totalRecords = body.results.totalRecords;
        const objectsResultsArray = body.results.objects;
        const totalPages = body.results.totalPages;
        const currentPage = body.results.currentPage;
        const limit = body.results.limit;
        expect(currentPage).toBe(2);
        expect(totalPages).toBe(2);
        expect(limit).toBe(5);
        expect(totalRecords).toBe(10);
        expect(objectsResultsArray.length).toBe(5);
        objectsResultsArray.forEach((object) => {
          expect(object).toEqual({
            object_id: expect.any(Number),
            title: expect.any(String),
            culture: expect.any(String),
            period: expect.any(String),
            object_begin_date: expect.any(Number),
            object_end_date: expect.any(Number),
            medium: expect.any(String),
            classification: expect.any(String),
            primary_image: expect.any(String),
            object_url: expect.any(String),
            museum_dataset: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/objects/:object_id", () => {
  test('GET /api/objects/1 gives status 200: sends relevant object on key "object", according to object id in request URL.', () => {
    return request(app)
      .get("/api/objects/1")
      .expect(200)
      .then(({ body }) => {
        const object = body.object
          expect(object).toMatchObject({
            object_id: 1,
            title: expect.any(String),
            culture: expect.any(String),
            period: expect.any(String),
            object_begin_date: expect.any(Number),
            object_end_date: expect.any(Number),
            medium: expect.any(String),
            classification: expect.any(String),
            primary_image: expect.any(String),
            object_url: expect.any(String),
            museum_dataset: expect.any(String),
          });
        });
      });
      test('GET /api/objects/11516516 gives status 404: sends error message: bad request - object_id not recognised.', () => {
        return request(app)
          .get("/api/objects/11516516")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toEqual('bad request - object_id not recognised')
            });
          });
  });


// EXHIBIT REQUESTS

//GET ALL EXHIBITS

describe("GET /api/exhibits", () => {
  test('GET /api/exhibits gives status 200: sends object with key "exhibits", value: array containing ALL exhibits in db (expecting 3). Each has keys exhibit_id, title, description, curator_id, created_at. Adds an object_count row with correct amount of objects, as well as a curator_username row with username corresponding to curator_id.', () => {
    return request(app)
      .get("/api/exhibits")
      .expect(200)
      .then(({ body }) => {
        const exhibitsResultsArray = body.exhibits;
        expect(exhibitsResultsArray.length).toEqual(3);
        exhibitsResultsArray.forEach((exhibit) => {
          expect(exhibit).toEqual({
            exhibit_id: expect.any(Number),
            title: expect.any(String),
            description: expect.any(String),
            curator_id: expect.any(Number),
            created_at: expect.any(String),
            object_count: expect.any(Number),
            curator_username: expect.any(String),
          });
        });
      });
  });
});

// GET EXHIBITS - EXHIBIT_ID

describe("GET /api/exhibits/:exhibit_id", () => {
  test('GET /api/exhibits/1 (a valid exhibit_ID) gives status 200: sends back an object with key "exhibit", value of an object reflecting exhibit with given ID. Also adds an accurate count of objects within exhibit and the curators username.', () => {
    return request(app)
      .get("/api/exhibits/1")
      .expect(200)
      .then(({ body }) => {
        expect(body).toMatchObject({
          exhibit: expect.any(Object),
        });
        const exhibit = body.exhibit;
        expect(exhibit).toMatchObject({
          exhibit_id: 1,
          title: "Sculpture of the Ancient World",
          description:
            "A collection showcasing sculptures from various ancient cultures.",
          curator_id: 1,
          created_at: expect.any(String),
          object_count: 2,
          curator_username: "user001",
        });
      });
  });
  test('GET /api/exhibits/15 (an invalid exhibit ID) gives status 404: responds with custom error message on an object, key "msg", value "exhibit_id not recognised"', () => {
    return request(app)
      .get("/api/exhibits/15")
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: "bad request - exhibit_id not recognised",
        });
      });
  });
});

//GET EXHIBITS - USER_ID

describe("GET /api/exhibits/user/:user_id", () => {
  test('GET /api/exhibits/user/1 (a valid user_ID) gives status 200: sends back an object with key "exhibits", value of an object reflecting all exhibits "curated" (made) by given user id. Each exhibit has an object_count row reflecting all objects of that exhibit, plus a curator username field with username that coresponds to given id.', () => {
    return request(app)
      .get("/api/exhibits/user/1")
      .expect(200)
      .then(({ body }) => {
        expect(body).toMatchObject({
          exhibits: expect.any(Object),
        });
        const exhibits = body.exhibits;
        expect(exhibits.length).toBe(2);
        expect(exhibits[0]).toMatchObject({
          exhibit_id: 1,
          title: "Sculpture of the Ancient World",
          description:
            "A collection showcasing sculptures from various ancient cultures.",
          curator_id: 1,
          created_at: expect.any(String),
          object_count: expect.any(Number),
          curator_username: "user001",
        });
      });
  });
  test('GET /api/exhibits/user/5 (an invalid user_ID - exists, no exhibits) gives status 404: responds with custom error message on an object, key "msg", value "no exhibits matching user_id" ', () => {
    return request(app)
      .get("/api/exhibits/user/5")
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: "bad request - no exhibits matching user_id",
        });
      });
  });
  test('GET /api/exhibits/user/15 (an invalid user_ID - doesnt exist) gives status 404: responds with custom error message on an object, key "msg", value "no exhibits matching user_id" ', () => {
    return request(app)
      .get("/api/exhibits/user/15")
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: "bad request - no exhibits matching user_id",
        });
      });
  });
});

//POST - NEW EXHIBIT (req title, description, user_id)

// RETURN TO THIS - we'll need to do an if statement if key values for new tit/desc ==== ""

describe("POST /api/exhibits", () => {
  test("POST /api/exhibits with a valid new exhibit (valid title, description, user_id, no other keys) returns status 200, adds given exhibit to the exhibit table, returns object, key exhibit, value - object with new exhibit table entry. Has an object count of 0 since its new.", () => {
    return request(app)
      .post("/api/exhibits")
      .send({
        title: "new exhibit",
        description: "cool stuff i like",
        user_id: 3,
      })
      .expect(200)
      .then(({ body }) => {
        const exhibit = body.exhibit;
        expect(exhibit).toMatchObject({
          exhibit_id: 4,
          title: "new exhibit",
          description: "cool stuff i like",
          curator_id: 3,
          created_at: expect.any(String),
          object_count: 0,
        });
      });
  });
  xtest("POST /api/exhibits sets the default title and description if no value is given for those respective fields.", () => {
    return request(app)
      .post("/api/exhibits")
      .send({
        title: null,
        description: null,
        user_id: 3,
      })
      .expect(200)
      .then(({ body }) => {
        const exhibit = body.exhibit;
        expect(exhibit).toMatchObject({
          exhibit_id: 4,
          title: "new exhibit",
          description: "cool stuff i like",
          curator_id: 3,
          created_at: expect.any(String),
          object_count: 0,
        });
      });
  });
});

//PATCH - UPDATE EXISTING EXHIBIT (change title, description)

describe("PATCH /api/exhibits/:exhibit_id", () => {
  test('PATCH /api/exhibits with a valid exhibit_id, the correct user_id and a SINGLE key to update ({new_title : "the best exhibit ever"}) returns status 200, returns object with updated exhibit object on a key "exhibit".', () => {
    return request(app)
      .patch("/api/exhibits/1")
      .send({
        new_title: "the best exhibit ever",
        user_id: 1,
      })
      .expect(200)
      .then(({ body }) => {
        const exhibit = body.updatedExhibit;
        expect(exhibit).toMatchObject({
          exhibit_id: 1,
          title: "the best exhibit ever",
          description:
            "A collection showcasing sculptures from various ancient cultures.",
          curator_id: 1,
          created_at: expect.any(String),
        });
      });
  });
  test('PATCH /api/exhibits with a valid exhibit_id, the correct user_id and a TWO keys to update ({new_title : "the best exhibit ever", new_description : "look how truly awesome these are"}) returns status 200, returns object with updated exhibit object on a key "exhibit".', () => {
    return request(app)
      .patch("/api/exhibits/1")
      .send({
        new_title: "the best exhibit ever",
        new_description: "look how truly awesome these are",
        user_id: 1,
      })
      .expect(200)
      .then(({ body }) => {
        const exhibit = body.updatedExhibit;
        expect(exhibit).toMatchObject({
          exhibit_id: 1,
          title: "the best exhibit ever",
          description: "look how truly awesome these are",
          curator_id: 1,
          created_at: expect.any(String),
        });
      });
  });
  test('PATCH /api/exhibits with a valid exhibit_id, but a USER_ID that DOESNT MATCH returns a status 403, an error object with the msg "user doesnt have permission to patch this exhibit".', () => {
    return request(app)
      .patch("/api/exhibits/1")
      .send({
        new_title: "the best exhibit ever",
        new_description: "look how truly awesome these are",
        user_id: 2,
      })
      .expect(403)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: "user doesn't have permission to patch this exhibit",
        });
      });
  });
  test('PATCH /api/exhibits with an INVALID exhibit_id returns a status 403, an error object with the msg "bad request - exhibit_id not recognised".', () => {
    return request(app)
      .patch("/api/exhibits/15")
      .send({
        new_title: "the best exhibit ever",
        new_description: "look how truly awesome these are",
        user_id: 2,
      })
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: "bad request - exhibit_id not recognised",
        });
      });
  });
  test('PATCH /api/exhibits with a exhibit_id, matching user_id but no update fields gives a status and an error object with the msg "no valid fields to update".', () => {
    return request(app)
      .patch("/api/exhibits/1")
      .send({
        user_id: 1,
      })
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: "no valid fields to update",
        });
      });
  });
});

//DELETE - REMOVE AN EXHIBIT

describe("DELETE /api/exhibits/:exhibit_id", () => {
  test("DELETE /api/exhibits/1 - a valid delete request removes the exhibition with the id provided (along with any objects with that id) - responds with status 204 and an empty object.", () => {
    return request(app)
      .delete("/api/exhibits/1")
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
      });
  });
  test(`DELETE /api/exhibits/15 - an invalid delete request (exhibit_id doesnt exist), responds with status 404 and an object with key "msg", value "bad request - exhibit_id not recognised".`, () => {
    return request(app)
      .delete("/api/exhibits/150")
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: "bad request - exhibit_id not recognised",
        });
      });
  });
});

// EXHIBIT OBJECT REQUESTS

//Get objects with EXHIBIT_ID - all objects of an exhibit, object info joined on

describe("GET /api/exhibitobjects/:exhibit_id", () => {
  test('GET /api/exhibitobjects/1 (a valid exhibit_ID) gives status 200: sends back an object with key "objects", value an array all the objects in that exhibit, in ascending order according to object position value.', () => {
    return request(app)
      .get("/api/exhibitobjects/1")
      .expect(200)
      .then(({ body }) => {
        const objectsResultsArray = body.objects;
        expect(objectsResultsArray.length).toEqual(2);
        objectsResultsArray.forEach((object) => {
          expect(object).toEqual({
            object_position: expect.any(Number),
            object_id: expect.any(Number),
            title: expect.any(String),
            culture: expect.any(String),
            period: expect.any(String),
            object_begin_date: expect.any(Number),
            object_end_date: expect.any(Number),
            medium: expect.any(String),
            classification: expect.any(String),
            primary_image: expect.any(String),
            object_url: expect.any(String),
            museum_dataset: expect.any(String),
          });
        });
        for (let i = 1; i < objectsResultsArray.length; i++) {
          expect(objectsResultsArray[i].object_position).toBeGreaterThanOrEqual(
            objectsResultsArray[i - 1].object_position
          );
        }
      });
  });
  test('GET /api/exhibitobjects/15 (an invalid exhibit ID) gives status 404: responds with custom error message on an object, key "msg", value "exhibit_id not recognised"', () => {
    return request(app)
      .get("/api/exhibitobjects/15")
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: "bad request - exhibit_id not recognised",
        });
      });
  });
  test('GET /api/exhibitobjects/3 a vaild exhibit id with 0 objects returns a status 200, an object with key "objects", value: []', () => {
    return request(app)
      .get("/api/exhibitobjects/3")
      .expect(200)
      .then(({ body }) => {
        const objects = body.objects;
        expect(objects.length).toEqual(0);
      });
  });
});

//Get object with EXHIBIT_OBJECT_ID - single object with info joined on

describe("GET /api/exhibitobjects/objects/:exhibit_object_id", () => {
  test('GET /api/exhibitobjects/objects/1 (a valid exhibit_object_ID) gives status 200: sends back an object with key "object", value the respective object with its information from the object table joined on.', () => {
    return request(app)
      .get("/api/exhibitobjects/objects/1")
      .expect(200)
      .then(({ body }) => {
        const object = body.object;
        expect(object).toMatchObject({
          object_position: expect.any(Number),
          object_id: expect.any(Number),
          title: expect.any(String),
          culture: expect.any(String),
          period: expect.any(String),
          object_begin_date: expect.any(Number),
          object_end_date: expect.any(Number),
          medium: expect.any(String),
          classification: expect.any(String),
          primary_image: expect.any(String),
          object_url: expect.any(String),
          museum_dataset: expect.any(String),
        });
      });
  });
  test('GET /api/exhibitobjects/objects/1000 (an INVALID exhibit_object_ID) gives status 404: sends back object with key "msg", value "bad request - object not found".', () => {
    return request(app)
      .get("/api/exhibitobjects/objects/1000")
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: "bad request - object not found",
        });
      });
  });
});

// POST (NEW OBJECT IN EXHIBIT) - must correctly assign new object position (highest +1)

describe("POST /api/exhibitobjects", () => {
  test("POST /api/exhibitobjects takes a request body with the exhibit_id and id of object to add, responds with status 200 & successfully creates a new entry for that object in the exhibition, correctly calculating its position in the exhibit (4).", () => {
    return request(app)
      .post("/api/exhibitobjects")
      .send({
        exhibit_id: 2,
        object_id: 4,
      })
      .expect(200)
      .then(({ body }) => {
        const newExhibitObject = body.exhibitObject;
        expect(newExhibitObject).toMatchObject({
          exhibit_object_id: 6,
          exhibit_id: 2,
          object_id: 4,
          object_position: 4,
        });
      });
  });
  test("POST /api/exhibitobjects rejects a request with a status 404 (not found) if passed an exhibit_id that doesnt exist in the database.", () => {
    return request(app)
      .post("/api/exhibitobjects")
      .send({
        exhibit_id: 20,
        object_id: 4,
      })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("POST /api/exhibitobjects rejects a request with a status 400 (bad request) if passed a valid exhibit_id but an object_id that is already in that exhibit.", () => {
    return request(app)
      .post("/api/exhibitobjects")
      .send({
        exhibit_id: 2,
        object_id: 3,
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("already in database");
      });
  });
  test("POST /api/exhibitobjects adding an object to a previously empty exhibit correctly gives status 200 and places that object into object_position 1.", () => {
    return request(app)
      .post("/api/exhibitobjects")
      .send({
        exhibit_id: 3,
        object_id: 3,
      })
      .expect(200)
      .then(({ body }) => {
        const newExhibitObject = body.exhibitObject;
        expect(newExhibitObject).toMatchObject({
          exhibit_object_id: 6,
          exhibit_id: 3,
          object_id: 3,
          object_position: 1,
        });
      });
  });
});

// PATCH (UPDATE OBJECT ORDER VALUE - SPECIFIED AND OTHERS) - takes an object with values for EVERY position (new or not) - discrepancies on length given correct errors, user permission errors, exhibit_id errors, results MUST BE sorted by NEW POSITIONS

describe("PATCH /api/exhibitobjects/:exhibit_id", () => {
  test('PATCH /api/exhibitobjects with a valid exhibit_id, the correct user_id and a valid position_updates object responds with status 200, returning exhibit objects in their new positions, sorted correctly".', () => {
    return request(app)
      .patch("/api/exhibitobjects/2")
      .send({
        user_id: 1,
        position_updates: {
          3: 3,
          4: 1,
          5: 2,
        },
      })
      .expect(200)
      .then(({ body }) => {
        const updatedObjectsList = body.updatedExhibitObjects;
        expect(updatedObjectsList[0].exhibit_object_id).toBe(4);
        expect(updatedObjectsList[0].object_position).toBe(1);
        expect(updatedObjectsList[1].exhibit_object_id).toBe(5);
        expect(updatedObjectsList[1].object_position).toBe(2);
        expect(updatedObjectsList[2].exhibit_object_id).toBe(3);
        expect(updatedObjectsList[2].object_position).toBe(3);
      });
  });
  test('PATCH /api/exhibitobjects with a valid exhibit_id, but an invalid user_id (not their exhibit) rejects with a status 403 and the correct error message".', () => {
    return request(app)
      .patch("/api/exhibitobjects/2")
      .send({
        user_id: 2,
        position_updates: {
          3: 3,
          4: 1,
          5: 2,
        },
      })
      .expect(403)
      .then(({ body }) => {
        const error = body.msg;
        expect(error).toEqual(
          "user doesn't have permission to patch this exhibit"
        );
      });
  });
  test('PATCH /api/exhibitobjects with an invalid exhibit_id rejects with a status 404 and the correct error message".', () => {
    return request(app)
      .patch("/api/exhibitobjects/20")
      .send({
        user_id: 1,
        position_updates: {
          3: 3,
          4: 1,
          5: 2,
        },
      })
      .expect(404)
      .then(({ body }) => {
        const error = body.msg;
        expect(error).toEqual("bad request - exhibit_id not recognised");
      });
  });
  test('PATCH /api/exhibitobjects with a valid exhibit_id, a valid user_id but NOT ENOUGH update values rejects with a status 400 and the correct error message".', () => {
    return request(app)
      .patch("/api/exhibitobjects/2")
      .send({
        user_id: 1,
        position_updates: {
          3: 3,
          4: 1,
        },
      })
      .expect(400)
      .then(({ body }) => {
        const error = body.msg;
        expect(error).toEqual("too many/not enough position updates");
      });
  });
  test('PATCH /api/exhibitobjects with a valid exhibit_id, a valid user_id but TOO MANY update values rejects with a status 400 and the correct error message".', () => {
    return request(app)
      .patch("/api/exhibitobjects/2")
      .send({
        user_id: 1,
        position_updates: {
          3: 3,
          4: 1,
          5: 2,
          6: 4,
        },
      })
      .expect(400)
      .then(({ body }) => {
        const error = body.msg;
        expect(error).toEqual("too many/not enough position updates");
      });
  });
});

//DELETE (REMOVE OBJECT FROM EXHIBIT) - delete object from an exhibit successfully - updating other positions shouldnt matter - order will remain the same (gaps dont need to be filled - will be covered if user patches object position). Only delete one at a time???

describe("DELETE /api/exhibitobjects/:exhibit_object_id", () => {
  test("DELETE /api/exhibitobjects/1 - a valid delete request removes the exhibition object with the id provided. Responds with status 204 and an empty object.", () => {
    return request(app)
      .delete("/api/exhibitobjects/1")
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
      });
  });
  test(`DELETE /api/exhibits/15 - an invalid delete request (exhibit_object_id doesnt exist), responds with status 404 and an object with key "msg", value "bad request - exhibit_object_id not recognised".`, () => {
    return request(app)
      .delete("/api/exhibitobjects/14")
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: "bad request - exhibit_object_id not recognised",
        });
      });
  });
});
