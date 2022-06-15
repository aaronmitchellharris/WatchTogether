
# WatchTogether

Web application that allows users to watch YouTube videos in real time with invited guests

## Quickstart Guide

* Navigate to the [hosted site](https://aaronmitchellharris.github.io/WatchTogether)
* Click the button that says **Create New Room**
* Invite guests by sharing the room **code** or room **link** on the bottom left of the page
    * If sharing the room **code**, guests will need to visit [the hosted site](https://aaronmitchellharris.github.io/WatchTogether) and enter the code in the form
    * If sharing the room **link**, guests simply need to visit the link in their preferred web browser
* Copy and paste a link to a YouTube video at the bottom of the page
* Anyone can play, pause, or change the time, and the video will update synchronously for everyone else

## Server Built With
* [Node.js](https://nodejs.org/en/)
* [Express](https://expressjs.com/)
* [ws](https://github.com/websockets/ws)

## Client Built With
* [Angular](https://angular.io/) + [YouTube Player component](https://github.com/angular/components/tree/main/src/youtube-player)
* [RxJS](https://rxjs.dev/)
* [NGX Cookie Service](https://github.com/stevermeister/ngx-cookie-service)
