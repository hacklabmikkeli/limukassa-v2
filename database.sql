
CREATE TABLE `users` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`name` TEXT NOT NULL,
	`balance` FLOAT NOT NULL,
	`cards` TEXT,
	PRIMARY KEY (`id`)
);

INSERT INTO users (id, name, balance, cards) VALUES (1, "Cappe", 100, "[{}]");