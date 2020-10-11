'use strict';

const admin = require('firebase-admin');
const serviceAccount = require('./what-can-i-borrow-firebase-adminsdk-8nxq2-60dfb93da5.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://what-can-i-borrow.firebaseio.com"
});
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

db.collection('auckland').select('name').get().then((querySnapshot) => {
  querySnapshot.forEach((doc) => {
    console.log(doc.data());
  });
});

// db.collection('auckland').where('name', '==', 'Orange Prize for Fiction').get().then((querySnapshot) => {
//   querySnapshot.forEach((doc) => {
//     console.log(doc.data());
//   });
// });
