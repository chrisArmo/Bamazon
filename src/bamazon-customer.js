/**
 * Bamazon Customer
 */

// Dependencies
// ----------------------------------------

const inquirer = require("inquirer"),
mysql = require("mysql");

// Global Variables
// ----------------------------------------

// MySQL connection
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "bamazon",
    socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock"
});

// Functions
// ----------------------------------------

// Get products
function getProducts(callback) {
    let query = "SELECT product_name, stock_quantity ";
    query += "FROM product ";
    query += "ORDER BY department_name, product_name";
    connection.query(
        query,
        (err, res) => {
            if (!err) callback(res);
            else console.log(err);
        }
    );
}

// Display & get product + quantity
function displayProducts(products) {
    const productNames = products.map((product) => (
        `${product.product_name} [${product.stock_quantity}]`
    ));
    inquirer
    .prompt([
        {
            type: "list",
            name: "product",
            message: "What product would you like to buy?",
            choices: productNames
        }, {
            type: "input",
            name: "quantity",
            message: "How many would you like to purchase?"
        }
    ])
    .then((data) => {
        const product = data.product.replace(/\s\[\d+\]/ig, ""),
        quantity = data.quantity.trim();
        console.log("Product:", product, "\nQuantity:", quantity);
        connection.end();
    });
}

// Main
// ----------------------------------------

// Connect to database
connection.connect((err) => {
    if (err) throw err;
    getProducts(displayProducts);
});
