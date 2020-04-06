require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())

app.use(express.static('build'))

app.use(express.json())

app.use(
  morgan(function(tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      JSON.stringify(req.body)
    ].join(' ')
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

//app.use(requestLogger)

/*
let persons = [
  {
    name: 'Arto Hellas',
    number: '040-123456',
    id: 1
  },
  {
    name: 'Ada Lovelace',
    number: '39-44-5323523',
    id: 2
  },
  {
    name: 'Dan Abramov',
    number: '12-43-234345',
    id: 3
  },
  {
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
    id: 4
  }
]
*/

app.get('/', (req, res) => {
  res.send('<h1>Puhelinluettelo</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons.map(person => person.toJSON()))
  })
})

app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    response.send(`<p>Phonebook has info of ${persons.length} people</p><p>${new Date()}</p>`)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person.toJSON())
      } else {
        response.status(404).end()
        console.log('404 henkilöä ei löydy')
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

/*
const generateId = () => {
  const randomId = Math.floor(Math.random() * 1000) + 1
  return randomId
}
*/

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  /*
  Person.find({}).then(persons => {
    const existingPerson = persons.find(person => person.name === body.name)
    if (existingPerson) {
      const person = {
        name: existingPerson.name,
        number: body.number
      }

      Person.findByIdAndUpdate(existingPerson.id, person, { new: true })
        .then(updatedPerson => {
          response.json(updatedPerson.toJSON())
          console.log("updated number")
        })
        .catch(error => next(error))
    } else { */
  /*
  if (body.name === undefined) {
    return response.status(400).json({ error: "name missing" })
  }
  */

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person
    .save()
    .then(savedPerson => {
      response.json(savedPerson.toJSON())
    })
    .catch(error => next(error))
  /*
    }
  })
  */

  /*
  //const nameAlreadyExists = persons.find(person => person.name === body.name)
  //console.log(nameAlreadyExists)

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
  */
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error('Oma virheidenkäsittelijä:', error.message)

  if (error.name === 'CastError' /* && error.kind == "ObjectId" */) {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send(error)
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
