const express = require('express')
const morgan = require('morgan')
const app = express()

morgan.token('body', (req) => {
    if (req.method === 'POST') return JSON.stringify(req.body)
})

app.use(express.json())
app.use(morgan((tokens, req, res) => {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens.body(req)
    ].join(' ')
}))

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Phonebook backend application</h1>')
})

app.get('/info', (request, response) => {
    response.send(`<h1>Phonebook has info for ${persons.length} people</h1><br /><h3>${new Date()}</h3>`)
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(pers => pers.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.post('/api/persons', (request, response) => {
    const newPerson = request.body
    console.log(newPerson)

    if (!newPerson.name || !newPerson.number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    } else if (persons.find(pers => pers.name === newPerson.name)) {
        return response.status(400).json({
            error: `${newPerson.name} already in the phonebook`
        })
    }
    newPerson.id = Math.floor(Math.random() * 100)

    persons = persons.concat(newPerson)

    response.json(newPerson)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})