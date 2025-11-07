require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {dbMovies, dbDirectors} = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const jsonwebtoken = require('jsonwebtoken');


app.use(express.json());

// let filmDirectors = [
//   { id: 1, name: 'Yushril huda ramadhany s.', birthYear: 2005 },
//   { id: 2, name: 'Zidni ilmi kafa bih', birthYear: 2004 },
//   { id: 3, name: 'Faik waladi', birthYear: 2006 },
//   { id: 4, name: 'Faiz mahbub', birthYear: 2005 }
// ];



// === AUTH ROUTES ===

app.post('/auth/register', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password || password.length < 6) {
    return res.status(400).json({ 
      error: 'Username dan password (min 6 char) harus diisi' 
    });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error("Error hashing:", err);
      return res.status(500).json({ error: 'Gagal memproses pendaftaran' });
    }

    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    const params = [username.toLowerCase(), hashedPassword];

    // PENTING: Gunakan dbMovies karena tabel users ada di database pertama
    dbMovies.run(sql, params, function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint')) {
          return res.status(409).json({ error: 'Username sudah digunakan' });
        }
        console.error("Error inserting user:", err);
        return res.status(500).json({ error: 'Gagal menyimpan pengguna' });
      }
      
      res.status(201).json({ 
        message: 'Registrasi berhasil', 
        userId: this.lastID 
      });
    });
  });
});

app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password harus diisi' });
  }

  const sql = "SELECT * FROM users WHERE username = ?";
  
  // PENTING: Gunakan dbMovies untuk query users
  dbMovies.get(sql, [username.toLowerCase()], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Kredensial tidak valid' });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(401).json({ error: 'Kredensial tidak valid' });
      }

      const payload = { 
        user: { 
          id: user.id, 
          username: user.username 
        } 
      };

      jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) {
          console.error("Error signing token:", err);
          return res.status(500).json({ error: 'Gagal membuat token' });
        }
        
        res.json({ 
          message: 'Login berhasil', 
          token: token 
        });
      });
    });
  });
});

// === ROUTERS MOVIES ===

// (GET MOVIES)
app.get('/movies', (req, res) => {
    dbMovies.all("SELECT * FROM movies", [], (err, rows) => {
        if (err) {
            res.status(500).json({error: err.message});
            return;
        } else {
            res.json({
                message: 'Data film Di temukan',
                data: rows,
            });
        }
    });
});

// (GET MOVIES BY ID)
app.get('/movies/:id', (req, res) => {
    const id = req.params.id;
    dbMovies.get("SELECT * FROM movies WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(500).json({error: err.message});
            return;
        } else {
            res.json({
                message: 'Data Film di temukan',
                data: row,
            })
        }
    });
});

// IMPORT MIDDDLEWARE
const authenticateToken = require('./middlewere/authmiddleware');

// === PROTECTED - PERLU LOGIN ===
// (POST MOVIES)
app.post('/movies', authenticateToken, (req, res) => {
    const {title, director, year } = req.body;
    const sql = 'INSERT INTO movies (title, director, year) VALUES (?,?,?)';

    dbMovies.run(sql, [title, director, year, req.params.id ], function(err) {
        if (err) {
            res.status(400).json({error: err.message});
            return;
        } else {
            res.json ({
                message: 'Berhasil menambahkan film',
                id: this.lastID,
            })
        } 
    });
});

//(PUT MOVIES)
app.put('/movies/:id', authenticateToken, (req, res) => {
    const id = req.params.id;
    const sql = 'UPDATE movies SET  title =?, director =?, year =? where id=?,';

    dbMovies.run(sql, id, function(err) {
        if (err) {
            res.status(400).json({error: 'Data tidak ditemukan'});
            return;    
        } else {
            res.json ({
                message: 'Berhasil mengupdate film',
                changes: this.changes,
            })
        }
    });
});


// (DELETE MOVIES)
app.delete('/movies/:id', authenticateToken, (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM movies where id=?';

    dbMovies.run(sql, id, function(err) {
        if (err) {
            res.status(400).json({error: err.message});
            return;
        } else {
            res.json ({
                message: 'Berhasil menghapus film',
                changes: this.changes,
            });
        }
    });
});

// PROTECTED - PERLU LOGIN
// === DIRECTORS ===
app.get('/', (req, res) => {
    res.send('Selamat datang di Rest API!');
});

// (GET ALL)
app.get('/directors', (req, res) => {
    dbDirectors.all("SELECT * FROM directors", [], (err, rows) => {
        if (err) {
            res.status(500).json({error: err.message});
            return;
        } else {
            res.json({
                message: 'Data film Di temukan',
                data: rows,
            });
        }
    });
});

// (GET BY ID)
app.get('/directors/:id', authenticateToken, (req, res) => {
    const id = req.params.id;
    dbDirectors.get("SELECT * FROM directors WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(500).json({error: err.message});
            return;
        } else {
            res.json({
                message: 'Data Film di temukan',
                data: row,
            })
        }
    });
});

// (POST)
app.post('/directors', authenticateToken, (req, res) => {
    const {title, brithYears, noHP } = req.body;
    const sql = 'INSERT INTO directors (id, name, brithYears, noHP) VALUES (?,?,?,?)';

    dbDirectors.run(sql, [title, director, year, req.params.id ], function(err) {
        if (err) {
            res.status(400).json({error: err.message});
            return;
        } else {
            res.json ({
                message: 'Berhasil menambahkan film',
                id: this.lastID,
            })
        } 
    });
});

// (DELETE BY ID)
app.delete('/directors/:id', authenticateToken, (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM directors where id=?';

    dbDirectors.run(sql, id, function(err) {
        if (err) {
            res.status(400).json({error: err.message});
            return;
        } else {
            res.json ({
                message: 'Berhasil menghapus film',
                changes: this.changes,
            });
        }
    });
});

// (DELETE ALL)
app.delete('/directors', (req, res) => {
    const sql = 'DELETE FROM directors';

    dbDirectors.run(sql, function(err) {
        if (err) {
            res.status(400).json({error: err.message});
            return;
        } else {
            res.json ({
                message: 'Berhasil menghapus film',
                changes: this.changes,
            });
        }
    });
});

// (PUT)
app.put('/directors/:id', authenticateToken, (req, res) => {
    const id = req.params.id;
    const sql = 'UPDATE directors SET id =?, name =?, brithYears =?, noHP =? where id=?,';

    dbDirectors.run(sql, id, function(err) {
        if (err) {
            res.status(400).json({error: 'Data tidak ditemukan'});
            return;    
        } else {
            res.json ({
                message: 'Berhasil mengupdate film',
                changes: this.changes,
            })
        }
    });
})

  
app.listen(PORT, () => {
  console.log(`Server aktif di http://localhost:${PORT}`);
});