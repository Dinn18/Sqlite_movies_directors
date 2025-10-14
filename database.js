require('dotenv'). config();
const sqlite3 = require('sqlite3');

const dbSource = process.env.DB_SOURCE;

const db = new sqlite3.Database(dbSource, (err) => {
  if (err) {
    console.error("Error");
  } else {
    console.log(`Connected to database : ${dbSource}`);

    db.run(`
        CREATE TABLE IF NOT EXISTS directors (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            brithYears TEXT NOT NULL,
            noHP TEXT NOT NUll,
        )
    `, (err) => {
        if (err) {
            console.log("Tabel sudah ada");
        } else {
            const insert = 'INSERT INTO directors ( id, name, brithYears, noHp) VALUES (?,?,?,?)';
            db.run(insert, [ 1, 'Ahmad Maulidin', 2000, '085704159122']);
            db.run(insert, [ 2, 'Achmad Fahmi Fuady', 2001, '085123456789']);
            db.run(insert, [ 3, 'Wilson Fernandes', 2002, '111222333444']);
        }
    });
  }
});

module.exports = db;