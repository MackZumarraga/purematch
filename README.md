# Purematch Backend

## Overview


To test the application:
1.

## Technologies
- Node.js
- Express.js
- Sequelize
- PostgreSQL


## Requirements

### Req1

- Created Express.js app and used PostgreSQL as database.
- Made an auth route where user can register and login itself. 
- Required fields of user are name, email and password using validation on models and constraints on database tables.
- User can login with its email and password and gets a JWT token. Argon2 is used to verify that password hash.
- Logged in users can create a post only when JWT token is included in the headers. 
- Post has 3 attribues title, description and a photo.

Registration Validation
![image](https://user-images.githubusercontent.com/86270564/208272756-25523b6a-eb02-4d4e-88df-5c9590f6770d.png)

Login Validation
![image](https://user-images.githubusercontent.com/86270564/208272834-805dec13-d16c-454b-aeab-c212f5132075.png)

Login with JWT Token
![image](https://user-images.githubusercontent.com/86270564/208273043-f6da1e31-9fbc-4b27-abe9-78c0fa3accab.png)


Create A Post (Logged In)
![image](https://user-images.githubusercontent.com/86270564/208273240-dd841703-a06d-4ede-bce4-59ea0fb693e9.png)

Create A Post (Logged Out)
![image](https://user-images.githubusercontent.com/86270564/208275257-159a8f7f-fcda-485d-ba61-87164671d748.png)

	
### Req2

- xyz  
	
### Req3

- xyz






