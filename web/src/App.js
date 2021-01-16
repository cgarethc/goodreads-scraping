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
        Gareth Cronin
      {' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

export default function App() {
  const previouslySelectedAward = window.localStorage.getItem('previouslySelectedAward');
  const previouslySelectedLibrary = window.localStorage.getItem('previouslySelectedLibrary');
  if (!previouslySelectedLibrary) {
    window.localStorage.setItem('previouslySelectedLibrary', 'Auckland');
  }

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
    window.localStorage.setItem('previouslySelectedLibrary', library);
    setLoading(true);
    db.collection(libraryNameToDbList(library)).get().then((querySnapshot) => {
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
      loadAndSelectLibrary(selectedLibrary);
    }
    else if (awards.length > 0 && previouslySelectedAward && !selectedAward) {
      selectAward(previouslySelectedAward);
    }
    else if (selectedAward && books.length === 0) {
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
        <Preamble />
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
                    loadBooksForAward(event.target.value);
                  }}
                >
                  {awards.map((award, index) => {
                    let awardTypeIcon;
                    if(award.type === 'Award'){
                      awardTypeIcon = <BrightnessAutoIcon fontSize="small"/>;
                    }
                    else if(award.type === 'Goodreads List'){
                      awardTypeIcon = <PersonIcon fontSize="small"/>;
                    }
                    else if(award.type === 'Goodreads List (Tech)'){
                      awardTypeIcon = <ComputerIcon fontSize="small"/>;
                    }
                    else if(award.type === 'Publisher List'){
                      awardTypeIcon = <MenuBookIcon fontSize="small"/>;
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
