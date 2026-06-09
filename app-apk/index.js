import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';
import App from './App';

// Register the background task
AppRegistry.registerHeadlessTask('SmsTask', () => require('./SmsTask'));

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
registerRootComponent(App);
