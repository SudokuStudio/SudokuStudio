import './css/index.scss';
import './../node_modules/normalize.css/normalize.css';

import App from './App.svelte';

const app = new App({
    target: document.body,
    props: {
        name: 'world'
    }
});

export default app;
