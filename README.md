# Coloured Light Live

The application allows an audience of about 6 to 24 people (without any mandatory limit) to play with lights and forms appearing on a squared projection screen. It is loosely inspired by the *Farbenlichtspiele* created at the Bauhaus in Weimar in the 1920th and has been developped for a workshop on the work by Ludwig Hirschfeld Mack at the *Museum für Kunst und Kultur* held by Corinne Schweizer and Peter Böhm with Maria Pina Galofaro, Aleksandar Popović, Norbert Schnell and Tom Waibl in February 2019.

To install the application (requires `node.js` and optionally `git`):
* check out the repository using `git` or download and unzip the code
* open a shell/terminal and change the current directory to the downloaded (unzipped) project directory
* run `npm install`

To run the application:
* run `npm run watch` in the project directory in an open a shell/terminal
* start the *controller* client, open the URL `<server address>:<port>/controller` in your browser 
* start a *display* client, open the URL `<server address>:<port>/display` in your browser
* start a *light* client, open the URL `<server address>:<port>/light` in your mobile browser
* start a *form* client, open the URL `<server address>:<port>/form` in your mobile browser

The port used by default is `8000`.

While the *display* client is meant to be projected on a large screen. Participants may open a *light* or *form* client on their mobile device (after the *display* client). The *controller* client allows for enabling the application in two modes, *rehearsal* and *performance*, (usually one after the other) and for controlling various parameters of the application.

The application is based on the [Soundworks](https://github.com/collective-soundworks/soundworks) framework.
