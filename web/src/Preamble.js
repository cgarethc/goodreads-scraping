import React from 'react';
import Typography from '@material-ui/core/Typography';

export default function Preamble(props) {
  return (
    <>
      <Typography gutterBottom>
        This simple tool compares <a href="https://goodreads.com">Goodreads</a> lists with the digital resources
          (eBooks and eAudioBooks) available at <a href="https://www.aucklandlibraries.govt.nz/">Auckland Libraries</a> or <a href="https://wcl.govt.nz/">Wellington Libraries</a> to help you find your next great read.
          The lists include winners of major literature awards to make sure you're sticking
          to the <strong>really</strong> good stuff 😉.
      </Typography>
      <Typography gutterBottom>
        I've done my best to de-duplicate books as much as possible. You'll notice that there are multiple eBook
        and eAudiobook editions for some books. These are usually from different publishers and are still worth
        checking to see if one edition is available when another is already checked out.
    </Typography>
    </>
  );
}