const express = require('express');
const cors = require('cors');
require('./db/config');
const User = require('./db/User');
const List = require('./db/List');

const Jwt = require('jsonwebtoken');
const jwtKey = 'todo';

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  })
);

app.post('/register', async (req, resp) => {
  let user = new User(req.body);
  let result = await user.save();
  result = result.toObject();
  delete result.password;
  Jwt.sign({ result }, jwtKey, { expiresIn: '2h' }, (err, token) => {
    if (err) {
      resp.send({ result: 'Something went wrong. Please try after some time' });
    } else {
      resp.send({ result, auth: token });
    }
  });
});

app.post('/login', async (req, resp) => {
  if (req.body.password && req.body.email) {
    let user = await User.findOne(req.body).select('-password');
    if (user) {
      Jwt.sign({ user }, jwtKey, { expiresIn: '2h' }, (err, token) => {
        if (err) {
          resp.send({
            result: 'Something went wrong. Please try after some time',
          });
        } else {
          resp.send({ user, auth: token });
        }
      });
    }
  } else {
    resp.send({ result: 'no user found' });
  }
});

app.post('/add-list', verifyToken, async (req, resp) => {
  let list = new List(req.body);
  let result = await list.save();
  resp.send(result);
});

app.get('/lists', verifyToken, async (req, resp) => {
  const lists = await List.find();
  if (lists.length > 0) {
    resp.send(lists);
  } else {
    resp.send({ result: 'No list found' });
  }
});

app.post('/add-task-to-list/:listId', verifyToken, async (req, resp) => {
  const listId = req.params.listId;

  const newTask = {
    title: req.body.title,
    notes: req.body.notes,
  };

  List.findById(listId)
    .then((list) => {
      if (!list) {
        return resp.status(404).json({ error: 'List not found' });
      }

      list.tasks.push(newTask);

      return list.save();
    })
    .then((result) => {
      resp
        .status(201)
        .json({ message: 'Task added successfully', task: newTask });
    })
    .catch((err) => {
      resp.status(500).json({ error: 'Error adding task to list' });
    });
});

app.put('/lists/:id', verifyToken, async (req, resp) => {
  let result = await List.updateOne(
    {
      _id: req.params.id,
    },
    {
      $set: {
        name: req.body.name,
      },
    }
  );

  resp.send(result);
});

app.put('/update-task/:listId/:taskId', verifyToken, async (req, res) => {
  const listId = req.params.listId;
  const taskId = req.params.taskId;

  const updatedTask = {
    title: req.body.title,
    notes: req.body.notes,
  };

  List.findById(listId)
    .then((list) => {
      if (!list) {
        return res.status(404).json({ error: 'List not found' });
      }

      const taskToUpdate = list.tasks.id(taskId);

      if (!taskToUpdate) {
        return res.status(404).json({ error: 'Task not found' });
      }

      taskToUpdate.title = updatedTask.title;
      taskToUpdate.notes = updatedTask.notes;

      return list.save();
    })
    .then((result) => {
      res
        .status(200)
        .json({ message: 'Task updated successfully', task: updatedTask });
    })
    .catch((err) => {
      res.status(500).json({ error: 'Error updating task' });
    });
});

app.delete('/lists/:id', async (req, resp) => {
  let result = await List.deleteOne({ _id: req.params.id });
  resp.send(result);
});

app.get('/tasks/:listId', verifyToken, async (req, resp) => {
  const listId = req.params.listId;
  const lists = await List.findById(listId);
  if (lists?.tasks?.length > 0) {
    resp.send(lists.tasks);
  } else {
    resp.send({ result: 'No tasks found' });
  }
});

app.delete(
  '/deleteTask/lists/:listId/tasks/:taskId',
  verifyToken,
  async (req, resp) => {
    try {
      const listIdToDeleteFrom = req.params.listId;
      const taskIdToDelete = req.params.taskId;

      const result = await List.updateOne(
        { _id: listIdToDeleteFrom },
        { $pull: { tasks: { _id: taskIdToDelete } } }
      );

      if (result.modifiedCount === 1) {
        resp.status(200).json('Task deleted successfully');
      } else {
        resp.status(404).json('Task not found');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      resp.status(500).json('Internal server error');
    }
  }
);

app.get('/search/:key', verifyToken, async (req, resp) => {
  let result = await List.find({
    $or: [
      {
        name: { $regex: req.params.key },
      },
      {
        'tasks.title': { $regex: req.params.key },
      },
    ],
  });
  console.log(result);
  resp.send(result);
});

function verifyToken(req, resp, next) {
  let token = req.headers['authorization'];
  if (token) {
    token = token.split(' ')[1];
    Jwt.verify(token, jwtKey, (err, valid) => {
      if (err) {
        resp.status(401).send({ result: 'Please provide a valid token' });
      } else {
        next();
      }
    });
  } else {
    resp.status(403).send({ result: 'Please provide a token' });
  }
}

app.listen(5000);
