import React from 'react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

import BrightnessAutoIcon from '@material-ui/icons/BrightnessAuto';
import PersonIcon from '@material-ui/icons/Person';
import ComputerIcon from '@material-ui/icons/Computer';
import MenuBookIcon from '@material-ui/icons/MenuBook';


export default function Preamble(props) {
  const [showDetail, setShowDetail] = React.useState(false);

  return (
    <>
      <Typography gutterBottom>
        This simple tool compares <a href="https://goodreads.com">Goodreads</a> lists with the digital resources
          (eBooks and eAudioBooks) available at <a href="https://www.aucklandlibraries.govt.nz/">Auckland Libraries</a> or <a href="https://wcl.govt.nz/">Wellington Libraries</a> to help you find your next great read.          
      </Typography>
      <Box display={showDetail ? 'none' : 'block'}><Button size="small" color="primary" variant="contained" onClick={event=>setShowDetail(true)}>Tell me more</Button></Box>
      <Box display={showDetail ? 'block' : 'none'}>
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