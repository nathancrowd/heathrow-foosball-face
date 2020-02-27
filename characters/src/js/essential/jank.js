export default function () {
    var interval = null;

    var button = document.createElement("button");
    button.style.position = 'absolute';
    button.style.left = '100px';
    button.style.top = '100px';
    button.innerHTML = "START JANK";
    document.body.prepend(button);

    button.addEventListener('click', function () {

        if (interval === null) {

            interval = setInterval(jank, 1000 / 60);

            button.textContent = 'STOP JANK';

        } else {

            clearInterval(interval);
            interval = null;

            button.textContent = 'START JANK';
            result.textContent = '';
        }
    });

    var result = document.createElement('div');
    result.style.position = 'absolute';
    document.body.prepend(result);

    function jank() {
        var number = 0;
        for (var i = 0; i < 50000000; i++) {
            number += Math.random();
        }
        result.textContent = number;
    }

}
