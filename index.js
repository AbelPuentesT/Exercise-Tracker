const express = require('express')
const app = express()
const cors = require('cors')

app.use(express.json()); // Asegúrate de tener esta línea
app.use(express.urlencoded({ extended: true })); // Asegúrate de tener esta línea

require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


// Tus rutas van aquí


let users = []
let exercises = []
let id = 1
app.get('/api/users', (req, res) => {
  try {
    res.json(users);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/api/users', (req, res) => {
  try {
    const { username } = req.body;
    const user = {
      username: username,
      _id: (id++).toString()
    };
    users.push(user);
    res.json({ username: user.username, _id: user._id });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/api/users/:_id/exercises', (req, res) => {
  try {
    const { description, duration, date } = req.body;
    const { _id } = req.params;
    const user = users.find(user => user._id === _id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    const exercise = {
      description: description,
      duration: parseInt(duration),
      date: date ? new Date(date).toDateString() : new Date().toDateString(),
      username: user.username,
      _id: user._id
    };
    exercises.push(exercise);
    res.json(exercise);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/api/users/:_id/logs', (req, res) => {
  try {
    const { _id } = req.params;
    const { from, to, limit } = req.query;
    console.log(`Received request for logs of user ${_id} from ${from} to ${to} with limit ${limit}`);
    
    const user = users.find(user => user._id === _id);
    if (!user) {
      console.log(`User ${_id} not found`);
      return res.status(404).send('User not found');
    }
    console.log(`Found user ${user.username}`);

    let log = exercises.filter(exercise => exercise._id === _id);
    console.log(`Initial log length: ${log.length}`);

    if (from) {
      const fromDate = new Date(from);
      log = log.filter(exercise => new Date(exercise.date) >= fromDate);
      console.log(`Log length after filtering from date: ${log.length}`);
    }

    if (to) {
      const toDate = new Date(to);
      log = log.filter(exercise => new Date(exercise.date) <= toDate);
      console.log(`Log length after filtering to date: ${log.length}`);
    }

    if (limit) {
      log = log.slice(0, limit);
      console.log(`Log length after applying limit: ${log.length}`);
    }

    res.json({
      _id: user._id,
      username: user.username,
      count: log.length,
      log: log
    });
  } catch (err) {
    console.log(`Error: ${err.message}`);
    res.status(500).send(err.message);
  }
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
