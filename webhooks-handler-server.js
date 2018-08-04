#!/usr/local/bin/node

var http = require("http"),
  url = require("url");

var githubHandler = require("./handlers/githubHandler"),
  dockerhubHandler = require("./handlers/dockerhubHandler");

var config = require("./config.json");
var host = config.server_config.host,
  port = config.server_config.port;

require('console-stamp')(console, 'yyyy-mm-dd HH:MM:ss.l')

process.on("uncaughtException", function (err) {
  console.error("[exception] " + err);
});

http
  .createServer(function (req, res) {
    var payload = "";

    req.on("data", function (chunk) {
      payload += chunk;
    });

    req.on("end", function () {

      console.info(req.method, req.url, 'received from ', req.headers['user-agent']);

      // parse request data
      var data = JSON.parse(payload);

      // console.info('data', data);
      // console.info('request', req);

      // handle paths
      switch (req.url) {

        case config.github_webhooks.api_path:

          // verify request signature
          var is_signature_correct = githubHandler.verifyGitHubSignature(req.headers['x-hub-signature'], payload)
          if (!is_signature_correct) {
            res.writeHead(401, "Not Authorized", {"Content-Type": "text/html"});
            res.end("Not Authorized");
            return;
          }

          // validate event data
          if (!githubHandler.validateRequestEventData(data)) {
            res.writeHead(400, "Bad Request", {"Content-Type": "text/html"});
            res.end("Bad Request");
            return;
          }

          if (githubHandler.handleEvent(data.repository.full_name, data.ref, req.headers["x-github-event"])) {
            res.writeHead(200, "OK", {"Content-Type": "text/html"});
            res.end("OK");
          } else {
            res.writeHead(404, "Not Found", {"Content-Type": "text/html"});
            res.end("Not Found");
          }

          break;

        case config.dockerhub_webhooks.api_path:

          if(dockerhubHandler.handleEvent(data.repository.repo_name, data.push_data.tag)) {
            res.writeHead(200, "OK", {"Content-Type": "text/html"});
            res.end("OK");
          } else {
            res.writeHead(404, "Not Found", {"Content-Type": "text/html"});
            res.end("Not Found");
          }

          break;

        default:
          res.writeHead(404, "Not found", {"Content-Type": "text/html"});
          res.end("404 Not found");
          console.info("[404] " + req.method + " to " + req.url);
      }

    });

  })
  .listen(port, host);

console.info("Server running at http://" + host + ":" + port);