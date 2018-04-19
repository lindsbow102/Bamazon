var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazonDB"
});


function afterConnection() {
    console.log("Available Items");
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    for (i=0; i<res.length; i++) {
        console.log(JSON.stringify(res[i]));
    }
    connection.end();
  });
}

afterConnection();


