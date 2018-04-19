DROP DATABASE IF EXISTS bamazonDB;

CREATE DATABASE bamazonDB;

USE bamazonDB;

CREATE TABLE products (
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(60) NOT NULL,
  department_name VARCHAR(60) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT NULL,
  PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("jeans", "clothing", 12.50, 100), ("socks", "clothing", 15.00, 150), ("creatine", "health/nutrition", 12.00, 50), 
("iron supplement", "health/nutrition", 10.00, 120), ("baby doll", "toys", 25.00, 25), ("nerf gun", "toys", 30.00, 200), 
("iPad", "electronics", 1200.00, 100), ("charging station", "electronics", 259.60, 50), ("Born to Run", "books", 13.50, 25), 
("Girl on the Train", "books", 15.00, 30);