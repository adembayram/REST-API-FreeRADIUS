'use strict';

const mongoose = require('mongoose'),
  Accounting = mongoose.model('Accounting'),
  Users = mongoose.model('Users'),
  Profiles = mongoose.model('Profiles');

const crypto = require('crypto');


exports.check = function(req, res) {

  Users.findOne({ login: req.params.login })
  .then((result) => {
    if (result == null) {
      res.status(401).json({ 'Reply-Message': 'Login invalid' });
    } else {
      res.set('Content-Type', 'application/json');
      res.sendStatus(204);
    }
  })
  .catch((error) => {
    res.status(500).send(error);
  });


};

exports.auth = function(req, res) { 


    // Örnek değerler
 
  

  Users.findOne({ login: req.params.login })
  .populate('profile')
  .then(auth => {   

    //const challenge = Buffer.from(req.params.challenge, 'hex');
    //const password = auth.password;
    //const receivedResponse = req.params.password2; // Gelen yanıt değeri

    //const calculatedResponse = chapAuthenticate(challenge, password);


    if (!auth) {
      return res.status(401).json({ 'Reply-Message': 'Login disabled' });
    } else if (auth.password !== req.params.password) {
      return res.status(401).json({ 'Reply-Message': 'Wrong Password' });
    } else if ((auth.register_date + auth.profile.AccessPeriod) < new Date()) {
      return res.status(401).json({ 'Reply-Message': 'Access time expired' });
    } else {
      res.set('Content-Type', 'application/json');
      res.json({        
        'WISPr-Bandwidth-Max-Down': auth.profile.MaxDownload,
        'WISPr-Bandwidth-Max-Up': auth.profile.MaxUpload,
        'Session-Time': 3600
      });
    }
  })
  .catch(err => {
    res.status(500).send(err);
  });


};

exports.accounting = function(req, res) {

  console.log(req.body);

  const new_entry = new Accounting(req.body);
  try{

    new_entry.save();
    res.send(new_entry);
  }catch(error){

    res.send(error)
  }
};



exports.list_all_users = function(req, res) {

  Users.find().populate('profile','profile-name -_id').then((err,result)=> {

    if (err) {
      res.send(err)
    }
    res.send(result)


  });
};

exports.update_user = function(req, res) {
  Users.findOneAndUpdate(
    { _id: req.params.userID },
    req.body,
    { new: true }
  )
    .then(user => {
      res.json({ message: 'User successfully updated', user });
    })
    .catch(err => {
      res.status(500).send(err);
    });
  
};

exports.remove_user = function(req, res) {

  Users.deleteOne({ _id: req.params.userID })
  .then(() => {
    res.json({ message: 'User successfully removed' });
  })
  .catch(err => {
    res.status(500).send(err);
  });

};

exports.create_profile = async function(req, res) {
    const new_profile = new Profiles(req.body);
  try{
    await new_profile.save();
    res.send(new_profile);
  }catch(error){
    res.status(500).send(error);
  }

};


exports.create_user = function(req, res) {
  const new_user = new Users(req.body);

  try {
    new_user.save();
    res.send(new_user);
  } catch (error) {
    res.status(500).send(error);
  }


};

exports.list_all_profiles = function(req, res) {
  Profiles.find().then((err,result)=> {
    if (err) {
      res.send(err)
    }
    res.send(result)

  });

};

exports.update_profile = function(req, res) {
 /* Profiles.findOneAndUpdate(req.params.profileID, req.body, {new: true}, function(err, profile) {
    if (err)
      res.send(err);
    res.json({ message: 'Profile successfully updated' });
  });*/

  Profiles.findOneAndUpdate(
    { _id: req.params.profileID },
    req.body,
    { new: true }
  )
    .then(profile => {
      res.json({ message: 'Profile successfully updated', profile });
    })
    .catch(err => {
      res.status(500).send(err);
    });

};

exports.remove_profile = function(req, res) { 
  const del = Profiles.deleteOne({_id: req.params.profileID}).then((err,result) => {
    if (err) {
      res.send(err)
    }
    res.send(result)  

  });  
};


function chapAuthenticate(challenge, password) {
  // Challenge değeri ve şifre arasında MD5 karma işlemi uygulayarak yanıtı hesaplayın
  const response = crypto.createHash('md5')
    .update(Buffer.concat([challenge, Buffer.from(password, 'utf8')]))
    .digest('hex');
  
  return response;
};