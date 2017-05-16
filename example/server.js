const task = require('task')
const builder = require('../')
const dev = require('task/packages/task-dev')

task.set({
  cwd: __dirname,
  inject: [ dev ],
  tasks: {
    'build-app': {
      options: { builder }
    }
  }
})
