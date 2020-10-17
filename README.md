# Drag and Drop Project Manager

## Intro
This is a small project when I was taking Maximilian Schwarzmüller's *Understanding TypeScript - 2020 Edition* course. This project leverages Typescript features such as decorators, generics and interfaces, so as to update UI accordingly and allow the drag and drop behaviors.


## Getting Start
Before installing the App, make sure you have installed Typescript globally using `npm install -g typescript`.

Run 
```
npm install
tsc
```

 to install all necessary node modules and compile TypeScript to browser-readable format.


To start the project, run `npm run start` to open the project in your local browser, at **port 3000**.


## Known Issue
When user drops an item, the following error might occur:
> Uncaught TypeError: this._drop is not a function at Object.handleEvent (event.js:510)

I am still working on identifying the cause for this issue. However, all functionalities will perform normally even with this bug.

