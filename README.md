# Purematch Backend

## Overview

### Prerequisites:
- PostgreSQL 14.6
- Node.js 16.14

To test the application:
1. create an env variable with the following variables
```
POSTGRES_USER='example_user'
POSTGRES_PASSWORD='123456789'

JWT_SECRET="super_secret"

AWS_ACCESS_KEY_ID='your-aws-key'
AWS_SECRET_ACCESS_KEY='your-aws-secret-access-key'
AWS_REGION=us-east-1
AWS_BUCKET_NAME='your-s3-bucket-name'
```
4. run `npm install`
5. run `npm run start`

## Technologies
- Node.js
- Express.js
- Sequelize
- PostgreSQL
- S3


## Requirements

### Req1

- Created Express.js app and used PostgreSQL as database.
- Made an auth route where user can register and login itself. 
- Required fields of name, email and password using error handling, validation on models, and constraints on database tables.
- User can login with its email and password and gets a JWT token. Argon2 is used to verify that password hash.
- Logged in users can create a post only when JWT token is included in the headers. 
- Post has 3 attribues title, description and a photo.

Registration with JWT
![image](https://user-images.githubusercontent.com/86270564/209207619-d51cf776-a26e-4b37-bdb7-4d4c2257b3dc.png)

Login with JWT
![image](https://user-images.githubusercontent.com/86270564/209207920-e48a4809-0907-40de-b141-9e6fa90e7699.png)

Create A Post
![image](https://user-images.githubusercontent.com/86270564/209208232-3fee63a3-69c7-4191-86a4-caeba27a110d.png)

	
### Req2

- A post is forced to have an attribute when created by ensuring "title" as a required and non-nullable field
- Get post route will return an elapsed time (i.e. 2s ago, 10d ago, 4w ago, 8m ago and 1yr ago)
- A post can have multiple photos but atmost 5 uploaded to AWS S3 with its metadata added to postgreSQL
- A post can be editied including the photo metadata and instance from S3

AWS S3 Uploaded photos
![image](https://user-images.githubusercontent.com/86270564/209209619-9fa776bb-196f-47bb-afc9-468bf7bbc8d9.png)

Elapsed Time for post
![image](https://user-images.githubusercontent.com/86270564/209210024-9f497dc2-e0f2-4050-83c8-80f5425806b5.png)

Maximum photos per post error handling
![image](https://user-images.githubusercontent.com/86270564/209209141-cc61f28e-0d4b-4592-80fb-de8cd0a1d895.png)

Edit a post including the photos from S3
![image](https://user-images.githubusercontent.com/86270564/209209313-ed0843d1-8121-4731-9e2a-bd59a1acffe5.png)

	
### Req3

- A post can have multiple comments. Comments will show the user who commented and the comment
- Added pagination in the post and in the comments of the post
- User have the option to create their username


Comment instance showing the comment and the author of the comment
![image](https://user-images.githubusercontent.com/86270564/209210616-bf0c19e3-9958-4fdb-8436-58652bc716a3.png)

Pagination of post
![image](https://user-images.githubusercontent.com/86270564/209211231-ff1a66b3-99f0-43ef-bfc1-8d185f2b599f.png)

Pagination of comment from post
![image](https://user-images.githubusercontent.com/86270564/209211294-cf8e2a10-fe53-4631-80ff-5f61de147d0c.png)

Ability to add username
![image](https://user-images.githubusercontent.com/86270564/209211628-ad77a286-7bb1-4520-a81b-3c67e7b6f148.png)
