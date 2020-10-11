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

import { makeStyles } from '@material-ui/core/styles';

import * as firebase from "firebase/app";
import "firebase/analytics";
import "firebase/auth";
import "firebase/firestore";

import Book from './Book';
import Preamble from './Preamble';

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

  const [loading, setLoading] = React.useState(false);
  const [awards, setAwards] = React.useState([]);
  const [books, setBooks] = React.useState([]);
  const [selectedAward, selectAward] = React.useState('');
  const [selectedLibrary, selectLibrary] = React.useState(previouslySelectedLibrary ? previouslySelectedLibrary : 'Auckland');

  const libraryNameToDbList = (libraryName) => {
    return libraryName === 'Wellington' ? 'wellington' : 'auckland';
  };

  const loadAndSelectLibrary = (library) => {
    setBooks([]);
    selectLibrary(library);
    selectAward('');
    setLoading(true);
    window.localStorage.setItem('previouslySelectedLibrary', library);
    db.collection(libraryNameToDbList(library)).get().then((querySnapshot) => {
      const allLists = [];
      querySnapshot.forEach((doc) => {
        allLists.push({
          name: doc.data().name,
          id: doc.data().id
        });
      });
      setAwards(allLists);
      setLoading(false);
    });
  }

  const loadBooksForAward = async (award) => {
    setBooks([]);
    setLoading(true);
    selectAward(award);
    const awardRef = db.collection(libraryNameToDbList(selectedLibrary)).doc(award);
    const awardDoc = await awardRef.get();
    if (awardDoc.exists) {
      setBooks(awardDoc.data().books);
      window.localStorage.setItem('previouslySelectedAward', award);
    }
    else {
      console.error('Could find the award doc', award);
    }
    setLoading(false);
  }

  React.useEffect(() => {
    if (awards.length === 0 && !loading && selectedLibrary) {
      setLoading(true);
      db.collection(libraryNameToDbList(selectedLibrary)).get().then((querySnapshot) => {
        const allLists = [];
        querySnapshot.forEach((doc) => {
          allLists.push({
            name: doc.data().name,
            id: doc.data().id
          });
        });
        setAwards(allLists);
        setLoading(false);
      });
    }
    else if (awards.length > 0 && previouslySelectedAward && !selectedAward) {
      selectAward(previouslySelectedAward);
    }
    else if(selectedAward && books.length === 0){
      loadBooksForAward(selectedAward);
    }
  },
    [awards.length, loading, selectedLibrary, books.length, previouslySelectedAward]
  );

  const classes = useStyles();

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          What can I borrow?
        </Typography>
        <Preamble/>
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
                    loadBooksForAward(event.target.value);
                  }}
                >
                  {awards.map((award, index) => {
                    return <MenuItem key={index} value={award.id}>{award.name}</MenuItem>
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
