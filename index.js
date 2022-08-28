const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
app.use(cors())
app.use(express.json())

app.use(express.static('build'))


// Custom middleware 
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}
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



let notes = [
  {
    id: 1,
    content: "HTML is easy",
    date: "2019-05-30T17:30:31.098Z",
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only Javascript",
    date: "2019-05-30T18:39:34.091Z",
    important: false
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    date: "2019-05-30T19:20:14.298Z",
    important: true
  }
]

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",

  },

  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },

  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },

  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  } 
]


// Phonebook

app.get('/api/persons', (_request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  if(person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})


app.get('/info', (_request, response) => {
  const date = new Date()
  const info = `<p>Phonebook has info for ${persons.length} people</p>
  <p>${date}</p>`
  response.send(info)
})


app.post('/api/persons', (request, response) => {
  const body = request.body
  // console.log(body)
  
  if(!body.name || !body.number) {
    return response.status(400).json({
      error: 'content missing'
    })
  
  } else if(persons.find(p => p.name === body.name)) {
    return response.status(400).json({
      error: 'name must be unique'
    }) 
  }

  const person = {
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * 1000000)
  }

  persons = persons.concat(person)
  response.json(person)
})



// Notes 

app.get('/', (_request, response) => {
  response.send('<h1>Hello World!</h1>')
})


app.get('/api/notes', (_request, response) => {
  response.json(notes)
})

app.get('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  const note = notes.find(note => note.id === id)
  if(note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  notes = notes.filter(note => note.id !== id)
  response.status(204).end()
})

const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id))
    : 0
  return maxId + 1
}

app.post('/api/notes', (request, response) => {
  const body = request.body
  
  if(!body.content) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const note = {
    content: body.content,
    important: body.important || false,
    date: new Date(),
    id: generateId(),
  }

  notes = notes.concat(note)
  response.json(note)
})


// Middleware to handle errors of uknown routes
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)


const port = process.env.PORT || 3001;
app.listen(port);
console.log(`Server running at http://localhost:${port}/`);