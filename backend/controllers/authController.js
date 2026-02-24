// simple authentication controller using a mock JSON "database".
// In production you'd use a real database and hashed passwords.
const users = [
  { username: 'admin', password: 'password123' },
  { username: 'user', password: 'userpass' }
];

exports.login = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (user) {
    req.session.user = { username: user.username };
    return res.json({ message: 'Login successful' });
  }

  res.status(401).json({ error: 'Invalid credentials' });
};
