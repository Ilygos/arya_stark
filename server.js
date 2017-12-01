var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;

//==============Server================


var app = express();

var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/form.html');
});

app.get('/drop', function (req, res) {
    dropCollection();
    res.end('Collection dropped');
})

app.post('/sendData', function (req, res) {
    var reqBody = req.body;
    var user = {
        username: reqBody.username,
        coinLevel1: reqBody.coinLevel1,
        coinLevel2: reqBody.coinLevel2,
        coinLevel3: reqBody.coinLevel3,
        powerUpJump: reqBody.powerUpJump,
        powerUpShot: reqBody.powerUpShot,
        powerUpShield: reqBody.powerUpShield
    };
    insertOrUpdate(user, function () {
        descendingUsers(function(users) {
            displayUsers(res, users);
        })
    });
});

app.post('/resetEntry', function (req, res) {
    var reqBody = req.body;
    var user = {
        username: reqBody.username
    };
    removeUser(user.username);
});

app.post('/retrieveData', function (req, res) {
    var reqBody = req.body;
    fetchUsers({
        username: reqBody.username
    }, function (users, res) {
        if (users.length > 0) {
            res.send(users);
            res.end();
        } else {
            insertUser(
              {
                username: reqBody.username,
                coinLevel1 : [],
                coinLevel2 : [],
                coinLevel3 : [],
                powerUpJump : false,
                powerUpShot : false,
                powerUpShield : false
              }, function()
          {
            fetchUsers({
              username: reqBody.username
            }, function (users, res)
          {
            res.send(users);
            res.end();
          }, res)
          });
        }
    }, res);

});

app.listen(port, function () {
    console.log('Server is running on port: ' + port);
});




//=====================View==============

function displayUsers (res, users) {
    res.write('<table>');

    res.write('<tr>');
    res.write('<th>Utilisateurs</th>');
    res.write('<th>coinLevel1</th>');
    res.write('<th>coinLevel2</th>');
    res.write('<th>coinLevel3</th>');
    res.write('<th>powerUpJump</th>');
    res.write('<th>powerUpShot</th>');
    res.write('<th>powerUpShield</th>');
    res.write('</tr>');

    for (var i in users) {
        var user = users[i];
        var username = user.username;
        var coinLevel1 = user.coinLevel1;
        var coinLevel2 = user.coinLevel2;
        var coinLevel3 = user.coinLevel3;
        var powerUpJump = user.powerUpJump;
        var powerUpShot = user.powerUpShot;
        var powerUpShield = user.powerUpShield;
        res.write('<tr>');
        res.write('<td>' + username + '</td>');
        res.write('<td>' + coinLevel1 + '</td>');
        res.write('<td>' + coinLevel2 + '</td>');
        res.write('<td>' + coinLevel3 + '</td>');
        res.write('<td>' + powerUpJump + '</td>');
        res.write('<td>' + powerUpShot + '</td>');
        res.write('<td>' + powerUpShield + '</td>');
        res.write('</tr>');
    }

    res.write('</table>');

    res.end();
}





//===============Mongo=================

var url = 'mongodb://lesbeauxgosses:moussaka@ds159254.mlab.com:59254/moussaka_platformer';

var db;
var usersCollection;


MongoClient.connect(url, function (err, _db) {
    db = _db;
    usersCollection = db.collection('users');
});


function insertOrUpdate (user, callback) {
    fetchUsers({
        username: user.username
    }, function (users) {
        if (users.length > 0) {
            updateUser(user, callback);
        } else {
            insertUser(user, callback);
        }
    });
}

function sendOrInsertandSend (p_username, res) {

}


function insertUser (user, callback, res) {
    usersCollection.insertOne(user, callback);
}


function updateUser (user, callback) {
    usersCollection.updateOne({
        username: user.username
    }, {
        $set: {
          coinLevel1 : user.coinLevel1,
          coinLevel2 : user.coinLevel2,
          coinLevel3 : user.coinLevel3,
          powerUpJump : user.powerUpJump,
          powerUpShot : user.powerUpShot,
          powerUpShield : user.powerUpShield
        }
    }, callback);
}


function removeUser(pUsername)
{
  usersCollection.remove( { username: pUsername } );
}

function descendingUsers (callback) {
    aggregateUsers([
        {
            $sort : {
                nickname : -1
            }
        }
    ], callback);
}

function fetchUsers (params, callback, res) {
    params = params || {};

    usersCollection.find(params).toArray(function (err, users) {
        callback(users, res);
    });
}


function aggregateUsers (params, callback) {
    usersCollection.aggregate(params).toArray(function (err, users) {
        callback(users);
    });
}


function dropCollection (callback) {
    usersCollection.drop(callback);
}
