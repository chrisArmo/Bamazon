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
    let query = "SELECT item_id, product_name, price, stock_quantity ";
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

// Make purchase
function makePurchase(id, product, price, quantity, quantityRemaining) {
    let query = "UPDATE product ";
    query += `SET stock_quantity = ${quantityRemaining - quantity} `;
    query += `WHERE item_id = ${id}`;
    const total = `$${(quantity * price).toFixed(2)}`;
    connection.query(
        query,
        (err, res) => {
            if (!err) {
                console.log(
                    `You successfully purchased ${quantity} of item "${product}" for ${total}`
                );
            } else {
                console.log(err);
            }
            connection.end();
        }
    );
}

// Display & get product + quantity
function displayProducts(products) {
    const productNames = products.map((product) => (
        `#${product.item_id} ${product.product_name} $${product.price} [${product.stock_quantity}]`
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
        const remPattern = /(#|\[|\]|\$)/g,
        productChunks = data.product.replace(remPattern, "").split(" "),
        id = productChunks.shift(),
        quantityRemaining = productChunks.pop();
        price = productChunks.pop();
        product = productChunks.join(" ");
        quantity = parseInt(data.quantity.trim(), 10);
        if (typeof quantity === "number" && !isNaN(quantity)) {
            if (quantity <= quantityRemaining) {
                makePurchase(id, product, price, quantity, quantityRemaining);
            } else {
                console.log("Insufficient quantity");
                displayProducts(products);
            }
        } else {
            console.log("Invalid quantity input: quantity must be a valid integer");
            displayProducts(products);
        }
    });
}

// Main
// ----------------------------------------

// Connect to database
connection.connect((err) => {
    if (err) throw err;
    getProducts(displayProducts);
});
