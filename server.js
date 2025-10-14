require('dotenv').config();
const express = require('express');
const app = express();
//const PORT = 3100;
const db = require('./database');
const PORT = process.env.port || 3000;

app.use(express.json());

// let filmDirectors = [
//   { id: 1, name: 'Yushril huda ramadhany s.', birthYear: 2005 },
//   { id: 2, name: 'Zidni ilmi kafa bih', birthYear: 2004 },
//   { id: 3, name: 'Faik waladi', birthYear: 2006 },
//   { id: 4, name: 'Faiz mahbub', birthYear: 2005 }
// ];

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Selamat datang di Rest API!');
});

// get all film
app.get('/directors', (req, res) => {
    db.all("SELECT * FROM directors", [], (err, rows) => {
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

// get film by id
app.get('/directors/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM directors WHERE id = ?", [id], (err, row) => {
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

// add new film
app.post('/directors', (req, res) => {
    const {title, director, year } = req.body;
    const sql = 'INSERT INTO directors (id, name, brithYears, noHP) VALUES (?,?,?,?)';

    db.run(sql, [title, director, year, req.params.id ], function(err) {
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

// delete film by id
app.delete('/directors/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM directors where id=?';

    db.run(sql, id, function(err) {
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

// delete film all
app.delete('/directors', (req, res) => {
    const sql = 'DELETE FROM directors';

    db.run(sql, function(err) {
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

// update film by id
app.put('/directors/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'UPDATE directors SET id =?, name =?, brithYears =?, noHP =? where id=?,';

    db.run(sql, id, function(err) {
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


// // Tugas Praktikum membuat api crud untuk Sustradara

// //data dummy sutradara
// let directors = [
//     {id: 'A01', name: 'Ahmad Maulidin', namaFilm: 'Para Pencari tuhan', birthYear: 2005},
//     {id: 'A02', name: 'Firman Ardiyansyah', namaFilm: 'Waktu Maghrib', birthYear: 2001},
//     {id: 'A03', name: 'Achmad Fahmi', namaFilm: 'Jodoh Wasiat Bapak', birthYear: 2000},
// ];
// // console.log(directors);

// app.get('/directors', (req,res) => {
//     res.json(directors);
// });

// app.get('/directors/:id', (req, res) => {
//     const director = directors.find(d => d.id === req.params.id);
//     if (director) {
//         res.json(director);
//     } else {
//         res.status(404).send('Director not Found');
//     }
// });

// // membuat data film 
// app.post('/directors', (req, res) => {
//     const {name, namaFilm, birthYear} = req.body || {};
//     if (!name || !namaFilm || !birthYear) {
//         return res.status(400).json({eror: 'name, namaFilm, birth Year wajib di isi'});
//     }
//     const current = directors.length + 1;
//     const newDirector = {id: A0${current}, name, namaFilm, birthYear};
//     directors.push(newDirector);
//     res.status(201).json(newDirector);
// });

// // update data film
// app.put('/directors/:id', (req, res) => {
//     const id = req.params.id;
//     const directorIndex = directors.findIndex(d => d.id === id);
//     if (directorIndex === -1) {
//        returnres.status(404).json({error: 'Director tidak di temukan'});
//     }
//     const {name, namaFilm, birthYear} = req.body || {};
//     const updatedDirector = {id, name, namaFilm, birthYear};
//     directors[directorIndex] = updatedDirector;
//     res.json(updatedDirector);
// });

// // menghapus film
// app.delete('/directors/:id', (req,res)=> {
//     const id = req.params.id;
//     const DirectorIndex = directors.findIndex(d => d.id === id)
//     if (DirectorIndex === -1) {
//        return res.status(404).json({eror: 'Director tidak di temukan'});
//     } else {
//         directors.splice(DirectorIndex, 1);
//         const message = 'Deleted success';
//         res.status(200).send(message);
//     }
// });
  