import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import CircularProgress from '@material-ui/core/CircularProgress';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';

import { makeStyles } from '@material-ui/core/styles';

import * as firebase from "firebase/app";
import "firebase/analytics";
import "firebase/auth";
import "firebase/firestore";
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

import Book from './Book';

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
      <Link color="inherit" href="https://material-ui.com/">
        Gareth Cronin
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

export default function App() {
  const previouslySelectedAward = window.localStorage.getItem('previouslySelectedAward');
  const previouslySelectedLibrary = window.localStorage.getItem('previouslySelectedLibrary');

  const [loggedIn, setLoggedIn] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [awards, setAwards] = React.useState([]);
  const [selectedAward, selectAward] = React.useState('');
  const [selectedLibrary, selectLibrary] = React.useState(previouslySelectedLibrary ? previouslySelectedLibrary : 'Auckland');

  React.useEffect(() => {
    firebase.auth().onAuthStateChanged(
      (user) => {
        setLoggedIn(user);
        if (awards.length === 0 && !loading && user) {
          setLoading(true);
          db.collection("lists").get().then((querySnapshot) => {
            const allLists = [];
            querySnapshot.forEach((doc) => {
              allLists.push(doc.data());
            });
            setAwards(allLists);
            if (previouslySelectedAward) {
              selectAward(previouslySelectedAward);
            }
            setLoading(false);
          });
        }
      }
    );

  });

  const uiConfig = {
    signInOptions: [
      // List of OAuth providers supported.
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
      // Avoid redirects after sign-in.
      signInSuccessWithAuthResult: () => false
    }
  };

  const classes = useStyles();

  const findAwardByName = (name) => {
    return awards.find((award) => {
      return name === award.name
    });
  }

  const loadAndSelectLibrary = (library) => {
    selectLibrary(library);
    selectAward('');
    setLoading(true);
    window.localStorage.setItem('previouslySelectedLibrary', library);
    db.collection(library === 'Wellington' ? 'welly' : 'lists').get().then((querySnapshot) => {
      const allLists = [];
      querySnapshot.forEach((doc) => {
        allLists.push(doc.data());
      });
      setAwards(allLists);
      setLoading(false);
    });
  }

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          What can I borrow?
          {loggedIn && <Tooltip title="Click to log out" aria-label="Log out"><Avatar alt={loggedIn.displayName} src={loggedIn.photoURL} onClick={() => firebase.auth().signOut()} /></Tooltip>}
        </Typography>
        <Typography gutterBottom>
          This simple tool compares <a href="https://goodreads.com">Goodreads</a> lists with the digital resources
          (eBooks and eAudioBooks) available at <a href="https://www.aucklandlibraries.govt.nz/">Auckland Libraries</a> or <a href="https://wcl.govt.nz/">Wellington Libraries</a> to help you find your next great read.
          The lists include winners of major literature awards to make sure you're sticking
          to the <strong>really</strong> good stuff 😉.
        </Typography>
        {!loggedIn && <Typography gutterBottom>
          This is a free service that uses a cloud database called "Firestore" which requires a login to
          use. You can use a Google login (GMail) if you have one, or register a username and password if
          you prefer. Your details will not be used for any other purpose.
          To get started, choose an award or a list from the menu…
        </Typography>}
        <Box my={4}>
          {!loggedIn && <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />}
          {loading && loggedIn && <CircularProgress />}
          {!loading && loggedIn && awards && (
            <>
              <FormControl className={classes.formControl}>
                <InputLabel id="select-library-label">Select a library</InputLabel>
                <Select
                  labelId="select-library-label"
                  id="select-library"
                  value={selectedLibrary}
                  onChange={(event) => {
                    loadAndSelectLibrary(event.target.value);
                  }}
                >
                  <MenuItem value='Auckland'>Auckland</MenuItem>
                  <MenuItem value='Wellington'>Wellington</MenuItem>
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
                    window.localStorage.setItem('previouslySelectedAward', event.target.value);
                  }}
                >

                  {awards.map((award, index) => {
                    return <MenuItem key={index} value={award.name}>{award.name}</MenuItem>
                  })}

                </Select>
              </FormControl>
            </>
          )}
        </Box>
        <Box>
          {
            selectedAward && awards.length && (
              <>
                {findAwardByName(selectedAward).books.map((book, index) => {
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
