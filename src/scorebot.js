const Eris = require('eris');
const mongo = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const assert = require('assert');

const client = new mongo(url);
const bot = new Eris.CommandClient("token", {}, {prefix: "$", description: "ScoreBot", owner: "You#0001"} );


bot.on("ready", () => {
    console.log(`Logged in ${bot.user.username}!`);
});

bot.registerCommand("createteam", function(msg, args) {
    client.connect(function(err) {
        assert.equal(null, err);
        const db = client.db('scorebot').collection('teams').insertOne({"score": 0, "name": args[0]});
    });
    bot.createMessage(msg.channel.id, `New team made with name ${args[0]}`)
}, {requirements: {permissions: {"administrator": true}}, argsRequired: true});

bot.registerCommand("highscores", function(msg, args) {
    client.connect(function(err) {
        assert.equal(null, err);
        const teams = client.db('scorebot').collection('teams').find({}).sort({score: -1}).toArray(function(err, docs) {
            assert.equal(err, null);
            console.log(docs)
            bot.createMessage(msg.channel.id, {embed: {title: "Highscores", description: `:first_place: ${docs[0].name} - ${docs[0].score}\n:second_place: ${docs[1].name} - ${docs[1].score}\n:third_place: ${docs[2].name} - ${docs[2].score}`}});
        });
    });
});

bot.registerCommand("addscore", function(msg, args) {
    let team = args[0];
    team = team.charAt(0).toUpperCase() + team.slice(1);
    let score = Number(args[1]);
    if (isNaN(score)) {
        return bot.createMessage(msg.channel.id, 'Not a number')
    }
    client.connect(function(err) {
        assert.equal(null, err);
        client.db('scorebot').collection('teams').updateOne({"name": team}, {$inc: {"score": score}});
        bot.createMessage(msg.channel.id, `${score} points added to team ${team}!`)
    });
}, {requirements: {permissions: {"administrator": true}}, argsRequired: true});

bot.registerCommand("removescore", function(msg, args) {
    let team = args[0];
    team = team.charAt(0).toUpperCase() + team.slice(1);
    let score = Number(args[1]);
    if (isNaN(score)) {
        return bot.createMessage(msg.channel.id, 'Not a number')
    }
    client.connect(function(err) {
        assert.equal(null, err);
        client.db('scorebot').collection('teams').updateOne({"name": team}, {$inc: {"score": -score}});
        bot.createMessage(msg.channel.id, `${score} punten removed form team ${team}!`)
    });
}, {requirements: {permissions: {"administrator": true}}, argsRequired: true});

bot.connect();