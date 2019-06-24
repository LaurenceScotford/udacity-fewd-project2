# Udacity Front-End Web Developer Nanodegree
## Project 2 - Build a Portfolio Site
This project is a responsive HTML5 game. It's a version of the popular memory game, traditionally played with a physical deck of cards. In this game, the player reveals hidden images in pairs. There are 8 pairs of images and the aim of the game is to match all 8 pairs as quickly as possible.

To play the game, the player simply clicks on a pair of hidden images one at a time. When clicked, the images will be revealed. If they match they'll stay revealed, while non-matching tiles will be hidden again.

Once the player has matched all 8 tiles, they will be awarded from 1 to 3 stars based on how long they took and how many moves they made.

### Target platforms
This game is designed for recent browsers (across multiple devices including phones, tablets and laptops/desktop PCs) that support HTML5.

### Features

- Responsive game - works at wide range of screen sizes, orientations and devices
- Uses icon glyph fonts to offer attractive game visuals without the use of bandwidth-hungry images
- Offers three different icon sets to play with (and a structure that allows for easy addition of more)
- The player's star rating is based on both time and moves - to get the best star rating you need to use a small number of moves in a short time (being very quick but using a large number of moves, or using a small number of moves but taking a long time, are both cases that will incur a star penalty)
- Developer feature for testing (enabled by setting the DEBUG constant to true in app.js) - this shows a grid of the underlying icon indexes in the developer console, allowing for easy testing

### Font sources
The following fonts were used for this project:
- Abel by MADType, available from [fonts.google.com](https://fonts.google.com/specimen/Abel)
- [Icons](https://material.io/tools/icons/?style=baseline) by Material Design
