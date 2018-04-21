// Pull in required dependencies
var inquirer = require('inquirer');
var mysql = require('mysql');
const cTable = require('console.table');

// Define the MySQL connection parameters
var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,

    // Your username
    user: 'root',

    // Your password
    password: 'root',
    database: 'bamazonDB'
});

// runBamazon will execute the main application logic
function runBamazon() {

    // Display the available inventory
    promptManager();
}
runBamazon();


// promptManagerAction will present menu options to the manager and trigger appropriate logic
function promptManager() {

	// Prompt the manager to select an option
	inquirer.prompt([
		{
			type: 'list',
			name: 'option',
			message: 'Please select an option:',
            choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product'],
            /* put choices into objects and get rif of if/else statements*/
			filter: function (val) {
				if (val === 'View Products for Sale') {
					return 'sale';
				} else if (val === 'View Low Inventory') {
					return 'lowInventory';
				} else if (val === 'Add to Inventory') {
					return 'addInventory';
				} else if (val === 'Add New Product') {
					return 'newProduct';
				} else {
					// This case should be unreachable
					console.log('ERROR: Unsupported operation!');
					exit(1);
				}
			}
        }
    ]).then(function(input) {

        switch(input.option) {
            case 'sale':
                displayInventory();
                break;
            case 'lowInventory':
                displayLowInventory();
                break;
            case 'addInventory':
                addInventory();
                break;
            case 'newProduct':
                createNewProduct();
                break;
            default:
            console.log('ERROR: Unsupported operation!');
        
        }
	})
}


//Let's make the data look pretty in a table
function displayInventory() {
    queryStr = 'SELECT * FROM products';
    connection.query(queryStr, function (err, res) {
        if (err) throw err;
        console.table(res);
        connection.end();
    })
}

function displayLowInventory() {

	// Construct the db query string
	queryStr = 'SELECT * FROM products WHERE stock_quantity < 100';

	// Make the db query
	connection.query(queryStr, function(err, res) {
		if (err) throw err;

		console.log('Low Inventory Items (below 100): ');
		console.table(res);
        connection.end();
		})
    }

// validateInteger makes sure that the user is supplying only positive integers for their inputs
function validateInteger(value) {
	var integer = Number.isInteger(parseFloat(value));
	var sign = Math.sign(value);

	if (integer && (sign === 1)) {
		return true;
	} else {
		return 'Please enter a whole non-zero number.';
	}
}

// validateNumeric makes sure that the user is supplying only positive numbers for their inputs
function validateNumeric(value) {
	// Value must be a positive number
	var number = (typeof parseFloat(value)) === 'number';
	var positive = parseFloat(value) > 0;

	if (number && positive) {
		return true;
	} else {
		return 'Please enter a positive number for the unit price.'
	}
}

// addInventory will guilde a user in adding additional quantify to an existing item
function addInventory() {

	// Prompt the user to select an item
	inquirer.prompt([
		{
			type: 'input',
			name: 'item_id',
			message: 'Please enter the Item ID for stock_count update.',
			validate: validateInteger,
			filter: Number
		},
		{
			type: 'input',
			name: 'quantity',
			message: 'How many would you like to add?',
			validate: validateInteger,
			filter: Number
        }
    ]).then(function(input) {
		// console.log('Manager has selected: \n    item_id = '  + input.item_id + '\n    additional quantity = ' + input.quantity);

		var item = input.item_id;
		var addQuantity = input.quantity;

		// Query db to confirm that the given item ID exists and to determine the current stock_count
		var queryStr = 'SELECT * FROM products WHERE ?';

		connection.query(queryStr, {item_id: item}, function(err, res) {
			if (err) throw err;

			// If the user has selected an invalid item ID, data attay will be empty
			// console.log('data = ' + JSON.stringify(data));

			if (res.length === 0) {
				console.log('ERROR: Invalid Item ID. Please select a valid Item ID.');
				addInventory();

			} else {
                var productData = res[0];
                console.log('Updating Inventory...');

				// Construct the updating query string
				var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity + addQuantity) + ' WHERE item_id = ' + item;
				// console.log('updateQueryStr = ' + updateQueryStr);

				// Update the inventory
				connection.query(updateQueryStr, function(err, res) {
					if (err) throw err;

					console.log('Stock count for Item ID ' + item + ' has been updated to ' + (productData.stock_quantity + addQuantity) + '.');
					console.log("\n---------------------------------------------------------------------\n");

					// End the database connection
					connection.end();
				})
			}
		})
	})
}

// createNewProduct will guide the user in adding a new product to the inventory
function createNewProduct() {

	// Prompt the user to enter information about the new product
	inquirer.prompt([
		{
			type: 'input',
			name: 'product_name',
			message: 'Please enter the new product name.',
		},
		{
			type: 'input',
			name: 'department_name',
			message: 'Which department does the new product belong to?',
		},
		{
			type: 'input',
			name: 'price',
			message: 'What is the price per unit?',
			validate: validateNumeric
		},
		{
			type: 'input',
			name: 'stock_quantity',
			message: 'How many items are in stock?',
			validate: validateInteger
		}
	]).then(function(input) {
		// console.log('input: ' + JSON.stringify(input));

		console.log('Adding New Item: \n    product_name = ' + input.product_name + '\n' +  
									   '    department_name = ' + input.department_name + '\n' +  
									   '    price = ' + input.price + '\n' +  
									   '    stock_quantity = ' + input.stock_quantity);

		// Create the insertion query string
		var queryStr = 'INSERT INTO products SET ?';

		// Add new product to the db
		connection.query(queryStr, input, function (error, results, fields) {
			if (error) throw error;

			console.log('New product has been added to the inventory under Item ID ' + results.insertId + '.');
			console.log("\n---------------------------------------------------------------------\n");

			// End the database connection
			connection.end();
		});
	})
}
