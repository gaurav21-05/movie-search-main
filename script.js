// JavaScript code for API calls and other functionalities
const apiKey = 'a97d7639'; // Replace with your actual OMDB API key

// Function to show the loader
function showLoader() {
    document.getElementById('loaderContainer').style.display = 'flex';
}

// Function to hide the loader
function hideLoader() {
    document.getElementById('loaderContainer').style.display = 'none';
}

// Function to fetch movie details by IMDb ID
async function getMovieDetailsById(imdbID) {
    const response = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`);
    const data = await response.json();
    return data;
}

// Function to add a movie to a playlist
function addMovieToPlaylist(playlistType, imdbID) {
    getMovieDetailsById(imdbID)
        .then(movie => {
            if (movie) {
                const playlistName = prompt(`Enter the name of the ${playlistType} playlist you want to add this movie to:`);
                if (playlistName !== null && playlistName.trim() !== '') {
                    let playlists = JSON.parse(localStorage.getItem(`${playlistType}Playlists`)) || {};

                    if (!playlists[playlistName]) {
                        playlists[playlistName] = {}; // Initialize an object for the playlist
                    }

                    // Use IMDb ID as the key for the movie in the playlist
                    playlists[playlistName][imdbID] = movie;
                    console.log(playlists)

                    localStorage.setItem(`${playlistType}Playlists`, JSON.stringify(playlists));
                    alert(`The movie "${movie.Title}" has been added to the ${playlistType} playlist "${playlistName}"!`);
                    displayPlaylists('public');
                    displayPlaylists('private');
                }
            } else {
                console.error('Error fetching movie details.');
            }
        });
}

document.getElementById('searchButton').addEventListener('click', () => {
    const searchInput = document.getElementById('searchInput').value;

    // Show the loading spinner
    showLoader();
    fetch(`https://www.omdbapi.com/?s=${searchInput}&apikey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            // Hide the loading spinner
            hideLoader();
            document.getElementById('searchResults').innerHTML = '';

            if (data.Response === 'True') {
                data.Search.forEach(movie => {
                    const movieItem = document.createElement('div');
                    movieItem.classList.add('movie-item');
                    movieItem.innerHTML = `
                        <img src="${movie.Poster === 'N/A' ? 'placeholder.jpg' : movie.Poster}" alt="${movie.Title}">
                        <div>
                            <h3>${movie.Title}</h3>
                            <p>Year: ${movie.Year}</p>
                            <p>Type: ${movie.Type}</p>
                            <button class="add-to-public" onclick="addMovieToPlaylist('public', '${movie.imdbID}')">Add to Public Playlist</button>
                            <button class="add-to-private" onclick="addMovieToPlaylist('private', '${movie.imdbID}')">Add to Private Playlist</button>
                        </div>
                    `;
                    document.getElementById('searchResults').appendChild(movieItem);
                });
            } else {
                const noResults = document.createElement('p');
                noResults.textContent = 'No movies found.';
                document.getElementById('searchResults').appendChild(noResults);
            }
        })
        .catch(error => {
            console.error('Error fetching movie data:', error);
        });

});

document.getElementById('createPublicPlaylist').addEventListener('click', () => {
    const playlistInput = document.getElementById('playlistInput').value.trim();

    if (playlistInput !== '') {
        const existingPublicPlaylists = JSON.parse(localStorage.getItem('publicPlaylists')) || {};
        if (!existingPublicPlaylists[playlistInput]) {
            existingPublicPlaylists[playlistInput] = {}; // Initialize an object for the playlist
            localStorage.setItem('publicPlaylists', JSON.stringify(existingPublicPlaylists));
            displayPlaylists('public');
        } else {
            alert('Playlist already exists.');
        }
    } else {
        alert('Please enter a valid playlist name.');
    }
});

document.getElementById('createPrivatePlaylist').addEventListener('click', () => {
    const playlistInput = document.getElementById('playlistInput').value.trim();

    if (playlistInput !== '') {
        const existingPrivatePlaylists = JSON.parse(localStorage.getItem('privatePlaylists')) || {};
        if (!existingPrivatePlaylists[playlistInput]) {
            existingPrivatePlaylists[playlistInput] = {}; // Initialize an object for the playlist
            localStorage.setItem('privatePlaylists', JSON.stringify(existingPrivatePlaylists));
            displayPlaylists('private');
        } else {
            alert('Playlist already exists.');
        }
    } else {
        alert('Please enter a valid playlist name.');
    }
});

// Function to display playlists
function displayPlaylists(type) {
    const playlistsDiv = document.getElementById(`${type}Playlists`);
    playlistsDiv.innerHTML = '';
    const playlists = JSON.parse(localStorage.getItem(`${type}Playlists`)) || {};

    const playlistsHeading = document.createElement('h1');
    playlistsHeading.textContent = `${type} Playlists`;
    playlistsDiv.appendChild(playlistsHeading);

    const playlistNames = Object.keys(playlists);
    if (playlistNames.length === 0) {
        const noPlaylistsMsg = document.createElement('p');
        noPlaylistsMsg.textContent = `No ${type} playlists found.`;
        playlistsDiv.appendChild(noPlaylistsMsg);
    } else {
        playlistNames.forEach(playlist => {
            const playlistContainer = document.createElement('div');
            playlistContainer.classList.add('playlist-container');

            const playlistItem = document.createElement('div');
            playlistItem.classList.add('playlist-item');
            playlistItem.textContent = playlist;

            // Add click event listener to display series in the playlist
            playlistItem.addEventListener('click', () => {
                displaySeriesInPlaylist(type, playlist, playlistContainer);
            });

            playlistContainer.appendChild(playlistItem);
            playlistsDiv.appendChild(playlistContainer);
        });
    }
}

// Function to display series in a playlist
function displaySeriesInPlaylist(type, playlist, container) {
    const playlists = JSON.parse(localStorage.getItem(`${type}Playlists`)) || {};
    const playlistSeries = playlists[playlist];

    container.innerHTML = '';

    const playlistHeading = document.createElement('h2');
    playlistHeading.textContent = `${type} Playlist - ${playlist}`;
    container.appendChild(playlistHeading);

    if (!playlistSeries || Object.keys(playlistSeries).length === 0) {
        const noSeriesMsg = document.createElement('p');
        noSeriesMsg.textContent = `No series found in this playlist.`;
        container.appendChild(noSeriesMsg);
    } else {
        const seriesList = document.createElement('ul');
        Object.values(playlistSeries).forEach(series => {
            const seriesItem = document.createElement('li');
            seriesItem.textContent = series.Title;
            seriesList.appendChild(seriesItem);
        });
        container.appendChild(seriesList);
    }
}


// Display initial playlists on page load
displayPlaylists('public');
displayPlaylists('private');
