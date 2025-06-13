const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./yourdb.sqlite', (err) => {
  if (err) {
    console.error('Gabim gjatë hapjes së DB:', err.message);
  } else {
    console.log('DB u hap me sukses.');
    db.run(`CREATE TABLE IF NOT EXISTS consumers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      surname TEXT NOT NULL,
      address TEXT
    )`, (err) => {
      if (err) {
        console.error('Gabim gjatë krijimit të tabelës:', err.message);
      } else {
        console.log('Tabela consumers u krijua ose ekzistonte.');
        // Shto të dhëna testuese nëse tabela ishte bosh
        db.get('SELECT COUNT(*) AS count FROM consumers', (err, row) => {
          if (row.count === 0) {
            db.run(`INSERT INTO consumers (name, surname, address) VALUES 
              ('Arben', 'Hoxha', 'Rruga 1'),
              ('Elira', 'Dema', 'Rruga 2'),
              ('Ilir', 'Meta', 'Rruga 3'),
              ('Blerina', 'Kola', 'Rruga 4'),
              ('Jon', 'Leka', 'Rruga 5')
            `, (err) => {
              if (err) console.error('Gabim në insert:', err.message);
              else console.log('Të dhënat testuese u shtuan.');
            });
          }
        });
      }
    });
  }
});

module.exports = db;
