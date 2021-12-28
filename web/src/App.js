import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import BrightnessAutoIcon from '@material-ui/icons/BrightnessAuto';
import PersonIcon from '@material-ui/icons/Person';
import ComputerIcon from '@material-ui/icons/Computer';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import FaceIcon from '@material-ui/icons/Face';

import { makeStyles } from '@material-ui/core/styles';

import * as firebase from "firebase/app";
import "firebase/analytics";
import "firebase/auth";
import "firebase/firestore";

import Book from './Book';
import Preamble from './Preamble';
import { useLocalStorage } from './LocalStorage';

const firebaseConfig = {
  apiKey: "AIzaSyAIOcRc5qxnGuz6RVH8fj8-0KYFXVkKzds",
  authDomain: "what-can-i-borrow.firebaseapp.com",
  databaseURL: "https://what-can-i-borrow.firebaseio.com",
  projectId: "what-can-i-borrow",
  storageBucket: "what-can-i-borrow.appspot.com",
  messagingSenderId: "182690151317",
  appId: "1:182690151317:web:8f31bc3edd477eaeb4949c",
  measurementId: "G-Z5H2ZKFYGG"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const uiConfig = {
  // Popup signin flow rather than redirect flow.
  signInFlow: 'popup',
  // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
  signInSuccessUrl: '/',
  // We will display Google and Facebook as auth providers.
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ],
};

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));


function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      Gareth Cronin
      {' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

export default function App() {

  const [loading, setLoading] = React.useState(false);
  const [awards, setAwards] = React.useState([]);
  const [books, setBooks] = React.useState([]);
  const [selectedAward, selectAward] = useLocalStorage('previouslySelectedAward', '');
  const [selectedLibrary, selectLibrary] = useLocalStorage('previouslySelectedLibrary', 'Auckland');
  const [userToRead, setUserToRead] = React.useState();

  const [isSignedIn, setIsSignedIn] = React.useState(false);

  React.useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged(user => {
      setIsSignedIn(!!user);
      if (!user) {
        setUserToRead(undefined);
      }
    });
    return () => unregisterAuthObserver();
  }, []);


  const libraryNameToDbList = (libraryName) => {
    return libraryName === 'Wellington' ? 'wellington' : 'auckland';
  };

  const loadListsForLibrary = async (library) => {
    setBooks([]);
    setLoading(true);

    const querySnapshot = await db.collection(libraryNameToDbList(library)).get();
    const allLists = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      allLists.push({
        name: data.name,
        id: data.id,
        type: data.type
      });
    });
    allLists.sort((left, right) => {
      if (left.type === right.type) {
        return (left.name < right.name) ? -1 : (left.name > right.name) ? 1 : 0;
      }
      else {
        return (left.type < right.type) ? -1 : 1;
      }
    });
    setAwards(allLists);

    // see if we have a user to-reads list
    if (firebase.auth().currentUser) {
      const userId = firebase.auth().currentUser.uid;
      const toReadData = await db.collection('usertoreads').doc(userId).get();
      if (toReadData.exists) {
        setUserToRead(toReadData.data());
      }

    }

    setLoading(false);
  }

  const loadBooksForAward = async (award) => {
    setBooks([]);
    setLoading(true);
    selectAward(award);

    if (award === 'toread' && userToRead) {
      setBooks(userToRead[libraryNameToDbList(selectedLibrary)]);
    }
    else {
      const awardRef = db.collection(libraryNameToDbList(selectedLibrary)).doc(award);
      const awardDoc = await awardRef.get();
      if (awardDoc.exists) {
        setBooks(awardDoc.data().books);
      }
      else {
        console.error('Could find the award doc', award);
      }
    }

    setLoading(false);
  }

  React.useEffect(() => {
    if (selectedLibrary) {
      loadListsForLibrary(selectedLibrary);
      if (selectedAward) {
        loadBooksForAward(selectedAward);
      }
    }
  },
    [selectedLibrary]
  );

  React.useEffect(() => {
    if (selectedAward) {
      loadBooksForAward(selectedAward);
    }
  },
    [selectedAward, userToRead]);

  const classes = useStyles();

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          What can I borrow?
        </Typography>
        <Preamble firebase={firebase} uiConfig={uiConfig} isSignedIn={isSignedIn} />
        <Box my={4}>
          {loading && <CircularProgress />}
          {!loading && awards && (
            <>
              <FormControl className={classes.formControl}>
                <InputLabel id="select-library-label">Select a library</InputLabel>
                <Select
                  labelId="select-library-label"
                  id="select-library"
                  value={selectedLibrary}
                  onChange={(event) => {
                    selectLibrary(event.target.value);
                  }}
                >
                  <MenuItem value='Auckland'><Typography>Auckland</Typography></MenuItem>
                  <MenuItem value='Wellington'><Typography>Wellington</Typography></MenuItem>
                </Select>
              </FormControl>
              <FormControl className={classes.formControl}>
                <InputLabel id="demo-simple-select-label">Select a list</InputLabel>
                <Select
                  labelId="award-select-label"
                  id="award-select"
                  value={selectedAward}
                  onChange={(event) => {
                    selectAward(event.target.value);
                  }}
                >
                  {(userToRead && awards.length > 0) && (
                    <MenuItem key='toread' value='toread'>
                      <ListItemIcon>
                        <FaceIcon />
                      </ListItemIcon>
                      <Typography variant="inherit" noWrap>My "to read" list</Typography>
                    </MenuItem>
                  )}
                  {awards.map((award, index) => {
                    let awardTypeIcon;
                    if (award.type === 'Award') {
                      awardTypeIcon = <BrightnessAutoIcon fontSize="small" />;
                    }
                    else if (award.type === 'Goodreads List') {
                      awardTypeIcon = <PersonIcon fontSize="small" />;
                    }
                    else if (award.type === 'Goodreads List (Tech)') {
                      awardTypeIcon = <ComputerIcon fontSize="small" />;
                    }
                    else if (award.type === 'Publisher List') {
                      awardTypeIcon = <MenuBookIcon fontSize="small" />;
                    }
                    return (
                      <MenuItem key={index} value={award.id}>
                        <ListItemIcon>
                          {awardTypeIcon}
                        </ListItemIcon>
                        <Typography variant="inherit" noWrap>
                          {award.name}
                        </Typography>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </>
          )}
        </Box>
        <Box>
          {
            selectedAward && books.length > 0 && (
              <>
                {books.map((book, index) => {
                  return (
                    <Box key={index} marginTop={2}><Book book={book} /></Box>
                  )
                })}
              </>
            )
          }
        </Box>
        <Copyright />
      </Box>
    </Container>
  );
}
