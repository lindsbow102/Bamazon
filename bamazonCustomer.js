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

function displayInventory() {

    queryStr = "SELECT * FROM products";
    connection.query(queryStr, function (err, res) {
        if (err) throw err;
        console.log("Available Items");
        console.log(".................\n");

        var strOut = '';
        for (var i = 0; i < res.length; i++) {
            strOut = '';
            strOut += 'Item ID: ' + res[i].item_id + '  //  ';
            strOut += 'Product Name: ' + res[i].product_name + '  //  ';
            strOut += 'Department: ' + res[i].department_name + '  //  ';
            strOut += 'Price: $' + res[i].price + '\n';

            console.log(strOut);
        }
        connection.end();
        console.log("------------------------------------------------------\n");
        promptUserPurchase();
    });
}
displayInventory();


function validateInput(value) {
    var integer = Number.isInteger(parseFloat(value));
    var sign = Math.sign(value);

    if (integer && (sign === 1)) {
        return true;
    } else {
        return 'Please enter a whole non-zero number.';
    }
}

function promptUserPurchase() {
    inquirer.prompt([
        {
            type: "input",
            name: "item_id",
            message: "Please enter the item ID of the product you want.",
            validate: validateInput,
            filter: Number
        },
        {
            type: 'input',
            name: 'quantity',
            message: 'How many do you need?',
            validate: validateInput,
            filter: Number
        }
    ]).then (function(input) {

        var item = input.item_id;
        var quantity = input.quantity;

        var queryStr = 'SELECT * FROM products WHERE ?';

        connection.query(queryStr, { item_id: item }, function (err, res) {
            if (err) throw err;

            if (res.length === 0) {
                console.log('ERROR: Invalid Item ID. Please select a valid Item ID.');
                displayInventory();
            } else {
                var productData = res[0];
                console.log('productData = ' + JSON.stringify(productData));
				console.log('productData.stock_quantity = ' + productData.stock_quantity);


                if (quantity <= productData.stock_quantity) {
                    console.log('Congratulations, the product you requested is in stock! Placing order!');
                    
                    var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity - quantity) + ' WHERE item_id = ' + item;

                    connection.query(updateQueryStr, function(err, data) {
						if (err) throw err;

						console.log('Your oder has been placed! Your total is $' + productData.price * quantity);
						console.log('Thank you for shopping with us!');
						console.log("\n---------------------------------------------------------------------\n");

						// End the database connection
						connection.end();
                    })
                } else {
					console.log('Sorry, there is not enough product in stock, your order can not be placed as is.');
					console.log('Please modify your order.');
					console.log("\n---------------------------------------------------------------------\n");

					displayInventory();
				}


        }
    });

    

    function runBamazon() {
        // console.log('___ENTER runBamazon___');
    
        // Display the available inventory
        displayInventory();
    }
    
    // Run the application logic
    runBamazon();

    });
}
