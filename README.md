Based on [ELECTRON](https://electronjs.org/).

## Getting Started

### Prerequisites

ELECTRON is based on Node.js, in order to run an electron app you need to [install Node.js](https://nodejs.org/en/download/)

To check that Node.js and npm are install :
```
node -v
npm -v
```
Before using the application you have to update the dependancies. Launch the cmd in the main folder of the project and use :
```
npm update
```

### Running the app

Open the cmd in the main folder of the project, then use the following command :
```
npm start
```

## Files organisation
- **main.js** : Manage the Electron app and events with the system
- folder **vendor** : external dependancies
- folder **ressources** : where the app stock files
- folder **node_modules** : NPM dependancies
- folder **app** : App source code and configuration
