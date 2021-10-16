const express = require('express')
const cors = require('cors')

const { v4: uuidv4 } = require('uuid')

const app = express()

app.use(cors())
app.use(express.json())

let users = []

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if (!user) {
    return response
      .status(404)
      .json({ error: 'User inexistente' })
  }

  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const user = users.find(user => user.username === username)
  if (user) return response.status(400).json({ error: 'User já existe!' })

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  response.status(201).json(newUser)
})

app.get('/users/:username', (request, response) => {
  const { username } = request.params

  const user = users.find(user => user.username === username)

  response.json(user)
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  response.json(user.todos)
})

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers
  const { title, deadline } = request.body

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  const user = users.find(user => user.username === username)

  user.todos.push(todo)

  response.status(201).json(todo)
})

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers
  const { title, deadline } = request.body

  const userIndex = users.findIndex(user => user.username === username)

  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === request.params.id)
  if (todoIndex < 0) return response.status(404).json({ error: 'todo não encontrado' })

  const todoUpdated = {
    ...users[userIndex].todos[todoIndex],
    title,
    deadline: new Date(deadline),
  }

  users[userIndex].todos[todoIndex] = todoUpdated

  response.status(200).json(todoUpdated)
})

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers

  const userIndex = users.findIndex(user => user.username === username)

  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === request.params.id)
  if (todoIndex < 0) return response.status(404).json({ error: 'erro' })

  const todoUpdated = {
    ...users[userIndex].todos[todoIndex],
    done: !users[userIndex].todos[todoIndex].done
  }

  users[userIndex].todos[todoIndex] = todoUpdated

  response.status(200).json(todoUpdated)
})

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers

  const userIndex = users.findIndex(user => user.username === username)

  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === request.params.id)
  if (todoIndex < 0) return response.status(404).json({ error: 'erro' })

  const todosUpdated = users[userIndex].todos.filter(todo => todo.id !== request.params.id)
  users[userIndex].todos = todosUpdated

  response.status(204).send()
})

module.exports = app
