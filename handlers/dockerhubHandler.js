/**
 * Created by miha on 02/08/2018.
 */

var exec = require("child_process").exec;

function handleEvent(repo_name, tag) {

  var matched_actions = getMatchingActions(repo_name, tag);

  // execute actions on matching events
  if (matched_actions.length > 0) {

    matched_actions.forEach(function (action) {
      console.info('[DockerHub]', 'Executing action:', action.action_name)

      exec(action.command, function (error, stdout, stderr) {
        error && console.error('[DockerHub]', action.action_name + ' action execution error:', error)
        stdout && console.info('[DockerHub]', action.action_name + ' action response:', stdout)
        stderr && console.warn('[DockerHub]', action.action_name + ' action error response', stderr)
      });

    })

    return true;

  } else {
    console.info('[DockerHub]', 'No matching DockerHub actions found for ', repo_name, tag)
    return false;
  }

}

function getMatchingActions(repo_name, tag) {
  var actions = require("../config.json").dockerhub_webhooks.actions

  // TODO: implement more flexible filtering
  // - dynamic attributes matching
  // - regex values
  var matched_actions = actions.filter(function (action) {

    return action.repo_name === repo_name && action.tag === tag;
  })

  return matched_actions;
}

exports.handleEvent = handleEvent;
