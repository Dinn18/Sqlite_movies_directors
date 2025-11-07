require('dotenv'). config();
const sqlite3 = require('sqlite3');
const dbSource1 = process.env.DB_SOURCE_1; // movies
const dbSource2 = process.env.DB_SOURCE_2; // directors

const dbMovies = new sqlite3.Database(dbSource1, (err) => {
  if (err) {
    console.error("Error");
  } else {
    console.log(`Connected to database : ${dbSource1}`);
    dbMovies.run(`
        CREATE TABLE IF NOT EXISTS movies (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            director TEXT NOT NULL,
            year integer NOT NULL
        )
    `, (err) => {
        if (err) {
            console.log("Tabel sudah ada");
        } else {
            const insert = 'INSERT INTO movies ( id, title, director, year) VALUES (?,?,?,?)';
            dbMovies.run(insert, [ 1, 'Bettle trought the heaven', 'Ahmad Maulidin', 2014]);
            dbMovies.run(insert, [ 2, 'Prefect World', 'Yushril', 2020]);
            dbMovies.run(insert, [ 3, 'Thorne Of Seal', 'Firman', 2082]);
        }
    });
    
    dbMovies.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE NULL,
            password TEXT NOT NULL
        )
    `, (err) => {
      if (err) {
        console.error('gagal membuat table user:', err.message);
      }
    });
  }
});

const dbDirectors = new sqlite3.Database(dbSource2, (err) => {
  if (err) {
    console.error("Error");
  } else {
    console.log(`Connected to database : ${dbSource2}`);

    dbDirectors.run(`
        CREATE TABLE IF NOT EXISTS directors (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            brithYears TEXT NOT NULL,
            noHP TEXT NOT NULL
        )
    `, (err) => {
        if (err) {
            console.log("Tabel sudah ada");
        } else {
            const insert = 'INSERT INTO directors ( id, name, brithYears, noHP) VALUES (?,?,?,?)';
            dbDirectors.run(insert, [ 1, 'Ahmad Maulidin', 2000, '085704159122']);
            dbDirectors.run(insert, [ 2, 'Achmad Fahmi Fuady', 2001, '085123456789']);
            dbDirectors.run(insert, [ 3, 'Wilson Fernandes', 2002, '111222333444']);
        }
    });
  }
});



module.exports = {dbMovies, dbDirectors};