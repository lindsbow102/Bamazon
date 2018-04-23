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
    password: '',
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

            //assign nicknames for each manager choice input.option
			filter: function (val) {
                switch (val) {
                    case 'View Products for Sale':
                        return 'sale';
                        break;
                    case 'View Low Inventory':
                        return 'lowInventory';
                        break;
                    case 'Add to Inventory':
                        return 'addInventory';
                        break;
                    case 'Add New Product':
                        return 'newProduct';
                        break;
                    default:
                        console.log('ERROR: Unsupported operation!');
                }
			}
        }
    ]).then(function(input) {

        //Depending on the manager's choice, run a function that matches that choice
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

//If manager wants to see low inventory (any product that has less than 30 items in stock)
function displayLowInventory() {

	// Construct the db query string
	queryStr = 'SELECT * FROM products WHERE stock_quantity < 30';

	// Make the db query
	connection.query(queryStr, function(err, res) {
		if (err) throw err;

		console.log('Low Inventory Items (below 30): ');
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

// addInventory will guide a manager in adding additional quantify to an existing item
function addInventory() {

	// Prompt the manager to select an item
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

		var item = input.item_id;
		var addQuantity = input.quantity;

		// Query db to confirm that the given item ID exists and to determine the current stock_count
		var queryStr = 'SELECT * FROM products WHERE ?';

		connection.query(queryStr, {item_id: item}, function(err, res) {
			if (err) throw err;

			// If the user has selected an invalid item ID, data array will be empty
			if (res.length === 0) {
				console.log('ERROR: Invalid Item ID. Please select a valid Item ID.');
				addInventory();

			} else {
                var productData = res[0];
                console.log('Updating Inventory...');

				// Construct the updating query string
				var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity + addQuantity) + ' WHERE item_id = ' + item;

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
