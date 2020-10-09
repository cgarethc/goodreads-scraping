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

    let libraryIcon;
    if (bookToDisplay.itemType === 'eAudiobook' || bookToDisplay.itemType === 'eAudioBook') {
        libraryIcon = (<HeadsetIcon />);
    }
    else {
        libraryIcon = (<LocalLibraryIcon />);
    }

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
            <CardActions>
                <Button size="small" href={bookToDisplay.goodreadsURL}>Goodreads</Button>
                <Tooltip title={bookToDisplay.itemType} aria-label={bookToDisplay.itemType}><Button size="small" href={bookToDisplay.libraryURL} endIcon={libraryIcon}>Library</Button></Tooltip>
                <Typography>{bookToDisplay.editions.length}</Typography>
            </CardActions>
        </Card >
    );
}


