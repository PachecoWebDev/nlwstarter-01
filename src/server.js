const express = require('express');
const server = express();

const db = require('./database/db');

server.use(express.static('public'));

// Habilitar o uso do req.body na aplicação
server.use(express.urlencoded({ extended: true }));

const nunjucks = require('nunjucks');

nunjucks.configure('src/views', {
  express: server,
  noCache: true
});

server.get('/', (req,res) => {
  return res.render('index.html');
});

server.get('/create-point', (req, res) => {
  return res.render('create-point.html');
});

server.post('/save-point', (req, res) => {
  // Inserir os dados no db
  const query = `
    INSERT INTO places (
      image, 
      name, 
      address, 
      address2, 
      state, 
      city, 
      items
    ) VALUES (?, ?, ?, ?, ?, ?, ?);
  `;

  const values = [
    req.body.image,
    req.body.name,
    req.body.address,
    req.body.address2,
    req.body.state,
    req.body.city,
    req.body.items
  ];

  function afterInsertData(err) {
    if (err) {
      console.log(err);
      // Terminar essa função
      return res.render("create-point.html", {unsaved: true});
    }

    return res.render("create-point.html", {saved: true});
  }

  db.run(query, values, afterInsertData);
});

server.get('/search', (req,res) => {
  const search = req.query.search;

  if (search == "") {
    return res.render('search-results.html', { total: 0 });
  }


  // Pegar os dados do banco de dados
  db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function(err, rows) {
    if (err) {
      return console.log(err);
    }

    const total = rows.length;

    // Mostrar a pág html com os dados do bd
    return res.render('search-results.html', { places: rows, total });
  });
});

//Está deletando, faltando trazer os itens restantes para a página
// server.post('/delete/:id', (req,res) => {
//   const {id} = req.params;

//   db.run(`DELETE FROM places WHERE id = ?`, id, function(err){
//     if (err) {
//       return console.log(err);
//     }

//     return res.location('/search');
//   });
// });

server.listen(3000);