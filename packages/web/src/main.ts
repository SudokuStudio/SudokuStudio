import './css/index.scss';
import 'normalize.css';
import '../../../node_modules/@material/ripple/dist/mdc.ripple.min.css';

import { initUserAndBoard } from './js/init';
initUserAndBoard();

import App from './App.svelte';
const app = new App({
    target: document.body,
});

export default app;
