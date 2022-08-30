require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')

// const Note = require('./models/note')
const Person = require('./models/phonebook')

app.use(cors())
app.use(express.json())

app.use(express.static('build'))



// Morgan middleware to log requests
const morganMiddleware = morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    JSON.stringify(req.body)
  ].join(' ')
})


// app.use(requestLogger)

app.use(morganMiddleware)


// Phonebook

app.get('/api/persons', (_request, response, next) => {
  Person.find({}).then(result => {
    console.log('phonebook:', result)
    response.json(result)
  }).catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if(person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
  .then(_result => {
    response.status(204).end()
  })
  .catch(error => next(error))
})


app.get('/info', (_request, response) => {
  Person.find({}).then(result => {
    response.send(`<p>Phonebook has info for ${result.length} people</p>
    <p>${new Date()}</p>`)
  }).catch(error => next(error))
})


app.post('/api/persons', (request, response, next) => {
  const body = request.body
  console.log('body:', body)
  
  if(!body.name || !body.number) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  }).catch(error => next(error))
})


app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})



// Notes 

app.get('/', (_request, response) => {
  response.send('<h1>Hello World!</h1>')
})


app.get('/api/notes', (_request, response, next) => {
  Note.find({}).then(notes => {
    response.json(notes)
  }).catch(error => next(error))
})

app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    }).catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndRemove(request.params.id)
    .then(_result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/notes', (request, response, next) => {
  const body = request.body
  
  if(!body.content) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date()
  })

  note.save().then(savedNote => {
    response.json(savedNote)
  }).catch(error => next(error))

})

app.put('/api/notes/:id', (request, response, next) => {
  const body = request.body

  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})


// Middleware to handle errors of uknown routes
const unknownEndpoint = (_request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)


// Error handling middleware
const errorHandler = (error, _request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

app.use(errorHandler)



const port = process.env.PORT;
app.listen(port);
console.log(`Server running at http://localhost:${port}/`);