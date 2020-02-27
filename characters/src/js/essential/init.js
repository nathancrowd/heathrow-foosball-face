import { main } from './main';
import * as faces from './faces';
import jank from "./jank";

document.addEventListener('DOMContentLoaded', () => {

    document.body.appendChild( stats.dom );

    jank();
    faces.init();
    main();
}, false);