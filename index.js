require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const Person = require("./models/person");

morgan.token("body", (req) => {
  if (req.method === "POST") return JSON.stringify(req.body);
});

app.use(express.json());
app.use(express.static("build"));
app.use(cors());
app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens.body(req),
    ].join(" ");
  })
);

app.get("/", (request, response) => {
  response.send("<h1>Phonebook backend application</h1>");
});

app.get("/info", (request, response, next) => {
  Person.estimatedDocumentCount()
    .then((count) => {
      response.send(
        `<h1>Phonebook has info for ${count} people</h1><br /><h3>${new Date()}</h3>`
      );
    })
    .catch((error) => next(error));
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  Person.findById(id)
    .then((person) => {
      response.json(person);
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const newPerson = request.body;
  // console.log(newPerson)
  Person.exists({ name: newPerson.name }, (err, doc) => {
    // console.log(doc)
    if (doc) {
      return response
        .status(400)
        .send({ error: `${newPerson.name} already in the phonebook` });
    }
    const person = new Person({
      name: newPerson.name,
      number: newPerson.number,
    });
    person
      .save()
      .then((savedPerson) => {
        response.json(savedPerson);
      })
      .catch((error) => next(error));
  });
});

app.put("/api/persons/:id", (request, response, next) => {
  const updatePerson = request.body;
  // console.log(updatePerson)
  const person = {
    name: updatePerson.name,
    number: updatePerson.number,
  };
  // console.log(person)
  Person.findByIdAndUpdate(request.params.id, person, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatePerson) => {
      response.json(updatePerson);
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  Person.findByIdAndRemove(id)
    .then(() => {
      // console.log(person)
      response.status(204).end();
    })
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
