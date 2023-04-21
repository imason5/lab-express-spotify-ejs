require("dotenv").config();

const express = require("express");
const expressLayouts = require("express-ejs-layouts");

// require spotify-web-api-node package here:
const SpotifyWebApi = require("spotify-web-api-node");

const app = express();

app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

// setting the spotify-api goes here:

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );

// Our routes go here:

// Home Page

app.get("/", (req, res) => {
  res.render("index"); //middleware will automatically look for a file named layout.ejs in the views folder if no layout is explicitly specified
});

// Artist Search
app.get("/artist-search", async (req, res) => {
  const { artistSearched } = req.query;
  console.log(artistSearched);

  try {
    const data = await spotifyApi.searchArtists(artistSearched);

    const artistsArray = data.body.artists.items;

    res.render("artist-search-results", { artistsArray });
  } catch (err) {
    console.log("The error while searching artists occurred: ", err);
  }
});

// Artist search by ID
app.get("/albums/:artistId", async (req, res, next) => {
  try {
    const { artistId } = req.params;
    const data = await spotifyApi.getArtistAlbums(artistId);
    const albumsArray = data.body.items;
    console.log(albumsArray[0]);
    res.render("albums", { albumsArray });
  } catch (err) {
    console.log("The error while getting artist's albums occurred: ", err);
    next(err);
  }
});

// Tracks search by album ID
app.get("/tracks/:albumId", async (req, res, next) => {
  const { albumId } = req.params;

  try {
    const data = await spotifyApi.getAlbumTracks(albumId);
    const tracksArray = data.body.items;
    res.render("tracks", { tracksArray });
  } catch (err) {
    console.log("Error getting tracks:", err);
    next(err);
  }
});

app.listen(3000, () =>
  console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊")
);
