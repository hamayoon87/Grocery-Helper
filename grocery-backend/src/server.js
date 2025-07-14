const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'your_jwt_secret_here'; // Replace with strong secret in production

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User schema
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
});
const User = mongoose.model('User', UserSchema);

// Grocery item schema tied to user
const GroceryItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true },
  done: { type: Boolean, default: false },
});
const GroceryItem = mongoose.model('GroceryItem', GroceryItemSchema);

// Middleware to verify JWT token
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Authorization required' });
  
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Signup route
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password required' });
  
  const existingUser = await User.findOne({ username });
  if (existingUser) return res.status(409).json({ message: 'Username already taken' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({ username, passwordHash });
  await user.save();

  const token = jwt.sign({ id: user._id, username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// Get all grocery items for user
app.get('/items', authMiddleware, async (req, res) => {
  const items = await GroceryItem.find({ userId: req.user.id });
  res.json(items);
});

// Add grocery item
app.post('/items', authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Name required' });

  const newItem = new GroceryItem({ userId: req.user.id, name });
  await newItem.save();
  res.status(201).json(newItem);
});

// Toggle done
app.put('/items/:id/toggle', authMiddleware, async (req, res) => {
  const item = await GroceryItem.findOne({ _id: req.params.id, userId: req.user.id });
  if (!item) return res.status(404).json({ message: 'Item not found' });

  item.done = !item.done;
  await item.save();
  res.json(item);
});

// Delete item
app.delete('/items/:id', authMiddleware, async (req, res) => {
  await GroceryItem.deleteOne({ _id: req.params.id, userId: req.user.id });
  res.status(204).send();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
