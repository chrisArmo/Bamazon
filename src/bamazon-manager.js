/**
 * Bamazon Manager
 */

// Dependencies
// ----------------------------------------

const inquirer = require("inquirer"),
mysql = require("mysql"),
{table} = require("table");

// Global Variables
// ----------------------------------------

// Mysql connection
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "bamazon",
    socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock"
});

// Actions utility
const actions = {};

// View products for sale
actions.viewProductsForSale = () => {
    let query = "SELECT item_id, product_name, price, stock_quantity ";
    query += "FROM product ";
    query += "ORDER BY department_name, product_name";
    connection.query(
        query,
        (err, res) => {
            if (!err) {
                let config,
                    data,
                    output;
                data = res.map((row) => {
                    return [
                        row.item_id,
                        row.product_name,
                        row.price,
                        row.stock_quantity
                    ];
                });
                config = {
                    columns: {
                        0: {
                            alignment: "center",
                            minWidth: 200
                        }
                    }
                };
                output = table(data, config);
                console.log(output);
            } else {
                console.log(err);
            }
            connection.end();
        }
    );
};

// View low inventory products
actions.viewLowInventory = () => {
    let query = "SELECT item_id, product_name, price, stock_quantity ";
    query += "FROM product WHERE stock_quantity <= 5 ";
    query += "ORDER BY department_name, product_name";
    connection.query(
        query,
        (err, res) => {
            if (!err) {
                if (res.length > 0) {
                    let config,
                        data,
                        output;
                    data = res.map((row) => {
                        return [
                            row.item_id,
                            row.product_name,
                            row.price,
                            row.stock_quantity
                        ];
                    });
                    config = {
                        columns: {
                            0: {
                                alignment: "center",
                                minWidth: 10
                            }
                        }
                    };
                    output = table(data, config);
                    console.log(output);
                } else {
                    console.log("No products have a low stock quantity");
                }         
            } else {
                console.log(err);
            }
            connection.end();
        }
    );
};

// Add quantity to inventory
actions.addToInventory = () => {
    let query = "SELECT item_id, product_name, price, stock_quantity ";
    query += "FROM product ";
    query += "ORDER BY department_name, product_name";
    connection.query(
        query,
        (err, res) => {
            if (!err) {
                getProductAddInventory(res, addInventoryToProduct);
            } else {
                console.log(err);
            }
        }
    );
};

// Add new product 
actions.addNewProduct = () => {
    inquirer
    .prompt([
        {
            type: "input",
            name: "product",
            message: "What is the name of the product that you would like to add? "
        }, {
            type: "input",
            name: "department",
            message: "What department does the product belong to? "
        }, {
            type: "input",
            name: "price",
            message: "How much does the product cost? "
        }, {
            type: "input",
            name: "quantity",
            message: "How many product items would you like to stock? "
        }
    ])
    .then((data) => {
        const {product, department, price, quantity} = data,
        productDepartmentPattern = /^[a-z]{1,20}(\s&)?(\s[a-z]{1,20}){0,10}$/i,
        pricePattern = /^\d+(\.\d{1,2})?$/,
        quantityPattern = /^\d+$/;
        if (productDepartmentPattern.test(product) &&
            productDepartmentPattern.test(department) &&
            pricePattern.test(price) &&
            quantityPattern.test(quantity)
        ) {
            addProduct(product, department, price, quantity);
        } else {
            console.log("Invalid input, please try again");
            addNewProduct();
        }
    });
};

// Functions
// ----------------------------------------

// Camel case string
function camelCase(text) {
    return `${text[0].toLowerCase()}${text.substring(1).replace(/\s/g, "")}`;
}

// Add new product
function addProduct(product, department, price, quantity) {
    let query = "INSERT INTO product (product_name, department_name, price, stock_quantity) ";
    query += "VALUES (?, ?, ?, ?)";
    connection.query(
        query,
        [product, department, price, quantity],
        (err, res) => {
            if (!err) {
                console.log(`Successfully added item "${product}"`);
            } else {
                console.log(err);
            }
            connection.end();
        }
    );
}

// Add inventory to product
function addInventoryToProduct(id, productName, quantity) {
    inquirer
    .prompt([
        {
            type: "input",
            name: "quantity",
            message: `How much inventory would you like to add for item "${productName}"`
        }
    ])
    .then((data) => {
        const validQuantityPattern = /^\d+$/,
        {quantity: addQuantity} = data;
        if (validQuantityPattern.test(addQuantity.trim())) {
            const newQuantity = parseInt(addQuantity.trim(), 10) + parseInt(quantity, 10);
            let query = `UPDATE product SET stock_quantity = ${newQuantity} `;
            query += `WHERE item_id = ${id}`;
            connection.query(
                query,
                (err, res) => {
                    if (!err) {
                        console.log(
                            "Successfully increased stock for item " +
                            `"${productName}" by ${addQuantity}`
                        );
                    } else {
                        console.log(err);
                    }
                    connection.end();
                }
            );
        } else {
            console.log("Invalid quantity amount!");
            addInventoryToProduct(id, productName, quantity);
        }
    });
}

// Get product inventory
function getProductAddInventory(products, callback) {
    const productStrings = products.map((product) => {
        return `#${product.item_id} ${product.product_name} $${product.price} [${product.stock_quantity}]`;
    });
    inquirer
    .prompt([
        {
            type: "list",
            name: "product",
            message: "Which product would you like to add inventory to?",
            choices: productStrings
        }
    ])
    .then((data) => {
        const {product} = data,
        productChunks = product.replace(/(#|\$|\[|\])/g, "").split(" "),
        id = productChunks.shift(),
        remLength = productChunks.length - 2,
        productName = productChunks.splice(0, remLength).join(" "),
        quantity = productChunks.pop();
        callback(id, productName, quantity);
    });
}

// Display options
function displayOptions() {
    inquirer
    .prompt([
        {
            type: "list",
            name: "option",
            message: "Select what you would like to do",
            choices: [
                "View Products For Sale",
                "View Low Inventory",
                "Add To Inventory",
                "Add New Product"
            ]
        }
    ])
    .then((data) => {
        actions[camelCase(data.option)]();
    });
}

// Main
// ----------------------------------------

// Connect to mysql database
connection.connect((err) => {
    if (err) throw err;
    displayOptions();
});
