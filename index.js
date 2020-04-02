const express = require("express")
const app = express()
const morgan = require("morgan")
const cors = require("cors")

app.use(cors())

app.use(express.json()) /
  app.use(
    morgan(function(tokens, req, res) {
      return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, "content-length"),
        "-",
        tokens["response-time"](req, res),
        "ms",
        JSON.stringify(req.body)
      ].join(" ")
    })
  )

/*
const requestLogger = (request, response, next) => {
  console.log("Method:", request.method)
  console.log("Path:  ", request.path)
  console.log("Body:  ", request.body)
  console.log("---")
  next()
}
*/

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" })
}

//app.use(requestLogger)

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4
  }
]

app.get("/", (req, res) => {
  res.send("<h1>Puhelinluettelo</h1>")
})

app.get("/api/persons", (req, res) => {
  res.json(persons)
})

app.get("/info", (req, res) => {
  res.send(`<p>Phonebook has info of ${persons.length} people</p><p>${new Date()}</p>`)
})

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)

  console.log(id, persons)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id)
  console.log(id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const generateId = () => {
  const randomId = Math.floor(Math.random() * 1000) + 1
  return randomId
}

app.post("/api/persons", (request, response) => {
  const body = request.body
  const nameAlreadyExists = persons.find(person => person.name === body.name)
  console.log(nameAlreadyExists)

  if (nameAlreadyExists || !body.name || !body.number) {
    let errors = []
    if (nameAlreadyExists) errors = errors.concat("name must be unique")
    if (!body.name) errors = errors.concat("name is missing")
    if (!body.number) errors = errors.concat("number is missing")
    console.log("status", errors)

    return response.status(400).json({
      error: errors.join(", ")
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId()
  }

  persons = persons.concat(person)
  console.log(persons)

  response.json(person)
})

app.use(unknownEndpoint)

const port = 3001
app.listen(port)
console.log(`Server is running on ${port}`)
