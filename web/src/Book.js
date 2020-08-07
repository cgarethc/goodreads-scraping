import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import HeadsetIcon from '@material-ui/icons/Headset';
import LocalLibraryIcon from '@material-ui/icons/LocalLibrary';
import Grid from '@material-ui/core/Grid';

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
        marginBottom: 12,
    },
    cover: {
        width: 70,
    },
});

export default function Book(book) {
    const bookToDisplay = book.book;
    console.log(book);
    const classes = useStyles();

    return (
        <Card className={classes.root}>
            <CardContent>
                <Grid container spacing={1}>
                    <Grid item>
                        {bookToDisplay.coverURL && <img alt={bookToDisplay.title} src={bookToDisplay.coverURL} />}
                    </Grid>
                    <Grid item>
                        <Typography className={classes.title} color="textSecondary" gutterBottom>
                            {bookToDisplay.itemType}
                            {bookToDisplay.itemType === 'eAudiobook' && <HeadsetIcon />}{bookToDisplay.itemType === 'eBook' && <LocalLibraryIcon />}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid container spacing={1}>
                    <Grid item>
                        <Typography variant="h5" component="h2">
                            {bookToDisplay.title}
                        </Typography>
                    </Grid>
                </Grid>
                <Typography className={classes.pos} color="textSecondary">
                    {bookToDisplay.author}
                </Typography>
                {bookToDisplay.awardType && <Typography variant="body2" component="p">
                    {bookToDisplay.awardType}
                </Typography>}

            </CardContent>
            <CardActions>
                <Button size="small" href={bookToDisplay.goodreadsURL}>Goodreads</Button>
                <Button size="small" href={bookToDisplay.libraryURL}>Library</Button>
            </CardActions>
        </Card >
    );
}


