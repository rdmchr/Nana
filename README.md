# Nana

Open ports in the Hetzner Cloud firewall for your current IP address.

Nana is a simple Docker container that creates a firewall rule that allows traffic on a given port from your current IP address.
It uses the Hetzner Cloud API to create the rule.

> [!WARNING]  
> This tool will remove/overwrite any existing rules that the given firewall has.
> I use two firewalls, one managed by Nana and one managed manually for all other rules I might need.

## Environment Variables

- *HETZNER_API_TOKEN*: A Hetzner Cloud API token for your project.
- *HETZNER_FIREWALL_ID*: The ID of the firewall you want to modify.
- *HETZNER_FIREWALL_PORT*: The port you want to open. (Nana always opens the port for TCP traffic, default: 7000)
- *NANA_CRON*: The cron schedule for Nana to run. (Default: `0 0 */6 * * *`, every 6 hours)
- *NANA_RUN_ON_START*: Run the script immediately on container start. (Default: `true`)
- *NANA_AKANE_URL*: URL of your [Akane instance](https://github.com/rdmchr/akane)

## Example

```yaml
services:
  nana:
    image: ghcr.io/rdmchr/nana:latest
    restart: always
    environment:
      HETZNER_API_TOKEN: "your-api-token"
      HETZNER_FIREWALL_ID: "123456"
      HETZNER_FIREWALL_PORT: "7000"
      NANA_CRON: "0 0 */6 * * *"
```
