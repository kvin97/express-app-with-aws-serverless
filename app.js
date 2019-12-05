// app.js 
const sls = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const app = express()
app.use(cors());
const AWS = require('aws-sdk');
const USERS_TABLE = process.env.USERS_TABLE;
const dynamoDb = new AWS.DynamoDB.DocumentClient();
app.use(bodyParser.json({ strict: false }));
// Create User endpoint
app.post('/users', function (req, res) {
  const { userId, name, language, description } = req.body;
const params = {
    TableName: USERS_TABLE,
    Item: {
      userId: userId,
      name: name,
      language: language,
      description: description
    },
  };
dynamoDb.put(params, (error) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: `Could not create user ${userId}` });
    }
    res.json({ userId, name, language, description });
  });
})
// Get User endpoint
app.get('/user/:userId', function (req, res) {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId: req.params.userId,
    },
  }
dynamoDb.get(params, (error, result) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: `Could not get user ${userId}` });
    }
    if (result.Item) {
      const {userId, name, language, description} = result.Item;
      res.json({ userId, name, language, description });
    } else {
      res.status(404).json({ error: `User ${userId} not found` });
    }
  });
})

app.get('/users', function (req, res) {
  const params = {
    TableName: USERS_TABLE,
    Select: "ALL_ATTRIBUTES"
  }
  dynamoDb.scan(params, (err, data) => {
  if (err) {
    res.status(400).json({ error: `Could not get user details` });
  } else {
     res.json(data.Items.map(item => {
       return {userId: item.userId, name: item.name, language: item.language, description: item.description}
     }));
  }
});
});

//delete user by userId
app.delete('/user/:userId', function (req, res) {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId: req.params.userId,
    },
  }
dynamoDb.delete(params, (error, result) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: `Could not delete user ${req.params.userId}` });
    }
    else{
      res.json({msg: `successfully deleted user ${req.params.userId}`});
    }
  });
})

module.exports.handler = sls(app)