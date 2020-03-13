
const domain_port = "127.0.0.1:8000";


export default class Server {

    constructor() {
        this.linked = false;

        var ws = new WebSocket('ws://' + domain_port + '/ws');
        console.log('SERVER: Connecting...')
        ws.onmessage = function (event) {
            var data = JSON.parse(event.data);
            console.log(data)
            switch(data['message']){
                case 'linked':
                    this.linked = true;
                    console.log('SERVER: Connected')
            }
        };

        ws.onopen = function(event){
            ws.send('linked');
        }



        function get_age_sex(){
            var age_sex = ws.send(content);
            console.log(age_sex, 111);
        }
    }
}