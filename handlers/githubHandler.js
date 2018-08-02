/**
 * Created by miha on 02/08/2018.
 */

var crypto = require("crypto"),
  exec = require("child_process").exec;

function handleEvent(repository_full_name, ref, github_event) {

  var matched_actions = getMatchingActions(repository_full_name, ref, github_event);

  // execute actions on matching events
  if (matched_actions.length > 0) {

    matched_actions.forEach(function (action) {
      console.info('[GitHub]', 'Executing action:', action.action_name)

      exec(action.command, function (error, stdout, stderr) {
        error && console.error('[GitHub]', action.action_name + ' action execution error:', error)
        stdout && console.info('[GitHub]', action.action_name + ' action response:', stdout)
        stderr && console.warn('[GitHub]', action.action_name + ' action error response', stderr)
      });

    })

    return true;

  } else {
    console.info('[GitHub]', 'No matching GitHub actions found for ', repository_full_name, ref, github_event)
    return false;
  }

}

function validateRequestEventData(data) {
  // console.log('validateRequestEventData', data)
  return data && data.repository && data.repository.full_name && data.ref
}

// generates a signature (HMAC hex digest of the payload. Generated using the sha1 hash function and the secret as the HMAC key)
// and does a time safe compare to the signature receieved in the header
function verifyGitHubSignature(x_hub_signature_header, payload) {
  var secret = require("../config.json").github_webhooks.secret;

  if (!x_hub_signature_header && !secret) {
    console.warn('[GitHub]', 'Secret is not set on this webhook. Consider setting it up to improve security.')
    return true;
  } else if (!x_hub_signature_header && secret) {
    console.error('[GitHub]', 'Secret is configured on the local server but the Webhook did not contain signature header.');
    return false;
  } else if (x_hub_signature_header && !secret) {
    console.error('[GitHub]', 'Webhook contains a signature header but the secret is missing from local server configuration.');
    return false;
  }

  // validate x_hub_signature_header. it should be formatted like: sha1=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  var x_hub_signature = x_hub_signature_header.split('=');
  if (x_hub_signature.length !== 2 || x_hub_signature[0] !== 'sha1' || x_hub_signature[1].length !== 40) {
    console.error('[GitHub]', 'Request signature is not valid (wrong format).');
    return false;
  }

  var hmac = crypto.createHmac('sha1', secret);
  hmac.update(payload);

  // perform a timing safe compare
  var request_signature = x_hub_signature[1];
  var generated_signature = hmac.digest('hex');

  // console.log('Request signature', request_signature);
  // console.log('Generated signature', generated_signature);

  var is_signature_valid = crypto.timingSafeEqual(
    Buffer.from(generated_signature, 'utf8'),
    Buffer.from(request_signature, 'utf8'));

  if (!is_signature_valid) {
    console.error('[GitHub]', 'Request signature is not valid.')
  }

  return is_signature_valid;
}


function getMatchingActions(repository_full_name, ref, github_event) {
  var actions = require("../config.json").github_webhooks.actions

  // TODO: implement more flexible filtering
  // - dynamic attributes matching
  // - regex values
  var matched_actions = actions.filter(function (action) {

    return action.repository_full_name === repository_full_name &&
      action.ref === ref &&
      action.event === github_event;

  })

  return matched_actions;
}

exports.handleEvent = handleEvent;
exports.verifyGitHubSignature = verifyGitHubSignature;
exports.validateRequestEventData = validateRequestEventData;