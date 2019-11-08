let mongo  = require('lib/mongoose');
let User  = require('models/user').User;
let db = mongo.connection;

db.on('connected', function(){
  db.dropDatabase()
  .then(()=>{
    let user1 = new User({username: "Вася", password: "secret"});
    let user2 = new User({username: "Петя", password: "secret"});
    let user3 = new User({username: "admin",  password: "secret"});
    return Promise.all([
      user1.save(),
      user2.save(),
      user3.save()
      ])
    .then(()=>{
      User.find()
      .then((data)=>{
        console.log(data);
        db.close();
      });
    });
  })
  .catch((e)=>{
    console.log('Error', e);
    db.close();
  });
});
