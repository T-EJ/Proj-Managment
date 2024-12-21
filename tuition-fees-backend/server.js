const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Create an express app
const app = express();

// Enable CORS
app.use(cors());

// Middleware to parse JSON
app.use(bodyParser.json());

// Connect to MongoDB (adjust the URI to match your MongoDB setup)
mongoose.connect('mongodb://localhost:27017/school', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Define Faculty and Student Models
const Faculty = mongoose.model('Faculty', new mongoose.Schema({
  name: String,
  id: String,
}));

const Student = mongoose.model('Student', new mongoose.Schema({
  student_name: String,
  student_id: String,
  subject: String,
  faculty_id: String,
}));

// Endpoint to get all faculties
app.get('/get-faculty', async (req, res) => {
  try {
    const faculties = await Faculty.find();
    res.json(faculties);
  } catch (error) {
    res.status(500).send('Error fetching faculty data.');
  }
});

// Endpoint to get students by faculty id
app.get('/get-students/:facultyId', async (req, res) => {
  const { facultyId } = req.params;
  try {
    const students = await Student.find({ faculty_id: facultyId });
    res.json(students);
  } catch (error) {
    res.status(500).send('Error fetching student data.');
  }
});

// Start the server on port 3001
app.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});
