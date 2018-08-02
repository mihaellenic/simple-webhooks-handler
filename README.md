# What is simple-webhooks-handler?
A simple configurable HTTP server written in NodeJS for executing simple actions (shell commands or scripts) on GitHub and DockerHub Webhooks.

# Webhooks Handler Server configuration
Configuration is done inside `config.json` file. You can use provided `config.sample.json` file as template for creating you own configuration.

Sample configuration file:
```
{
    "server_config": {
        "host": "0.0.0.0",
        "port": 9000
    },
    "github_webhooks": {
        "api_path": "/github-webhooks",
        "secret": "secret_key",
        "actions": [
            {
                "action_name": "Sample project action",
                "repository_full_name": "sample-user/sample-project",
                "ref": "refs/heads/develop",
                "event": "push",
                "command": "echo Hello world GitHub!"
            }
        ]
    },
    "dockerhub_webhooks": {
        "api_path": "/dockerhub-webhooks",
        "actions": [
            {
                "action_name": "Sample project docker action",
                "repo_name": "sample-user/sample-project",
                "tag": "latest",
                "command": "echo Hello world DockerHub!"
            }
        ]
    }
}
```

Following is the description of all configuration parameters.

Server configuration:
- `server_config.host`: local interface to expose the server on. Use `0.0.0.0` or specific local interface IP address or hostname to expose the server.
- `server_config.port`: local port to expose the server on.

GitHub Webhooks Handler configuration:
- `github_webhooks.api_path`: API path to listen for GitHub Webhooks
- `github_webhooks.secret`: Secret key used the webhook signature validation. The same secret key should be entered in the GitHub Webhook configuration:
- `github_webhooks.actions`: list of actions
- `action.action_name`: User friendly action name (used for console logs)
- `action.repository_full_name`: The full name of GitHub repository
- `action.ref`: The name of the fully qualified reference
- `action.event`: GitHub Webhook event
- `action.command`: The shell command to execute

DockerHub Webhook Handler configuration:
- `dockerhub_webhooks.api_path`: API path to listen for DockerHub Webhooks
DockerHub Webhook configuration:
- `dockerhub_webhooks.actions`: list of actions
- `action.action_name`: User friendly action name (used for console logs)
- `action.repo_name`: The full name of DockerHub repository
- `action.tag`: Docker image tag
- `action.command`: The shell command to execute


# GitHub Webhook configuration
- `Payload URL` - URL of webhook handler server (i.e. http://my-domain-or-ip:9000)
- `Content Type` - Currently only `application/json` content type is supported
- `Secret` - Secret key used for webhook signature validation. The same secret key should be entered in the webhook server configuration (`server_config.secret`)
