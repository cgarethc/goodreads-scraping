import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
    root: {
        minWidth: 275,
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
});

export default function Book(book) {
    const bookToDisplay = book.book;
    console.log(book);
    const classes = useStyles();

    return (
        <Card className={classes.root}>
            <CardContent>
                <Typography className={classes.title} color="textSecondary" gutterBottom>
                    {bookToDisplay.itemType}
                </Typography>
                <Typography variant="h5" component="h2">
                    {bookToDisplay.title}
                </Typography>
                <Typography className={classes.pos} color="textSecondary">
                    {bookToDisplay.author}
                </Typography>
                <Typography variant="body2" component="p">
                    {bookToDisplay.awardType}
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small" href={bookToDisplay.goodreadsURL}>Goodreads</Button>
                <Button size="small" href={bookToDisplay.libraryURL}>Library</Button>
            </CardActions>
        </Card>
    );
}


