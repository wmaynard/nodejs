
/**

Mighty Gumball, Inc.
Version 1.0

- Rudimentary Page Templates using RegEx
- REST Client Calling Go REST API 

NodeJS-Enabled Standing Gumball
Model# M102988
Serial# 1234998871109

**/

//var addr = "https://5ee08c2cd3da402ea818f1a5dfa6f8b1.vfs.cloud9.us-east-1.amazonaws.com/";
//var machine = addr + "gumball";
//var endpoint = addr + "order";
var machine = "http://api.nguyenresearch.com:8080/gumball";
var endpoint = "http://api.nguyenresearch.com:8080/order";


var fs = require('fs');
var express = require('express');
var Client = require('node-rest-client').Client;

var app = express();
app.use(express.bodyParser());
app.use("/images", express.static(__dirname + '/images'));

var page = function( req, res, state ) {
    var body = fs.readFileSync('./gumball.html');
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);

    var client = new Client();
            var count = "";
            client.get( machine, 
                function(data, response_raw){
                    console.log(data);
                    jsdata = JSON.parse(data)
                    for(var key in jsdata) {
                        console.log( "key:" + key + ", value:" + jsdata[key] );
                    }                   
                    count = jsdata.CountGumballs
                    console.log( "count = " + count ) ;
                    var msg =   "\n\nMighty Gumball, Inc.\n\nNodeJS-Enabled Standing Gumball\nModel# " + 
                                jsdata.ModelNumber + "\n" +
                                "Serial# " + jsdata.SerialNumber + "\n" +
                                "State: " + state + "\n" + 
                                "Inventory: " + count + "\n" ;
                    var html_body = "" + body ;
                    var html_body = html_body.replace("{message}", msg );
                    var html_body = html_body.replace(/id="state".*value=".*"/, "id=\"state\" value=\""+state+"\"") ;
                    res.end( html_body );
            });
}

var order = function(req, res) {
    var client = new Client();
            var count = 0;
            client.get( machine, 
                function(data, response_raw) {
                    jsdata = JSON.parse(data)
                    count = jsdata.CountGumballs ;
                    console.log( "count before = " + count ) ;
                    if ( count > 0 )
                        count-- ;
                    console.log( "count after = " + count ) ;
                    var args = {
                        data: {  "CountGumballs": count },
                        headers:{"Content-Type": "application/json"} 
                    };
                    client.put( machine, args,
                        function(data, response_raw) {
                            console.log(data);
                            page( req, res, "no-coin" ) ;
                        } 
                    );
            });
}

var handle_post = function (req, res) {
    console.log( "Post: " + "Action: " +  req.body.event + " State: " + req.body.state + "\n" ) ;
    var state = "" + req.body.state ;
    var action = "" + req.body.event ;
    if ( action == "Insert Quarter" ) {
        if ( state == "no-coin" )
            page( req, res, "has-coin" ) ;
        else
            page( req, res, state ) ;
            
    }
    else if ( action == "Turn Crank" ) {
        if ( state == "has-coin" ) {
            order(req, res) ;
        }
        else
             page( req, res, state ) ;
    }    
}

var handle_get = function (req, res) {
    console.log( "Get: ..." ) ;
    page( req, res, "no-coin" ) ;
}

app.set('port', (process.env.PORT || 8080));

app.post("*", handle_post );
app.get( "*", handle_get ) ;

console.log( "Server running on Port 8080..." ) ;

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


