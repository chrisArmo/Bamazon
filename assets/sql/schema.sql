CREATE DATABASE bamazon
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE bamazon;

CREATE TABLE product (
    item_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(100) NOT NULL,
    department_name VARCHAR(50) NOT NULL,
    price DECIMAL(7,2) NOT NULL,
    stock_quantity INT(11)
);