import React from 'react';

import { Typography, Box, Button, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import BrightnessAutoIcon from '@material-ui/icons/BrightnessAuto';
import PersonIcon from '@material-ui/icons/Person';
import ComputerIcon from '@material-ui/icons/Computer';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import ExitToApp from '@material-ui/icons/ExitToApp';

import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

import CSVReader from 'react-csv-reader'

const useStyles = makeStyles((theme) => ({
  wrapButton: {
    verticalAlign: 'middle',
    display: 'inline-flex'
  }
}));

export default function Preamble(props) {
  const [showDetail, setShowDetail] = React.useState(false);
  const [showUpload, setShowUpload] = React.useState(false);

  const classes = useStyles();

  const onFileLoaded = async (data, fileInfo, userId, db) => {
    const toReadItems = data.filter(item => item[18] === 'to-read');
    console.log('to read', toReadItems.length, 'items', toReadItems, 'for', userId);

    const titles = toReadItems.map((title) => {
      return {
        bookTitle: title[1],
        bookAuthor: title[2],
        bookURL: `https://www.goodreads.com/book/show/${title[0]}`,
        datePub: title[13],
        rating: title[8]
      };
    })
    
    console.log('storing', titles);

    let docRef = db.collection('usertoreads').doc(userId);
    await docRef.set({ id: userId, books: titles });
    setShowUpload(false);
  }

  return (
    <>
      <Typography gutterBottom>
        This simple tool compares <a href="https://goodreads.com">Goodreads</a> lists with the digital resources
          (eBooks and eAudioBooks) available at <a href="https://www.aucklandlibraries.govt.nz/">Auckland Libraries</a> or <a href="https://wcl.govt.nz/">Wellington Libraries</a> to help you find your next great read.
      </Typography>
      {!props.isSignedIn && (<Typography gutterBottom>
          If you'd like to import your Goodreads to-read list and see what is available in that, you can sign in with a Google account or an email address to do so.
      </Typography>)}
      {props.isSignedIn && (<Typography gutterBottom>
          Now you're signed in, you can import your Goodreads export using the button below. Once you've imported the latest version of your Goodreads export, it will take a day or so to appear as a list in the drop-down below.
      </Typography>)}
      <Box display={showDetail ? 'none' : 'block'} className={classes.wrapButton} >
        <Button size="small" color="primary" variant="contained" onClick={event => setShowDetail(true)}>Tell me more</Button>
        {props.isSignedIn && (<Button size="small" color="secondary" variant="contained" onClick={event => setShowUpload(true)} style={{marginLeft:8}}>Import Goodreads</Button>)}
      </Box>
      <Box display={showUpload ? 'block' : 'none'} >
        <CSVReader 
          label="Select your Goodreads library export file..." 
          onFileLoaded={async (data, fileInfo) => {onFileLoaded(data, fileInfo, props.firebase.auth().currentUser.uid, props.firebase.firestore())}}
            />
      </Box>
      <Box display={showDetail ? 'block' : 'none'}>
        {!props.isSignedIn && (
          <>
            <StyledFirebaseAuth uiConfig={props.uiConfig} firebaseAuth={props.firebase.auth()} />
          </>
        )}
        {props.isSignedIn && (
          <div className={classes.wrapButton}>
            <Typography variant="h5">Signed in as {props.firebase.auth().currentUser.displayName}</Typography>
            <Tooltip title='Sign out'><Button onClick={() => props.firebase.auth().signOut()} size='small'><ExitToApp /></Button></Tooltip>
          </div>
        )}
        <Typography>
          The lists include:
          <br /><BrightnessAutoIcon /> Awards
          <br /><PersonIcon /> Goodreads user lists
          <br /><ComputerIcon /> Goodreads user lists about technology
          <br /><MenuBookIcon /> Publisher's lists (e.g. New York Times)
      </Typography>
        <br />
        <Typography gutterBottom>
          I've done my best to de-duplicate books as much as possible. You'll notice that there are multiple eBook
          and eAudiobook editions for some books. These are usually from different publishers and are still worth
          checking to see if one edition is available when another is already checked out.
      </Typography>
        <Typography>
          I use a full text search to find the books, so occasionally it will find a book by the same author with a similar title
          that is not the book on the list, but I figure that's better than not finding the book at all!
      </Typography>
      </Box>
    </>
  );
}