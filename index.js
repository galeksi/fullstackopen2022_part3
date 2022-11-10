require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

morgan.token('body', (req) => {
    if (req.method === 'POST') return JSON.stringify(req.body)
})

app.use(express.json())
app.use(express.static('build'))
app.use(cors())
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

// let persons = [
//     {
//         "id": 1,
//         "name": "Arto Hellas",
//         "number": "040-123456"
//     },
//     {
//         "id": 2,
//         "name": "Ada Lovelace",
//         "number": "39-44-5323523"
//     },
//     {
//         "id": 3,
//         "name": "Dan Abramov",
//         "number": "12-43-234345"
//     },
//     {
//         "id": 4,
//         "name": "Mary Poppendieck",
//         "number": "39-23-6423122"
//     }
// ]

app.get('/', (request, response) => {
    response.send('<h1>Phonebook backend application</h1>')
})

app.get('/info', (request, response) => {
    Person.countDocuments({}, (err, personCount) => {
        if (err) { return handleError(err) }
        response.send(`<h1>Phonebook has info for ${personCount} people</h1><br /><h3>${new Date()}</h3>`)
    })
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons =>
        response.json(persons)
    )
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    Person.findById(id).then( person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    })
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
    const person = new Person({
        name: newPerson.name,
        number: newPerson.number
    })
    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    Person.findById(id).then(person => {
        console.log(person)
        person.remove()
        response.status(204).end()
    })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})