/**
 * @format
 */

import {AppRegistry} from 'react-native';
import {Welcome} from './src/pages/Welcome.tsx';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => Welcome);
