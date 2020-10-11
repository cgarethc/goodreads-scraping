import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import HeadsetIcon from '@material-ui/icons/Headset';
import LocalLibraryIcon from '@material-ui/icons/LocalLibrary';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';

const useStyles = makeStyles({
  root: {
    minWidth: 275,
    flexGrow: 1,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 6,
  },
  cover: {
    width: 70,
  },
});

export default function Book(props) {
  const bookToDisplay = props.book;
  const classes = useStyles();

  const ebooks = bookToDisplay.editions.filter((edition) => { return edition.type === 'eBook'; });
  const ebookButtons = ebooks.map((book, index) => {
    return <span key={index}><Tooltip title='eBook' aria-label='eBook' >
      <Button size="small" href={book.url}><LocalLibraryIcon /></Button>
    </Tooltip></span>;
  });

  const audiobooks = bookToDisplay.editions.filter((edition) => { return edition.type.toUpperCase() === 'EAUDIOBOOK'; });
  const audiobookButtons = audiobooks.map((book, index) => {
    return <span key={index}>
      <Tooltip title='eAudioBook' aria-label='eAudioBook' >
        <Button size="small" href={book.url} ><HeadsetIcon /></Button>
      </Tooltip>
    </span>;
  });

  return (
    <Card className={classes.root}>
      <CardContent>
        <Grid container spacing={1}>
          <Grid item>
            {bookToDisplay.coverURL && <img alt={bookToDisplay.title} src={bookToDisplay.coverURL} />}
          </Grid>
          <Grid item>

          </Grid>
          <Grid item>
            <Typography variant="body1" component="h1">
              {bookToDisplay.title}
            </Typography>
            <Typography color="textSecondary">
              {bookToDisplay.author}
            </Typography>
            {bookToDisplay.awardType &&
              <Typography variant="body2" component="p">
                {bookToDisplay.awardType}
              </Typography>}
          </Grid>
        </Grid>

      </CardContent>
      <CardActions disableSpacing={true}>
        <Tooltip title='Goodreads' aria-label='Goodreads' >
          <Button size="small" href={bookToDisplay.goodreadsURL}><Avatar src="goodreads.png"></Avatar></Button>
        </Tooltip>
        {ebookButtons}
        {audiobookButtons}

      </CardActions>
    </Card >
  );
}


