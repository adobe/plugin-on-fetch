# On Fetch Plugin

The On Fetch Plugin will run custom JS per source on right before fetching. This plugin is based on [envelop's onFetch hook](https://the-guild.dev/graphql/mesh/docs/plugins/plugins-introduction#mesh-specific-plugin-hooks).

Syntax:

```JSON
"plugins": [
      {
        "onFetch": [
          {
            "source": "Source1",
            "handler": "./Source1HandleOnFetch.js"
          },
          .
          .
          .
          .
          {
            "source": "SourceN",
            "handler": "./SourceNHandleOnFetch.js"
          }
        ]
      }
    ],
```
