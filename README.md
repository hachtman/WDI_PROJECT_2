## JACK FULLER - WDI PROJECT 2


# Where am I?

# Goals
Understand APIs, get more familiar with an express back end and more confident with jQuery. I also wanted to get more confident with ES6 syntax.

## Technology
The project was built with an Express back-end, MongoDB database and a mixture of jQuery and JavaScript on the front end. The full list of dependencies can be found in ```package.json```.

## Planning

#### Ideation
I initially wanted to use an ordnance survey API to map various sets of boundaries in the UK and use a heat map to display another set of data such as traffic accidents. In the end however I decided to try and make a game out of Google maps. The goal was to test users' geographical knowledge by dropping them in a random location on  Google street view and having them guess where they were.

#### Design
I made the decision at the beginning to use the Skeleton CSS framework as I really didn't forsee the need for many pre built components. Though it doesn't have any stock components, they're all attractively styled by default and serve as a good fall back if styling time is short!

I wanted the focus to be on the map while the app was in use. Using a very minimal palette of whites and greys for the buttons and borders really made the often bright and beautiful colors of the map pop out. I chose Raleway as the main font, often using the 'light' version, for similar reasons. 

![screen shot 2017-02-06 at 10 28 32](https://cloud.githubusercontent.com/assets/18048279/22643615/2eac5328-ec57-11e6-8f84-7fa15970c489.png)
<i>The homepage, showing the minimal styling. The home link is accented in red, as it the register button when the user is logged out.</i>


#### Pseudo-Code
MVP was to display two maps on the page, pick a random location on street view, collect user input from the minimap and compare their guess with the answer.


## Challenges
The socring system
Measuring the distance between the two coordinates.
Choosing ranom coordinates.
Searching for a valid street view.
Control flow in a big single app.

## Outcomes
